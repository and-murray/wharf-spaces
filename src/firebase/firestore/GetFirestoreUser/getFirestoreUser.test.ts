import getFirestoreUser from './getFirestoreUser';
import {db} from '../DatabaseV2';
import {CollectionName} from '../CollectionName';
import User, {Role, BusinessUnit} from '@customTypes/user';
import {FirebaseFirestoreTypes} from '@react-native-firebase/firestore';
import {doc, getDoc} from '@react-native-firebase/firestore';

jest.mock('../Database');

describe('getFirestoreUser tests', () => {
  const mockTimestamp = {
    seconds: 1586343437,
    nanoseconds: 0,
    toDate: () => new Date(),
    isEqual: (other: any) => other === mockTimestamp,
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

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns a user when a user is found', async () => {
    (doc as jest.Mock).mockReturnValue({
      getDoc: jest.fn(),
    });
    (getDoc as jest.Mock).mockReturnValue({
      exists: jest.fn().mockReturnValue(true),
      data: jest.fn().mockReturnValue(testUser),
    });
    const result = await getFirestoreUser('testUid');

    expect(result).toEqual(testUser);
    expect(doc).toHaveBeenCalledWith(db, CollectionName.users, 'testUid');
  });

  it('returns undefined when no user is found', async () => {
    (doc as jest.Mock).mockReturnValue({
      getDoc: jest.fn(),
    });
    (getDoc as jest.Mock).mockReturnValue({
      exists: jest.fn().mockReturnValue(false),
      data: jest.fn().mockReturnValue(undefined),
    });

    const result = await getFirestoreUser('testUid');

    expect(result).toBeUndefined();
    expect(doc).toHaveBeenCalledWith(db, CollectionName.users, 'testUid');
  });
});
