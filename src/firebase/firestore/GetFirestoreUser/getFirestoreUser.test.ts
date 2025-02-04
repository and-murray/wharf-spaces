import getFirestoreUser from './getFirestoreUser';
import {db} from '../Database';
import {CollectionName} from '../CollectionName';
import User, {Role, BusinessUnit} from '@customTypes/user';
import {FirebaseFirestoreTypes} from '@react-native-firebase/firestore';

jest.mock('../Database');

describe('getFirestoreUser tests', () => {
  const mockTimestamp = {
    seconds: 1586343437,
    nanoseconds: 0,
    toDate: () => new Date(),
    isEqual: (other: FirebaseFirestoreTypes.Timestamp) =>
      other === mockTimestamp,
    toMillis: () => 1586343437000,
    toJSON: () => ({
      seconds: mockTimestamp.seconds,
      nanoseconds: mockTimestamp.nanoseconds,
    }),
  } as FirebaseFirestoreTypes.Timestamp;

  const testUser: User = {
    id: 'testUid',
    firstName: 'Test',
    lastName: 'User',
    email: 'test@example.com',
    profilePicUrl: 'https://example.com/test-photo.jpg',
    role: Role.user,
    businessUnit: BusinessUnit.murray,
    createdAt: mockTimestamp,
    updatedAt: mockTimestamp,
  };

  const mockDocData = {
    exists: true,
    data: () => testUser,
  };

  const mockDocDataUndefined = {
    exists: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns a user when a user is found', async () => {
    (db.collection as jest.Mock).mockReturnValue({
      doc: () => ({
        get: jest.fn().mockResolvedValue(mockDocData),
      }),
    });

    const result = await getFirestoreUser('testUid');

    expect(result).toEqual(testUser);
    expect(db.collection).toHaveBeenCalledWith(CollectionName.users);
  });

  it('returns undefined when no user is found', async () => {
    (db.collection as jest.Mock).mockReturnValue({
      doc: () => ({
        get: jest.fn().mockResolvedValue(mockDocDataUndefined),
      }),
    });

    const result = await getFirestoreUser('testUid');

    expect(result).toBeUndefined();
    expect(db.collection).toHaveBeenCalledWith(CollectionName.users);
  });
});
