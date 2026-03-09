import {User} from '@customTypes/User';
import {getUser} from './getUser';
import {mockFirestoreCollection} from '@root/setup-jest';
import * as getFirestoreUser from './getFirestoreUser';
import * as createFireStoreUser from '@firebase/api/createUser';
import {FirebaseAuthTypes} from '@react-native-firebase/auth';
import {Endpoints} from '@customTypes/Endpoints';

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

const mockEndpoints: Endpoints = {
    carAPIURL: 'https://carapigen2-qg3ssmjwca-ew.a.run.app',
    deskAPIURL: 'https://deskapigen2-qg3ssmjwca-ew.a.run.app',
    genericAPIURL: 'https://apigen2-qg3ssmjwca-ew.a.run.app',
};

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
        mockEndpoints,
      );

      expect(getFirestoreUserSpy).toHaveBeenCalledTimes(1);
      expect(firebaseUser).toEqual(expectedUser);
    });
  });

  describe('does not retrieve a firestore user', () => {
    it('should call create firestore user', async () => {
      const expectedUser = {firstName: 'Joe'} as User;
      const loggedInUser = {displayName: 'Joe'} as FirebaseAuthTypes.User;
      jest.spyOn(getFirestoreUser, 'default').mockResolvedValue(undefined);
      const createFireStoreUserSpy = jest
        .spyOn(createFireStoreUser, 'createUser')
        .mockResolvedValue(expectedUser);
      const firebaseUser = await getUser(loggedInUser, mockEndpoints);

      expect(createFireStoreUserSpy).toHaveBeenCalledWith(mockEndpoints);
      expect(firebaseUser).toEqual(expectedUser);
    });
  });
});
