import {DocumentReference, Timestamp} from 'firebase-admin/firestore';
import {Booking, BookingEdit, User} from '../../Models/booking.model';
import * as chunkQuery from '../../utils/FirebaseUtils/FirebaseUtils';
import * as isCorrectFunction from '../../utils/IsCorrectFunction';
import {editExistingBookings} from './editExistingBookings';
import createError, {HttpError} from 'http-errors';
import * as getFirestoreUser from './firebaseAdminService';
import * as checkBookingCapacity from '../DeskCapacity/checkBookingCapacity';
import * as assignEmptySpacesToReserved from './assignEmptySpacesToReserved';

const mockBatchUpdate = jest.fn();
const mockBatchCommit = jest.fn();
const mockDoc = jest.fn();
const mockGet = jest.fn();
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

const isCorrectFunctionSpy = jest.spyOn(isCorrectFunction, 'isCorrectFunction');
const chunkQuerySpy = jest.spyOn(chunkQuery, 'chunkQuery');
const getFirestoreUserSpy = jest.spyOn(getFirestoreUser, 'getFirestoreUser');
const checkBookingCapacitySpy = jest.spyOn(
  checkBookingCapacity,
  'checkBookingCapacity',
);
const assignEmptySpacesToReservedSpy = jest.spyOn(
  assignEmptySpacesToReserved,
  'assignEmptySpacesToReserved',
);

describe('Edit Existing Bookings', () => {
  beforeEach(() => {
    isCorrectFunctionSpy.mockReturnValue(true);
    assignEmptySpacesToReservedSpy.mockImplementation(jest.fn());
    jest.clearAllMocks();
  });

  it('uses the bookings collection', async () => {
    try {
      await editExistingBookings([], '');
      expect(true).toBe(false);
    } catch {
      expect(mockCollection).toBeCalledWith('bookings');
    }
  });

  it('queries bookings', async () => {
    try {
      await editExistingBookings(
        [
          {bookingId: '123', newTimeSlot: 'am'},
          {bookingId: '456', newTimeSlot: 'am'},
        ],
        '123',
      );
      expect(true).toBe(false);
    } catch {
      expect(chunkQuerySpy).toHaveBeenCalledWith(
        {doc: mockDoc, where: mockWhere},
        'id',
        ['123', '456'],
      );
    }
  });

  describe('There are no bookings found', () => {
    it('returns a bad request', async () => {
      try {
        await editExistingBookings([], '');
        expect(true).toBe(false);
      } catch (error) {
        const expected = constructError(
          new createError.BadRequest(),
          'No bookings could be found for given Ids',
        );
        expect(error).toEqual(expected);
      }
    });
  });

  describe('Bookings are found', () => {
    const user: User = {
      businessUnit: 'murray',
      createdAt: new Timestamp(100, 100),
      email: 'example@example.com',
      firstName: 'User',
      id: '123',
      lastName: 'last name',
      profilePicUrl: 'http',
      role: 'user',
      updatedAt: new Timestamp(100, 100),
    };
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
    let bookingDocs: {docRef: DocumentReference; data: Booking}[];
    const edits: BookingEdit[] = [
      {bookingId: '123', newTimeSlot: 'am'},
      {bookingId: '456', newTimeSlot: 'am'},
      {bookingId: '789', newTimeSlot: 'am'},
    ];
    beforeEach(() => {
      getFirestoreUserSpy.mockResolvedValue(user);
      bookingDocs = [
        {
          docRef: 'bookingRef' as unknown as DocumentReference,
          data: {
            ...dummyBooking,
            id: '123',
            userId: '123',
            timeSlot: 'pm',
          },
        },
        {
          docRef: 'bookingRef2' as unknown as DocumentReference,
          data: {
            ...dummyBooking,
            id: '456',
            userId: '123',
            timeSlot: 'pm',
            createdAt: new Timestamp(50, 50),
          },
        },
        {
          docRef: 'bookingRef3' as unknown as DocumentReference,
          data: {
            ...dummyBooking,
            id: '789',
            userId: '123',
            timeSlot: 'pm',
            createdAt: new Timestamp(25, 25),
          },
        },
      ];
    });
    describe('One of the bookings is on a different day', () => {
      it('Throws a bad request error', async () => {
        const editedDocs = bookingDocs;
        editedDocs[0].data.date = '2023-05-10T00:00:00Z';
        chunkQuerySpy.mockResolvedValueOnce(editedDocs);
        try {
          await editExistingBookings(edits, '123');
          expect(true).toBe(false);
        } catch (error) {
          const expected = constructError(
            new createError.BadRequest(),
            'Edits are on different days',
          );
          expect(error).toEqual(expected);
        }
      });
    });

    describe('One of the bookings is for a different space type', () => {
      it('Throws a bad request error', async () => {
        const editedDocs = bookingDocs;
        editedDocs[0].data.spaceType = 'car';
        chunkQuerySpy.mockResolvedValueOnce(editedDocs);
        try {
          await editExistingBookings(edits, '123');
          expect(true).toBe(false);
        } catch (error) {
          const expected = constructError(
            new createError.BadRequest(),
            'Edits are for different space types',
          );
          expect(error).toEqual(expected);
        }
      });
    });

    describe('One of the bookings is for a different user', () => {
      it('Throws a bad request error', async () => {
        const editedDocs = bookingDocs;
        editedDocs[0].data.userId = '456';
        chunkQuerySpy.mockResolvedValueOnce(editedDocs);
        try {
          await editExistingBookings(edits, '123');
          expect(true).toBe(false);
        } catch (error) {
          const expected = constructError(
            new createError.BadRequest(),
            'Edits are for different users',
          );
          expect(error).toEqual(expected);
        }
      });
    });

    describe('User id does not match booking ids', () => {
      it('Throws a forbidden request error', async () => {
        chunkQuerySpy.mockResolvedValueOnce(bookingDocs);
        checkBookingCapacitySpy.mockResolvedValue({am: 1, pm: 1, allDay: 1});
        try {
          await editExistingBookings(edits, '456');
          expect(true).toBe(false);
        } catch (error) {
          const expected = constructError(
            new createError.BadRequest(),
            'Forbidden from editing, no bookings were edited as a result',
            '123',
          );
          expect(error).toEqual(expected);
        }
      });
    });

    describe('At least one of the edits cannot be made because of capacity', () => {
      it('Calls batch update with booking as reservation', async () => {
        chunkQuerySpy.mockResolvedValueOnce(bookingDocs);
        checkBookingCapacitySpy.mockResolvedValue({
          am: 1,
          pm: 1,
          allDay: 1,
        });
        await editExistingBookings(edits, '123');
        expect(mockBatchUpdate).toHaveBeenCalledTimes(3);
        expect(mockBatchUpdate.mock.calls).toEqual([
          ['bookingRef', {timeSlot: 'am', updatedAt: {}}],
          [
            'bookingRef2',
            {isReserveSpace: true, timeSlot: 'am', updatedAt: {}},
          ],
          [
            'bookingRef3',
            {isReserveSpace: true, timeSlot: 'am', updatedAt: {}},
          ],
        ]);
        expect(mockBatchCommit).toHaveBeenCalledTimes(1);
        expect(assignEmptySpacesToReservedSpy).toHaveBeenCalledTimes(1);
      });
    });

    describe('All the edits can be made', () => {
      it('Calls batch update and commit', async () => {
        chunkQuerySpy.mockResolvedValueOnce(bookingDocs);
        checkBookingCapacitySpy.mockResolvedValue({am: 5, pm: 5, allDay: 5});
        await editExistingBookings(edits, '123');
        expect(mockBatchUpdate).toHaveBeenCalledTimes(3);
        expect(mockBatchCommit).toHaveBeenCalledTimes(1);
        expect(assignEmptySpacesToReservedSpy).toHaveBeenCalledTimes(1);
      });
    });

    describe('Edits to reserve spaces are made regardless of capacity', () => {
      it('Calls batch update and commit', async () => {
        const editedDocs = bookingDocs;
        editedDocs[0].data.isReserveSpace = true;
        editedDocs[1].data.isReserveSpace = true;
        editedDocs[2].data.isReserveSpace = true;
        chunkQuerySpy.mockResolvedValueOnce(editedDocs);
        checkBookingCapacitySpy.mockResolvedValue({am: 0, pm: 0, allDay: 0});
        await editExistingBookings(edits, '123');
        expect(mockBatchUpdate).toHaveBeenCalledTimes(3);
        expect(mockBatchCommit).toHaveBeenCalledTimes(1);
        expect(assignEmptySpacesToReservedSpy).toHaveBeenCalledTimes(1);
      });
    });
  });
});

function constructError(
  httpError: HttpError,
  message: string,
  id?: string,
): Error {
  httpError.message = id
    ? JSON.stringify({
        message: message,
        failedId: id,
      })
    : JSON.stringify({
        message: message,
      });
  return httpError;
}
