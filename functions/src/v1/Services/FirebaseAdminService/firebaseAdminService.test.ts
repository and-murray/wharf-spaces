import {
  DocumentReference,
  FieldValue,
  Timestamp,
} from 'firebase-admin/firestore';
import {Booking} from '../../Models/booking.model';
import {
  deleteBookings,
  getFirestoreUser,
  sendToBookings,
} from './firebaseAdminService';
import {HttpError} from 'http-errors';
import {ZodError} from 'zod';
import * as isCorrectFunction from '../../utils/IsCorrectFunction';
import * as chunkQuery from '../../utils/FirebaseUtils/FirebaseUtils';

const mockBatchSet = jest.fn();
const mockBatchCommit = jest.fn();
const mockBatchDelete = jest.fn();
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
      set: mockBatchSet,
      commit: mockBatchCommit,
      delete: mockBatchDelete,
    }),
    collection: mockCollection,
  }),
}));
const isCorrectFunctionSpy = jest.spyOn(isCorrectFunction, 'isCorrectFunction');
const chunkQuerySpy = jest.spyOn(chunkQuery, 'chunkQuery');

describe('Firebase Admin Service', () => {
  beforeEach(() => {
    isCorrectFunctionSpy.mockReturnValue(true);
    jest.clearAllMocks();
  });

  afterAll(() => {
    jest.clearAllMocks();
  });
  describe('Send to bookings is called', () => {
    let bookings: Booking[];
    describe('with multiple bookings', () => {
      beforeEach(() => {
        bookings = [
          {
            userId: '123',
            id: '123456',
            date: '2023-05-11T14:52:31Z',
            timeSlot: 'am',
            bookingType: 'personal',
            spaceType: 'desk',
            createdAt: FieldValue.serverTimestamp(),
            updatedAt: FieldValue.serverTimestamp(),
            isReserveSpace: false,
          },
          {
            userId: '123',
            id: '654321',
            date: '2023-05-11T14:52:31Z',
            timeSlot: 'am',
            bookingType: 'personal',
            spaceType: 'desk',
            createdAt: FieldValue.serverTimestamp(),
            updatedAt: FieldValue.serverTimestamp(),
            isReserveSpace: false,
          },
        ];
      });
      it('calls batch set', () => {
        sendToBookings(bookings);
        expect(mockBatchSet).toHaveBeenCalledTimes(2);
      });
      it('calls batch commit once', () => {
        sendToBookings(bookings);
        expect(mockBatchCommit).toHaveBeenCalledTimes(1);
      });

      it('calls db collection with "bookings" param', () => {
        sendToBookings(bookings);
        expect(mockCollection).toHaveBeenCalledTimes(2);
        expect(mockCollection).toHaveBeenCalledWith('bookings');
      });

      it('creates docRefs with the correct ids', () => {
        sendToBookings(bookings);
        expect(mockDoc).toHaveBeenCalledTimes(2);
        expect(mockDoc.mock.calls).toEqual([['123456'], ['654321']]);
      });

      it('calls batch set with the correct info', () => {
        mockDoc.mockReturnValueOnce('123456').mockReturnValueOnce('654321');
        sendToBookings(bookings);
        expect(mockBatchSet).toHaveBeenCalledTimes(2);
        expect(mockBatchSet.mock.calls).toEqual([
          ['123456', bookings[0]],
          ['654321', bookings[1]],
        ]);
      });
    });

    describe('with no bookings', () => {
      beforeEach(() => {
        bookings = [];
      });

      it('never calls batch set', () => {
        sendToBookings(bookings);
        expect(mockBatchSet).not.toBeCalled();
      });

      it('calls batch commit once', () => {
        sendToBookings(bookings);
        expect(mockBatchCommit).toHaveBeenCalledTimes(1);
      });

      it('calls db collection with "bookings" param', () => {
        sendToBookings(bookings);
        expect(mockCollection).not.toBeCalled();
      });
    });

    describe('with a single bookings', () => {
      beforeEach(() => {
        bookings = [
          {
            userId: '123',
            id: '123456',
            date: '2023-05-11T14:52:31Z',
            timeSlot: 'am',
            bookingType: 'personal',
            spaceType: 'desk',
            createdAt: FieldValue.serverTimestamp(),
            updatedAt: FieldValue.serverTimestamp(),
            isReserveSpace: false,
          },
        ];
      });
      it('calls batch set', () => {
        sendToBookings(bookings);
        expect(mockBatchSet).toHaveBeenCalledTimes(1);
      });

      it('calls batch commit once', () => {
        sendToBookings(bookings);
        expect(mockBatchCommit).toHaveBeenCalledTimes(1);
      });

      it('calls db collection with "bookings" param', () => {
        sendToBookings(bookings);
        expect(mockCollection).toHaveBeenCalledTimes(1);
        expect(mockCollection).toHaveBeenCalledWith('bookings');
      });

      it('creates docRefs with the correct ids', () => {
        sendToBookings(bookings);
        expect(mockDoc).toHaveBeenCalledTimes(1);
        expect(mockDoc.mock.calls).toEqual([['123456']]);
      });

      it('calls batch set with the correct info', () => {
        mockDoc.mockReturnValueOnce('123456');
        sendToBookings(bookings);
        expect(mockBatchSet).toHaveBeenCalledTimes(1);
        expect(mockBatchSet.mock.calls).toEqual([['123456', bookings[0]]]);
      });
    });
  });

  describe('Delete bookings is called', () => {
    describe('with booking ids you own', () => {
      let bookingIds: string[] = [];
      beforeEach(() => {
        bookingIds = ['123456789', '987654321'];
        const timestamp = new Timestamp(1684410706, 175000000);
        const bookings = [
          {
            date: '2023-05-11T14:52:31Z',
            isReserveSpace: false,
            spaceType: 'desk',
            timeSlot: 'am',
            bookingType: 'personal',
            id: '123456789',
            userId: '1234',
            createdAt: timestamp,
            updatedAt: timestamp,
          },
          {
            date: '2023-05-11T14:52:31Z',
            isReserveSpace: false,
            spaceType: 'desk',
            timeSlot: 'am',
            bookingType: 'personal',
            id: '987654321',
            userId: '1234',
            createdAt: timestamp,
            updatedAt: timestamp,
          },
        ];
        const docs = [
          {
            // simulate firestore get doc.data() function
            data: bookings[0],
            docRef: '12345' as unknown as DocumentReference,
          },
          {
            // simulate firestore get doc.data() function
            data: bookings[1],
            docRef: '54321' as unknown as DocumentReference,
          },
        ];
        chunkQuerySpy.mockResolvedValueOnce(docs);
      });

      it('deletes the bookings', async () => {
        await deleteBookings(bookingIds, '1234');
        expect(mockBatchDelete.mock.calls).toEqual([['12345'], ['54321']]);
        expect(mockBatchDelete).toHaveBeenCalledTimes(2);
        expect(mockBatchCommit).toHaveBeenCalledTimes(1);
      });

      it('calls db collection with "bookings" param', async () => {
        await deleteBookings(bookingIds, '1234');
        expect(mockCollection).toHaveBeenCalledTimes(1);
        expect(mockCollection).toHaveBeenCalledWith('bookings');
      });
    });

    describe('with a booking id you don not own', () => {
      let bookingIds: string[] = [];
      beforeEach(() => {
        bookingIds = ['123456789', '987654321'];
        const timestamp = new Timestamp(1684410706, 175000000);
        const bookings = [
          {
            date: '2023-05-11T14:52:31Z',
            isReserveSpace: false,
            spaceType: 'desk',
            timeSlot: 'am',
            bookingType: 'personal',
            id: '123456789',
            userId: '1234567',
            createdAt: timestamp,
            updatedAt: timestamp,
          },
          {
            date: '2023-05-11T14:52:31Z',
            isReserveSpace: false,
            spaceType: 'desk',
            timeSlot: 'am',
            bookingType: 'personal',
            id: '987654321',
            userId: '1234567',
            createdAt: timestamp,
            updatedAt: timestamp,
          },
        ];
        const docs = [
          {
            // simulate firestore get doc.data() function
            data: bookings[0],
            docRef: '12345' as unknown as DocumentReference,
          },
          {
            // simulate firestore get doc.data() function
            data: bookings[1],
            docRef: '54321' as unknown as DocumentReference,
          },
        ];
        chunkQuerySpy.mockResolvedValueOnce(docs);
      });

      it('throws a correct error type', async () => {
        await expect(deleteBookings(bookingIds, '1234')).rejects.toThrow(
          HttpError,
        );
      });

      it('throws a 403 forbidden error', async () => {
        expect.hasAssertions();
        try {
          await deleteBookings(bookingIds, '1234');
        } catch (error) {
          expect((error as HttpError).statusCode).toBe(403);
        }
      });

      it('throws the correct message', async () => {
        expect.hasAssertions();
        try {
          await deleteBookings(bookingIds, '1234');
        } catch (error) {
          expect((error as HttpError).message).toBe(
            JSON.stringify({
              message:
                'Forbidden from deleting, no bookings were deleted as a result',
            }),
          );
        }
      });

      it('does not commit any deletions', async () => {
        expect.hasAssertions();
        try {
          await deleteBookings(bookingIds, '1234');
        } catch (error) {
          expect(mockBatchDelete.mock.calls).toEqual([]);
          expect(mockBatchDelete).toHaveBeenCalledTimes(0);
          expect(mockBatchCommit).toHaveBeenCalledTimes(0);
        }
      });
    });

    describe('with a booking id that does not exist', () => {
      let bookingIds: string[] = [];
      beforeEach(() => {
        bookingIds = ['123456789', '987654321'];
        const timestamp = new Timestamp(1684410706, 175000000);
        const bookings = [
          {
            date: '2023-05-11T14:52:31Z',
            isReserveSpace: false,
            spaceType: 'desk',
            timeSlot: 'am',
            bookingType: 'personal',
            id: '123456789',
            userId: '1234',
            createdAt: timestamp,
            updatedAt: timestamp,
          },
        ];
        const docs = [
          {
            // simulate firestore get doc.data() function
            data: bookings[0],
            docRef: '12345' as unknown as DocumentReference,
          },
        ];
        chunkQuerySpy.mockResolvedValueOnce(docs);
      });

      it('throws a correct error type', async () => {
        await expect(deleteBookings(bookingIds, '1234')).rejects.toThrow(
          HttpError,
        );
      });

      it('throws a 404 not found error', async () => {
        expect.hasAssertions();
        try {
          await deleteBookings(bookingIds, '1234');
        } catch (error) {
          expect((error as HttpError).statusCode).toBe(404);
        }
      });

      it('throws the correct message', async () => {
        expect.hasAssertions();
        try {
          await deleteBookings(bookingIds, '1234');
        } catch (error) {
          expect((error as HttpError).message).toBe(
            JSON.stringify({
              message:
                'Failed to find at least one id, no bookings were deleted as a result.',
              failedIds: ['987654321'],
            }),
          );
        }
      });

      it('does not commit any deletions', async () => {
        expect.hasAssertions();
        try {
          await deleteBookings(bookingIds, '1234');
        } catch (error) {
          expect(mockBatchDelete.mock.calls).toEqual([['12345']]);
          expect(mockBatchDelete).toHaveBeenCalledTimes(1);
          expect(mockBatchCommit).toHaveBeenCalledTimes(0);
        }
      });
    });
  });
  describe('getFirestoreUser is called', () => {
    describe('with a user id that exists', () => {
      beforeEach(() => {
        mockGet = jest.fn(() => ({
          exists: true,
          data: jest.fn().mockReturnValue({
            id: 'testUid',
            firstName: 'Test',
            lastName: 'User',
            email: 'test@example.com',
            profilePicUrl: 'https://example.com/test-photo.jpg',
            role: 'user',
            businessUnit: 'murray',
            updatedAt: new Timestamp(0, 0),
            createdAt: new Timestamp(0, 0),
          }),
        }));
        mockDoc = jest.fn(() => ({
          get: mockGet,
        }));
      });
      it('returns the user data', async () => {
        let response = await getFirestoreUser('testUid');
        expect(response).toEqual({
          id: 'testUid',
          firstName: 'Test',
          lastName: 'User',
          email: 'test@example.com',
          profilePicUrl: 'https://example.com/test-photo.jpg',
          role: 'user',
          businessUnit: 'murray',
          updatedAt: new Timestamp(0, 0),
          createdAt: new Timestamp(0, 0),
        });
      });
    });
    describe('with a user id that does not exist', () => {
      beforeEach(() => {
        mockGet = jest.fn(() => ({
          exists: false,
          data: jest.fn(),
        }));
        mockDoc = jest.fn(() => ({
          get: mockGet,
        }));
      });
      it('returns undefined', async () => {
        try {
          await getFirestoreUser('testUid');
        } catch (error) {
          const expected = new ZodError([
            {
              code: 'invalid_type',
              expected: 'object',
              received: 'undefined',
              path: [],
              message: 'Required',
            },
          ]);
          expect(error).toStrictEqual(expected);
        }
      });
    });
  });
});
