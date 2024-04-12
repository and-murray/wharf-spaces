import {Timestamp} from 'firebase-admin/firestore';
import {Booking} from '../../Models/booking.model';
import {getReserveBookings} from './getReserveBookings';

const mockBatchUpdate = jest.fn();
const mockBatchCommit = jest.fn();
const mockGet = jest.fn();
const mockWhere = jest.fn(() => ({
  get: mockGet,
  where: mockWhere2,
  orderBy: jest.fn().mockReturnThis(),
}));

const mockWhere2 = jest.fn().mockReturnThis();
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

describe('Get Reserve Bookings', () => {
  type DocType = {
    data: () => Booking;
    ref: string;
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
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it('Calls with the correct collection name', async () => {
    mockGet.mockImplementation(() => ({
      docs: reservedBookingDocs,
    }));
    await getReserveBookings('2023-05-11T14:52:31Z', 'car');
    expect(mockCollection).toHaveBeenCalledWith('bookings');
  });

  it('Calls with the correct date', async () => {
    mockGet.mockImplementation(() => ({
      docs: reservedBookingDocs,
    }));
    await getReserveBookings('2023-05-11T14:52:31Z', 'car');
    expect(mockWhere).toHaveBeenCalledWith(
      'date',
      '==',
      '2023-05-11T00:00:00Z',
    );
  });

  it('Calls with isReserveSpace true', async () => {
    mockGet.mockImplementation(() => ({
      docs: reservedBookingDocs,
    }));
    await getReserveBookings('2023-05-11T14:52:31Z', 'car');
    expect(mockWhere2).toHaveBeenNthCalledWith(1, 'isReserveSpace', '==', true);
  });

  it('Calls with space type true', async () => {
    mockGet.mockImplementation(() => ({
      docs: reservedBookingDocs,
    }));
    await getReserveBookings('2023-05-11T14:52:31Z', 'car');
    expect(mockWhere2).toHaveBeenNthCalledWith(2, 'spaceType', '==', 'car');
  });

  it('Returns the doc ref and parsed data', async () => {
    mockGet.mockImplementation(() => ({
      docs: reservedBookingDocs,
    }));
    const result = await getReserveBookings('2023-05-11T14:52:31Z', 'car');
    expect(result[0].docRef).toEqual(docRef);
    expect(result[0].data).toEqual({
      bookingType: 'personal',
      createdAt: {_nanoseconds: 100, _seconds: 100},
      date: '2023-06-15T00:00:00Z',
      id: '3',
      isReserveSpace: true,
      spaceType: 'desk',
      timeSlot: 'pm',
      updatedAt: {_nanoseconds: 100, _seconds: 100},
      userId: '123',
    });
  });
});
