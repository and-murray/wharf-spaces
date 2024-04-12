import {Timestamp} from 'firebase-admin/firestore';
import {getNonReservedBookingsOnDate} from './firebaseBookingService';

const mockGet = jest.fn();
const mockWhere = jest.fn(() => ({
  get: mockGet,
  where: jest.fn(),
}));
const mockFirstWhere = jest.fn(() => ({
  where: mockWhere,
}));
const mockDoc = jest.fn();
const mockCollection = jest.fn(() => ({
  doc: mockDoc,
  where: jest.fn(() => ({
    where: mockFirstWhere,
  })),
}));
jest.mock('firebase-admin', () => ({
  initializeApp: jest.fn(),
  firestore: () => ({
    collection: mockCollection,
  }),
}));

const testDate = '2023-05-11T00:00:00.00Z';
describe('Get Bookings Within Range Tests ', () => {
  afterAll(() => {
    jest.clearAllMocks();
  });

  describe('when passed a valid date ', () => {
    describe('when there are 0 bookings on date ', () => {
      it('returns 0 if no bookings within', async () => {
        mockGet.mockReturnValue([]);
        const testResult = await getNonReservedBookingsOnDate(testDate, 'desk');

        expect(testResult).toEqual([]);
      });
    });

    describe('when there are multiple bookings within range ', () => {
      beforeEach(() => {
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
            data: () => bookings[0],
            ref: '12345',
          },
          {
            // simulate firestore get doc.data() function
            data: () => bookings[1],
            ref: '54321',
          },
        ];
        mockGet.mockReturnValueOnce(docs);
      });
      it('returns the number of bookings that are within the range', async () => {
        const testResult = await getNonReservedBookingsOnDate(testDate, 'desk');

        expect(testResult).toEqual([
          {
            bookingType: 'personal',
            createdAt: {_nanoseconds: 175000000, _seconds: 1684410706},
            date: '2023-05-11T14:52:31Z',
            id: '123456789',
            isReserveSpace: false,
            spaceType: 'desk',
            timeSlot: 'am',
            updatedAt: {_nanoseconds: 175000000, _seconds: 1684410706},
            userId: '1234',
          },
          {
            bookingType: 'personal',
            createdAt: {_nanoseconds: 175000000, _seconds: 1684410706},
            date: '2023-05-11T14:52:31Z',
            id: '987654321',
            isReserveSpace: false,
            spaceType: 'desk',
            timeSlot: 'am',
            updatedAt: {_nanoseconds: 175000000, _seconds: 1684410706},
            userId: '1234',
          },
        ]);
      });
    });
  });
});
