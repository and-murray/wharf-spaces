import {Timestamp} from 'firebase-admin/firestore';
import {Booking, User} from '../../Models/booking.model';
import {getUsersFromBookings} from './getUsersFromBookings';

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

describe('Get Users From Bookings', () => {
  type DocType = {
    data: () => User;
    ref: string;
  };
  const docRef = 'userRef';
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
  const dummyUser: User = {
    id: '123',
    createdAt: new Timestamp(100, 100),
    updatedAt: new Timestamp(100, 100),
    firstName: 'User',
    lastName: 'last name',
    email: 'example@example.com',
    profilePicUrl: 'http',
    role: 'user',
    businessUnit: 'murray',
  };
  const userDocs: DocType[] = [
    {
      data: () => ({
        ...dummyUser,
        id: '123',
      }),
      ref: docRef,
    },
    {
      data: () => ({
        ...dummyUser,
        id: '456',
      }),
      ref: docRef,
    },
  ];
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it('Calls with the correct collection name', async () => {
    mockGet.mockImplementation(() => ({
      docs: userDocs,
    }));
    await getUsersFromBookings([
      {...dummyBooking, userId: '123'},
      {...dummyBooking, userId: '456'},
    ]);
    expect(mockCollection).toHaveBeenCalledWith('users');
  });

  it('Calls chunk query with user ids', async () => {
    mockGet.mockImplementation(() => ({
      docs: userDocs,
    }));
    await getUsersFromBookings([
      {...dummyBooking, userId: '123'},
      {...dummyBooking, userId: '456'},
    ]);
    expect(mockWhere).toHaveBeenCalledWith('id', 'in', ['123', '456']);
  });

  it('Returns correct data', async () => {
    mockGet.mockImplementation(() => ({
      docs: userDocs,
    }));
    const result = await getUsersFromBookings([
      {...dummyBooking, userId: '123'},
      {...dummyBooking, userId: '456'},
    ]);
    expect(result).toEqual([
      {
        businessUnit: 'murray',
        createdAt: {_nanoseconds: 100, _seconds: 100},
        email: 'example@example.com',
        firstName: 'User',
        id: '123',
        lastName: 'last name',
        profilePicUrl: 'http',
        role: 'user',
        updatedAt: {_nanoseconds: 100, _seconds: 100},
      },
      {
        businessUnit: 'murray',
        createdAt: {_nanoseconds: 100, _seconds: 100},
        email: 'example@example.com',
        firstName: 'User',
        id: '456',
        lastName: 'last name',
        profilePicUrl: 'http',
        role: 'user',
        updatedAt: {_nanoseconds: 100, _seconds: 100},
      },
    ]);
  });
});
