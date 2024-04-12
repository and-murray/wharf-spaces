import {DocumentReference, Timestamp} from 'firebase-admin/firestore';
import * as isBookingDateLimitedToBU from '../../utils/BookingUtils/BookingUtils';
import {BookingCapacity} from '../DeskCapacity/checkBookingCapacity';
import {assignEmptySpacesToReserved} from './assignEmptySpacesToReserved';
import * as getReserveBookings from './getReserveBookings';
import {Booking, User} from '../../Models/booking.model';
import * as getUsersFromBookings from './getUsersFromBookings';
import * as reduceRemainingCapacity from '../../utils/CapacityUtils/CapacityUtils';
import sendNotifications from './firebaseMessagingService';

const mockBatchUpdate = jest.fn();
const mockBatchCommit = jest.fn();
let mockDoc = jest.fn();
let mockGet = jest.fn();
const mockWhere = jest.fn(() => ({
  get: mockGet,
}));
const mockCollection = jest.fn(() => ({
  doc: mockDoc,
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
const getReserveBookingsSpy = jest.spyOn(
  getReserveBookings,
  'getReserveBookings',
);
const isBookingDateLimitedToBUSpy = jest.spyOn(
  isBookingDateLimitedToBU,
  'isBookingDateLimitedToBU',
);
const getUsersFromBookingsSpy = jest.spyOn(
  getUsersFromBookings,
  'getUsersFromBookings',
);
const reduceRemainingCapacitySpy = jest.spyOn(
  reduceRemainingCapacity,
  'reduceRemainingCapacity',
);
jest.mock('./firebaseMessagingService', () => ({
  __esModule: true,
  default: jest.fn(),
}));
describe('Assign Empty Spaces To Reserved', () => {
  let capacity: BookingCapacity = {am: 1, pm: 1, allDay: 1};
  beforeEach(() => {
    capacity = {am: 1, pm: 1, allDay: 1};
    jest.clearAllMocks();
  });
  describe('There are no reserve bookings for given date and spaceType', () => {
    it('returns false', async () => {
      getReserveBookingsSpy.mockResolvedValue([]);
      const result = await assignEmptySpacesToReserved(
        capacity,
        '2023-05-11T00:00:00Z',
        'car',
        'murray',
      );
      expect(result).toEqual(false);
      expect(mockBatchUpdate).not.toBeCalled();
    });
  });

  describe('Has reserved bookings', () => {
    const dummyBooking = {
      bookingType: 'personal',
      createdAt: new Timestamp(100, 100),
      date: '2023-05-11T00:00:00Z',
      id: '1',
      isReserveSpace: true,
      spaceType: 'desk',
      timeSlot: 'am',
      updatedAt: new Timestamp(100, 100),
      userId: '123',
    } as Booking;
    const bookingDocs: {docRef: DocumentReference; data: Booking}[] = [
      {
        docRef: 'bookingRef' as unknown as DocumentReference,
        data: {
          ...dummyBooking,
          id: '123',
          userId: '123',
        },
      },
      {
        docRef: 'bookingRef2' as unknown as DocumentReference,
        data: {
          ...dummyBooking,
          id: '456',
          userId: '456',
          timeSlot: 'allDay',
          createdAt: new Timestamp(50, 50),
        },
      },
      {
        docRef: 'bookingRef3' as unknown as DocumentReference,
        data: {
          ...dummyBooking,
          id: '789',
          userId: '789',
          timeSlot: 'allDay',
          createdAt: new Timestamp(25, 25),
        },
      },
    ];
    const users: User[] = [
      {
        businessUnit: 'murray',
        createdAt: new Timestamp(100, 100),
        email: 'example@example.com',
        firstName: 'User',
        id: '123',
        lastName: 'last name',
        profilePicUrl: 'http',
        role: 'user',
        updatedAt: new Timestamp(100, 100),
      },
      {
        businessUnit: 'murray',
        createdAt: new Timestamp(100, 100),
        email: 'example@example.com',
        firstName: 'User',
        id: '456',
        lastName: 'last name',
        profilePicUrl: 'http',
        role: 'user',
        updatedAt: new Timestamp(100, 100),
      },
      {
        businessUnit: 'tenzing',
        createdAt: new Timestamp(100, 100),
        email: 'example@example.com',
        firstName: 'User',
        id: '789',
        lastName: 'last name',
        profilePicUrl: 'http',
        role: 'user',
        updatedAt: new Timestamp(100, 100),
      },
    ];
    beforeEach(() => {
      getReserveBookingsSpy.mockResolvedValue(bookingDocs);
    });

    describe('Is limited by BU and we are looking at murray capacity', () => {
      beforeEach(() => {
        isBookingDateLimitedToBUSpy.mockReturnValue(true);
      });
      describe('Space type is car', () => {
        beforeEach(() => {
          getUsersFromBookingsSpy.mockResolvedValue(users);
        });

        describe('No business unit is provided', () => {
          it('returns false', async () => {
            await assignEmptySpacesToReserved(
              capacity,
              '2023-05-11T00:00:00Z',
              'car',
              undefined,
            );
            expect(getUsersFromBookingsSpy).toBeCalledTimes(0);
          });
        });
        it('returns true', async () => {
          const result = await assignEmptySpacesToReserved(
            capacity,
            '2023-05-11T00:00:00Z',
            'car',
            'murray',
          );
          expect(result).toEqual(true);
          expect(mockBatchUpdate).toBeCalledTimes(1);
        });
        it('gets users', async () => {
          await assignEmptySpacesToReserved(
            capacity,
            '2023-05-11T00:00:00Z',
            'car',
            'murray',
          );
          expect(getUsersFromBookingsSpy).toBeCalledTimes(1);
        });

        describe('Capacity is one for each slot but has three bookings on reserve list', () => {
          it('Can only update one of these bookings', async () => {
            await assignEmptySpacesToReserved(
              capacity,
              '2023-05-11T00:00:00Z',
              'car',
              'murray',
            );
            expect(mockBatchUpdate).toBeCalledTimes(1);
          });

          it('Updates the booking that was created first and is from murray', async () => {
            await assignEmptySpacesToReserved(
              capacity,
              '2023-05-11T00:00:00Z',
              'car',
              'murray',
            );
            expect(mockBatchUpdate).toBeCalledWith('bookingRef2', {
              isReserveSpace: false,
              updatedAt: {},
            });
          });

          it('updates the booking capacity', async () => {
            await assignEmptySpacesToReserved(
              capacity,
              '2023-05-11T00:00:00Z',
              'car',
              'murray',
            );
            expect(reduceRemainingCapacitySpy).toBeCalledTimes(1);
            expect(reduceRemainingCapacitySpy).toBeCalledWith(
              capacity,
              'allDay',
            );
          });
          it('commits these changes', async () => {
            await assignEmptySpacesToReserved(
              capacity,
              '2023-05-11T00:00:00Z',
              'car',
              'murray',
            );
            expect(mockBatchCommit).toHaveBeenCalled();
          });
        });

        describe('Capacity is two for each slot and has three bookings on reserve list', () => {
          beforeEach(() => {
            capacity = {am: 2, pm: 2, allDay: 2};
          });
          it('Can update both of these bookings', async () => {
            await assignEmptySpacesToReserved(
              capacity,
              '2023-05-11T00:00:00Z',
              'car',
              'murray',
            );
            expect(mockBatchUpdate).toBeCalledTimes(2);
          });

          it('Updates the booking that was created first and is from murray', async () => {
            await assignEmptySpacesToReserved(
              capacity,
              '2023-05-11T00:00:00Z',
              'car',
              'murray',
            );
            expect(mockBatchUpdate).toHaveBeenNthCalledWith(1, 'bookingRef2', {
              isReserveSpace: false,
              updatedAt: {},
            });
            expect(mockBatchUpdate).toHaveBeenNthCalledWith(2, 'bookingRef', {
              isReserveSpace: false,
              updatedAt: {},
            });
          });

          it('updates the booking capacity', async () => {
            await assignEmptySpacesToReserved(
              capacity,
              '2023-05-11T00:00:00Z',
              'car',
              'murray',
            );
            expect(reduceRemainingCapacitySpy).toBeCalledTimes(2);
            expect(reduceRemainingCapacitySpy).toHaveBeenNthCalledWith(
              1,
              capacity,
              'allDay',
            );
            expect(reduceRemainingCapacitySpy).toHaveBeenNthCalledWith(
              2,
              capacity,
              'am',
            );
          });
          it('commits these changes', async () => {
            await assignEmptySpacesToReserved(
              capacity,
              '2023-05-11T00:00:00Z',
              'car',
              'murray',
            );
            expect(mockBatchCommit).toHaveBeenCalled();
          });

          it('notifies users with notifications', async () => {
            await assignEmptySpacesToReserved(
              capacity,
              '2023-05-11T00:00:00Z',
              'car',
              'murray',
            );
            expect(sendNotifications).toBeCalledTimes(2);
          });
        });
      });

      describe('Space type is desk', () => {
        beforeEach(() => {
          getUsersFromBookingsSpy.mockResolvedValue(users);
        });
        it('returns true', async () => {
          const result = await assignEmptySpacesToReserved(
            capacity,
            '2023-05-11T00:00:00Z',
            'desk',
            'murray',
          );
          expect(result).toEqual(true);
          expect(mockBatchUpdate).toBeCalledTimes(1);
        });
        it('does not fetch users', async () => {
          await assignEmptySpacesToReserved(
            capacity,
            '2023-05-11T00:00:00Z',
            'desk',
            'murray',
          );
          expect(getUsersFromBookingsSpy).toBeCalledTimes(0);
        });

        describe('Capacity is one for each slot but has three bookings on reserve list', () => {
          it('Can only update one of these bookings', async () => {
            await assignEmptySpacesToReserved(
              capacity,
              '2023-05-11T00:00:00Z',
              'desk',
              'murray',
            );
            expect(mockBatchUpdate).toBeCalledTimes(1);
          });

          it('Updates the booking that was created first', async () => {
            await assignEmptySpacesToReserved(
              capacity,
              '2023-05-11T00:00:00Z',
              'desk',
              'murray',
            );
            expect(mockBatchUpdate).toBeCalledWith('bookingRef3', {
              isReserveSpace: false,
              updatedAt: {},
            });
          });

          it('updates the booking capacity', async () => {
            await assignEmptySpacesToReserved(
              capacity,
              '2023-05-11T00:00:00Z',
              'desk',
              'murray',
            );
            expect(reduceRemainingCapacitySpy).toBeCalledTimes(1);
            expect(reduceRemainingCapacitySpy).toBeCalledWith(
              capacity,
              'allDay',
            );
          });
          it('commits these changes', async () => {
            await assignEmptySpacesToReserved(
              capacity,
              '2023-05-11T00:00:00Z',
              'desk',
              'murray',
            );
            expect(mockBatchCommit).toHaveBeenCalled();
          });
        });

        describe('Capacity is two for each slot and has three bookings on reserve list', () => {
          beforeEach(() => {
            capacity = {am: 2, pm: 2, allDay: 2};
          });
          it('Can update two of these bookings', async () => {
            await assignEmptySpacesToReserved(
              capacity,
              '2023-05-11T00:00:00Z',
              'desk',
              'murray',
            );
            expect(mockBatchUpdate).toBeCalledTimes(2);
          });

          it('Updates the booking that was created first', async () => {
            await assignEmptySpacesToReserved(
              capacity,
              '2023-05-11T00:00:00Z',
              'desk',
              'murray',
            );
            expect(mockBatchUpdate).toHaveBeenNthCalledWith(1, 'bookingRef3', {
              isReserveSpace: false,
              updatedAt: {},
            });
            expect(mockBatchUpdate).toHaveBeenNthCalledWith(2, 'bookingRef2', {
              isReserveSpace: false,
              updatedAt: {},
            });
          });

          it('updates the booking capacity', async () => {
            await assignEmptySpacesToReserved(
              capacity,
              '2023-05-11T00:00:00Z',
              'desk',
              'murray',
            );
            expect(reduceRemainingCapacitySpy).toBeCalledTimes(2);
            expect(reduceRemainingCapacitySpy).toHaveBeenNthCalledWith(
              1,
              capacity,
              'allDay',
            );
            expect(reduceRemainingCapacitySpy).toHaveBeenNthCalledWith(
              2,
              capacity,
              'allDay',
            );
          });
          it('commits these changes', async () => {
            await assignEmptySpacesToReserved(
              capacity,
              '2023-05-11T00:00:00Z',
              'desk',
              'murray',
            );
            expect(mockBatchCommit).toHaveBeenCalled();
          });

          it('does notnotify users with notifications', async () => {
            await assignEmptySpacesToReserved(
              capacity,
              '2023-05-11T00:00:00Z',
              'desk',
              'murray',
            );
            expect(sendNotifications).toBeCalledTimes(0);
          });
        });
      });
    });

    describe('Is not limited by BU', () => {
      beforeEach(() => {
        isBookingDateLimitedToBUSpy.mockReturnValue(false);
      });
      describe('Space type is car', () => {
        beforeEach(() => {
          getUsersFromBookingsSpy.mockResolvedValue(users);
        });
        it('returns true', async () => {
          const result = await assignEmptySpacesToReserved(
            capacity,
            '2023-05-11T00:00:00Z',
            'car',
            'murray',
          );
          expect(result).toEqual(true);
          expect(mockBatchUpdate).toBeCalledTimes(1);
        });
        it('does not fetch users', async () => {
          await assignEmptySpacesToReserved(
            capacity,
            '2023-05-11T00:00:00Z',
            'car',
            'murray',
          );
          expect(getUsersFromBookingsSpy).toBeCalledTimes(0);
        });

        describe('Capacity is one for each slot but has three bookings on reserve list', () => {
          it('Can only update one of these bookings', async () => {
            await assignEmptySpacesToReserved(
              capacity,
              '2023-05-11T00:00:00Z',
              'car',
              'murray',
            );
            expect(mockBatchUpdate).toBeCalledTimes(1);
          });

          it('Updates the booking that was created first', async () => {
            await assignEmptySpacesToReserved(
              capacity,
              '2023-05-11T00:00:00Z',
              'car',
              'murray',
            );
            expect(mockBatchUpdate).toBeCalledWith('bookingRef3', {
              isReserveSpace: false,
              updatedAt: {},
            });
          });

          it('updates the booking capacity', async () => {
            await assignEmptySpacesToReserved(
              capacity,
              '2023-05-11T00:00:00Z',
              'car',
              'murray',
            );
            expect(reduceRemainingCapacitySpy).toBeCalledTimes(1);
            expect(reduceRemainingCapacitySpy).toBeCalledWith(
              capacity,
              'allDay',
            );
          });
          it('commits these changes', async () => {
            await assignEmptySpacesToReserved(
              capacity,
              '2023-05-11T00:00:00Z',
              'car',
              'murray',
            );
            expect(mockBatchCommit).toHaveBeenCalled();
          });
        });

        describe('Capacity is two for each slot and has three bookings on reserve list', () => {
          beforeEach(() => {
            capacity = {am: 2, pm: 2, allDay: 2};
          });
          it('Can update two of these bookings', async () => {
            await assignEmptySpacesToReserved(
              capacity,
              '2023-05-11T00:00:00Z',
              'car',
              'murray',
            );
            expect(mockBatchUpdate).toBeCalledTimes(2);
          });

          it('Updates the booking that was created first', async () => {
            await assignEmptySpacesToReserved(
              capacity,
              '2023-05-11T00:00:00Z',
              'car',
              'murray',
            );
            expect(mockBatchUpdate).toHaveBeenNthCalledWith(1, 'bookingRef3', {
              isReserveSpace: false,
              updatedAt: {},
            });
            expect(mockBatchUpdate).toHaveBeenNthCalledWith(2, 'bookingRef2', {
              isReserveSpace: false,
              updatedAt: {},
            });
          });

          it('updates the booking capacity', async () => {
            await assignEmptySpacesToReserved(
              capacity,
              '2023-05-11T00:00:00Z',
              'car',
              'murray',
            );
            expect(reduceRemainingCapacitySpy).toBeCalledTimes(2);
            expect(reduceRemainingCapacitySpy).toHaveBeenNthCalledWith(
              1,
              capacity,
              'allDay',
            );
            expect(reduceRemainingCapacitySpy).toHaveBeenNthCalledWith(
              2,
              capacity,
              'allDay',
            );
          });
          it('commits these changes', async () => {
            await assignEmptySpacesToReserved(
              capacity,
              '2023-05-11T00:00:00Z',
              'car',
              'murray',
            );
            expect(mockBatchCommit).toHaveBeenCalled();
          });

          it('notifies users with notifications', async () => {
            await assignEmptySpacesToReserved(
              capacity,
              '2023-05-11T00:00:00Z',
              'car',
              'murray',
            );
            expect(sendNotifications).toBeCalledTimes(2);
          });
        });
      });

      describe('Space type is desk', () => {
        beforeEach(() => {
          getUsersFromBookingsSpy.mockResolvedValue(users);
        });
        it('returns true', async () => {
          const result = await assignEmptySpacesToReserved(
            capacity,
            '2023-05-11T00:00:00Z',
            'desk',
            'murray',
          );
          expect(result).toEqual(true);
          expect(mockBatchUpdate).toBeCalledTimes(1);
        });
        it('does not fetch users', async () => {
          await assignEmptySpacesToReserved(
            capacity,
            '2023-05-11T00:00:00Z',
            'desk',
            'murray',
          );
          expect(getUsersFromBookingsSpy).toBeCalledTimes(0);
        });

        describe('Capacity is one for each slot but has three bookings on reserve list', () => {
          it('Can only update one of these bookings', async () => {
            await assignEmptySpacesToReserved(
              capacity,
              '2023-05-11T00:00:00Z',
              'desk',
              'murray',
            );
            expect(mockBatchUpdate).toBeCalledTimes(1);
          });

          it('Updates the booking that was created first', async () => {
            await assignEmptySpacesToReserved(
              capacity,
              '2023-05-11T00:00:00Z',
              'desk',
              'murray',
            );
            expect(mockBatchUpdate).toBeCalledWith('bookingRef3', {
              isReserveSpace: false,
              updatedAt: {},
            });
          });

          it('updates the booking capacity', async () => {
            await assignEmptySpacesToReserved(
              capacity,
              '2023-05-11T00:00:00Z',
              'desk',
              'murray',
            );
            expect(reduceRemainingCapacitySpy).toBeCalledTimes(1);
            expect(reduceRemainingCapacitySpy).toBeCalledWith(
              capacity,
              'allDay',
            );
          });
          it('commits these changes', async () => {
            await assignEmptySpacesToReserved(
              capacity,
              '2023-05-11T00:00:00Z',
              'desk',
              'murray',
            );
            expect(mockBatchCommit).toHaveBeenCalled();
          });
        });

        describe('Capacity is two for each slot and has three bookings on reserve list', () => {
          beforeEach(() => {
            capacity = {am: 2, pm: 2, allDay: 2};
          });
          it('Can update two of these bookings', async () => {
            await assignEmptySpacesToReserved(
              capacity,
              '2023-05-11T00:00:00Z',
              'desk',
              'murray',
            );
            expect(mockBatchUpdate).toBeCalledTimes(2);
          });

          it('Updates the booking that was created first', async () => {
            await assignEmptySpacesToReserved(
              capacity,
              '2023-05-11T00:00:00Z',
              'desk',
              'murray',
            );
            expect(mockBatchUpdate).toHaveBeenNthCalledWith(1, 'bookingRef3', {
              isReserveSpace: false,
              updatedAt: {},
            });
            expect(mockBatchUpdate).toHaveBeenNthCalledWith(2, 'bookingRef2', {
              isReserveSpace: false,
              updatedAt: {},
            });
          });

          it('updates the booking capacity', async () => {
            await assignEmptySpacesToReserved(
              capacity,
              '2023-05-11T00:00:00Z',
              'desk',
              'murray',
            );
            expect(reduceRemainingCapacitySpy).toBeCalledTimes(2);
            expect(reduceRemainingCapacitySpy).toHaveBeenNthCalledWith(
              1,
              capacity,
              'allDay',
            );
            expect(reduceRemainingCapacitySpy).toHaveBeenNthCalledWith(
              2,
              capacity,
              'allDay',
            );
          });
          it('commits these changes', async () => {
            await assignEmptySpacesToReserved(
              capacity,
              '2023-05-11T00:00:00Z',
              'desk',
              'murray',
            );
            expect(mockBatchCommit).toHaveBeenCalled();
          });

          it('does notnotify users with notifications', async () => {
            await assignEmptySpacesToReserved(
              capacity,
              '2023-05-11T00:00:00Z',
              'desk',
              'murray',
            );
            expect(sendNotifications).toBeCalledTimes(0);
          });
        });
      });
    });
  });
});
