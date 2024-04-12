import {User} from '@customTypes';
import {getUser} from './getUser';
import {mockFirestoreCollection} from '@root/setup-jest';
import * as getFirestoreUser from './getFirestoreUser';
import * as createFireStoreUser from './createFirestoreUser';
import {FirebaseAuthTypes} from '@react-native-firebase/auth';

let snapshotResult: boolean;
const mockGet = jest.fn(() => {
  const mockSnapshot = {exists: snapshotResult};
  return mockSnapshot;
});

const mockSet = jest.fn(() => {});

const mockDoc = jest.fn(() => ({
  get: mockGet,
  set: mockSet,
}));

mockFirestoreCollection.mockImplementation(() => ({
  doc: mockDoc,
}));

describe('Get User Tests', () => {
  let mockFirebaseUser: FirebaseAuthTypes.User;

  beforeEach(() => {
    jest.clearAllMocks();
    mockFirebaseUser = {
      uid: 'testUid123',
      displayName: 'Test User',
      email: 'test@example.com',
      phoneNumber: '+1234567890',
    } as FirebaseAuthTypes.User;
  });

  describe('Fetches Firestore user', () => {
    it('retrieves a firestore user', async () => {
      const expectedUser = {firstName: 'Joe'} as User;
      const getFirestoreUserSpy = jest
        .spyOn(getFirestoreUser, 'default')
        .mockResolvedValue(expectedUser);
      const firebaseUser = await getUser(
        mockFirebaseUser as FirebaseAuthTypes.User,
      );

      expect(getFirestoreUserSpy).toBeCalledTimes(1);
      expect(firebaseUser).toEqual(expectedUser);
    });
  });

  describe('does not retrieve a firestore user', () => {
    it('should create a user doc', async () => {
      const expectedUser = {firstName: 'Joe'} as User;
      const loggedInUser = {displayName: 'Joe'} as FirebaseAuthTypes.User;
      jest.spyOn(getFirestoreUser, 'default').mockResolvedValue(undefined);
      const createFireStoreUserSpy = jest
        .spyOn(createFireStoreUser, 'createFirestoreUser')
        .mockResolvedValue(expectedUser);
      const firebaseUser = await getUser(loggedInUser);

      expect(createFireStoreUserSpy).toBeCalledWith(loggedInUser);
      expect(firebaseUser).toEqual(expectedUser);
    });
  });
});
