import {Timestamp} from 'firebase-admin/firestore';
import {Booking, SpaceType, User} from '../../Models/booking.model';
import {assignSpacesToReserved} from './firebaseSpaceReassignService';
import * as firebaseAdminService from './firebaseAdminService';
import * as bookingUtils from './../../utils/BookingUtils/BookingUtils';
import * as checkBookingCapacity from '../DeskCapacity/checkBookingCapacity';
import sendNotifications from './firebaseMessagingService';
import {Config} from '../../Config';

const mockBatchUpdate = jest.fn();
const mockBatchCommit = jest.fn();
const mockGet = jest.fn();
const mockWhere = jest.fn(() => ({
  get: mockGet,
  where: jest.fn().mockReturnThis(),
  orderBy: jest.fn().mockReturnThis(),
}));

const mockCollection = jest.fn(() => ({
  get: mockGet,
  where: mockWhere,
}));

jest.mock('firebase-admin', () => ({
  initializeApp: jest.fn(),
  firestore: () => ({
    batch: () => ({
      update: mockBatchUpdate,
      commit: mockBatchCommit,
    }),
    collection: mockCollection,
  }),
}));

const getFirestoreUserSpy = jest.spyOn(
  firebaseAdminService,
  'getFirestoreUser',
);

const isBookingDateLimitedToBUSpy = jest.spyOn(
  bookingUtils,
  'isBookingDateLimitedToBU',
);

const checkBookingCapacitySpy = jest.spyOn(
  checkBookingCapacity,
  'checkBookingCapacity',
);

jest.mock('./firebaseMessagingService', () => ({
  __esModule: true,
  default: jest.fn(),
}));

const mockConfig: Config = {
  deskCapacity: 36,
  parkingCapacity: {
    murrayCarCapacity: 6,
    tenzingCarCapacity: 2,
    adamsCarCapacity: 2,
    unknownCarCapacity: 0,
  },
  endpoints: {
    carAPIURL: 'https://carapigen2-qg3ssmjwca-ew.a.run.app',
    deskAPIURL: 'https://deskapigen2-qg3ssmjwca-ew.a.run.app',
    genericAPIURL: 'https://apigen2-qg3ssmjwca-ew.a.run.app',
  },
};

describe('Firebase space reassign Service', () => {
  const dummyBooking = {
    bookingType: 'personal',
    createdAt: new Timestamp(100, 100),
    date: '2023-05-11T00:00:00Z',
    id: '1',
    isReserveSpace: false,
    spaceType: 'desk',
    timeSlot: 'am',
    updatedAt: new Timestamp(100, 100),
    userId: '123',
  } as Booking;
  const dummyUser = {
    id: 'id',
    businessUnit: 'tenzing',
  } as User;
  getFirestoreUserSpy.mockImplementation(async () => dummyUser);

  // Main function and its unit tests
  describe('async function assignSpacesToReserved', () => {
    describe('assignSpacesToReserved when deleted bookings are reserved spaces or not valid', () => {
      it('should do nothing when there are not deleted bookings and returns false', async () => {
        const isSuccess = await assignSpacesToReserved([], mockConfig);
        expect(isSuccess).toBe(false);
        expect(mockGet).toBeCalledTimes(0);
      });

      it('should do nothing when deleted bookings are reserved and returns false', async () => {
        const bookings: Booking[] = [
          {
            ...dummyBooking,
            id: '2',
            timeSlot: 'pm',
            date: '2023-06-15T00:00:00Z',
            isReserveSpace: true,
            createdAt: new Timestamp(100, 100),
          },
          {
            ...dummyBooking,
            id: '3',
            timeSlot: 'am',
            date: '2023-06-15T00:00:00Z',
            isReserveSpace: true,
            createdAt: new Timestamp(101, 101),
          },
        ];
        const isSuccess = await assignSpacesToReserved(bookings, mockConfig);
        expect(isSuccess).toBe(false);
        expect(mockGet).toBeCalledTimes(0);
      });

      it('should do nothing when deleted bookings are of both car and desk space types and returns false', async () => {
        const bookings: Booking[] = [
          {
            ...dummyBooking,
            id: '2',
            timeSlot: 'pm',
            date: '2023-06-15T00:00:00Z',
            isReserveSpace: false,
            spaceType: SpaceType.Enum.car,
            createdAt: new Timestamp(100, 100),
          },
          {
            ...dummyBooking,
            id: '3',
            timeSlot: 'am',
            date: '2023-06-15T00:00:00Z',
            isReserveSpace: false,
            spaceType: SpaceType.Enum.desk,
            createdAt: new Timestamp(101, 101),
          },
        ];
        const isSuccess = await assignSpacesToReserved(bookings, mockConfig);
        expect(isSuccess).toBe(false);
        expect(mockGet).toBeCalledTimes(0);
      });
    });

    describe('assignSpacesToReserved when deleted bookings are not reserved spaces and are of same space type', () => {
      type DocType = {
        data: () => Booking;
        ref: string;
      };

      const deleted: Booking[] = [
        {
          ...dummyBooking,
          id: '2',
          timeSlot: 'pm',
          date: '2023-06-15T00:00:00Z',
          createdAt: new Timestamp(100, 100),
        },
      ];

      beforeEach(() => {
        jest.clearAllMocks();
      });

      it('should not assign any if there are no reserved spaces', async () => {
        const emptyDocs: DocType[] = [];
        isBookingDateLimitedToBUSpy.mockReturnValue(false);
        checkBookingCapacitySpy.mockResolvedValue({am: 1, pm: 1, allDay: 1});
        mockGet.mockImplementation(() => ({
          docs: emptyDocs,
        }));

        const isSuccess = await assignSpacesToReserved(deleted, mockConfig);
        expect(isSuccess).toBe(false);
        expect(mockBatchUpdate).toBeCalledTimes(0);
        expect(mockBatchCommit).toBeCalledTimes(0);
      });

      it('should assign space if there is a booking with a reserved space', async () => {
        const docRef = 'bookingRef';
        const reservedBookingDocs: DocType[] = [
          {
            data: () => ({
              ...dummyBooking,
              id: '3',
              timeSlot: 'pm',
              date: '2023-06-15T00:00:00Z',
              isReserveSpace: true,
            }),
            ref: docRef,
          },
        ];
        mockGet.mockImplementation(() => ({
          docs: reservedBookingDocs,
        }));
        checkBookingCapacitySpy.mockResolvedValue({am: 1, pm: 1, allDay: 1});

        const isSuccess = await assignSpacesToReserved(deleted, mockConfig);
        expect(isSuccess).toBe(true);
        expect(mockBatchUpdate).toHaveBeenNthCalledWith(1, docRef, {
          isReserveSpace: false,
        });
        expect(mockBatchCommit).toBeCalledTimes(1);
      });

      it('should assign all freed up spaces if there are multiple bookings with reserved spaces', async () => {
        const newDeleted: Booking[] = deleted.concat([
          {
            ...dummyBooking,
            id: '2',
            timeSlot: 'am',
            date: '2023-06-16T00:00:00Z',
            createdAt: new Timestamp(100, 100),
          },
        ]);

        const reservedBookingDocs: DocType[] = [
          {
            data: () => ({
              ...dummyBooking,
              id: '4',
              timeSlot: 'pm',
              date: '2023-06-15T00:00:00Z',
              isReserveSpace: true,
            }),
            ref: 'ref1',
          },
          {
            data: () => ({
              ...dummyBooking,
              id: '5',
              timeSlot: 'am',
              date: '2023-06-16T00:00:00Z',
              isReserveSpace: true,
            }),
            ref: 'ref2',
          },
        ];
        mockGet.mockImplementation(() => ({
          docs: reservedBookingDocs,
        }));
        checkBookingCapacitySpy.mockResolvedValue({am: 1, pm: 1, allDay: 1});

        const isSuccess = await assignSpacesToReserved(newDeleted, mockConfig);
        expect(isSuccess).toBe(true);
        expect(mockBatchUpdate).toHaveBeenCalledWith('ref1', {
          isReserveSpace: false,
        });
        expect(mockBatchUpdate).toHaveBeenCalledWith('ref2', {
          isReserveSpace: false,
        });
        expect(mockBatchCommit).toBeCalledTimes(1);
      });

      it('should have send only one notification about assigning of a car space', async () => {
        const newDeleted: Booking[] = [
          {
            ...dummyBooking,
            id: '3',
            timeSlot: 'pm',
            date: '2023-06-15T00:00:00Z',
            createdAt: new Timestamp(100, 100),
            spaceType: SpaceType.Enum.car,
          },
        ];
        const reservedBookingDocs: DocType[] = [
          {
            data: () => ({
              ...dummyBooking,
              id: '4',
              timeSlot: 'pm',
              date: '2023-06-15T00:00:00Z',
              isReserveSpace: true,
              spaceType: SpaceType.Enum.car,
            }),
            ref: 'ref1',
          },
          {
            data: () => ({
              ...dummyBooking,
              id: '5',
              timeSlot: 'am',
              date: '2023-06-15T00:00:00Z',
              isReserveSpace: true,
              spaceType: SpaceType.Enum.car,
            }),
            ref: 'ref2',
          },
        ];

        isBookingDateLimitedToBUSpy.mockReturnValue(false);
        mockGet.mockImplementation(() => ({
          docs: reservedBookingDocs,
        }));
        checkBookingCapacitySpy.mockResolvedValue({am: 0, pm: 1, allDay: 0});

        const isSuccess = await assignSpacesToReserved(newDeleted, mockConfig);
        expect(isSuccess).toBe(true);
        expect(sendNotifications).toBeCalledTimes(1);
      });

      it('should have send two notifications; one for assigning of a space and other for availability of new alternative', async () => {
        const newDeleted: Booking[] = [
          {
            ...dummyBooking,
            id: '2',
            timeSlot: 'pm',
            date: '2023-06-15T00:00:00Z',
            createdAt: new Timestamp(100, 100),
            spaceType: SpaceType.Enum.car,
          },
          {
            ...dummyBooking,
            id: '3',
            timeSlot: 'pm',
            date: '2023-06-15T00:00:00Z',
            createdAt: new Timestamp(100, 100),
            spaceType: SpaceType.Enum.car,
          },
        ];

        const reservedBookingDocs: DocType[] = [
          {
            data: () => ({
              ...dummyBooking,
              id: '4',
              timeSlot: 'pm',
              date: '2023-06-15T00:00:00Z',
              isReserveSpace: true,
              spaceType: SpaceType.Enum.car,
            }),
            ref: 'ref1',
          },
          {
            data: () => ({
              ...dummyBooking,
              id: '5',
              timeSlot: 'am',
              date: '2023-06-15T00:00:00Z',
              isReserveSpace: true,
              spaceType: SpaceType.Enum.car,
            }),
            ref: 'ref2',
          },
        ];

        isBookingDateLimitedToBUSpy.mockReturnValue(false);
        mockGet.mockImplementation(() => ({
          docs: reservedBookingDocs,
        }));
        checkBookingCapacitySpy.mockResolvedValue({am: 0, pm: 1, allDay: 0});

        const isSuccess = await assignSpacesToReserved(newDeleted, mockConfig);
        expect(isSuccess).toBe(true);
        expect(sendNotifications).toBeCalledTimes(2);
      });
    });
  });
});
