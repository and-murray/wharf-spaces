import {FirebaseAuthTypes} from '@react-native-firebase/auth';
import {FirebaseFirestoreTypes} from '@react-native-firebase/firestore';
import User, {BusinessUnit, Role} from '@customTypes/user';
import * as FirebaseGoogleAuthentication from '../../authentication/FirebaseGoogleAuthentication';
import * as getNameData from '../FirestoreUserAPIs/GetNameData/getNameData';
import * as getOrganisationData from '../FirestoreUserAPIs/GetOrganisationData/getOrganisationData';
import * as getFirestoreUser from './getFirestoreUser';
import * as getServerTimestamp from '../firestoreUtils/getServerTimestamp';
import {createFirestoreUser} from './createFirestoreUser';

const mockFirebaseUser: Partial<FirebaseAuthTypes.User> = {
  uid: 'testUid',
  displayName: 'Test User',
  email: 'test@example.com',
  photoURL: 'https://example.com/test-photo.jpg',
};

const mockTimestamp = {
  seconds: 1586343437,
  nanoseconds: 0,
};

const mockUser: User = {
  id: 'testUid',
  firstName: 'Test',
  lastName: 'User',
  email: 'test@example.com',
  profilePicUrl: 'https://example.com/test-photo.jpg',
  role: Role.user,
  businessUnit: BusinessUnit.murray,
  createdAt: mockTimestamp as FirebaseFirestoreTypes.Timestamp,
  updatedAt: mockTimestamp as FirebaseFirestoreTypes.Timestamp,
};

const mockDemoFirebaseUser: Partial<FirebaseAuthTypes.User> = {
  uid: 'testUid123',
  displayName: 'ANDi Murray',
  email: 'demo@example.com',
};
const demoUser: User = {
  id: 'testUid123',
  firstName: 'ANDi',
  lastName: 'Murray',
  email: 'demo@example.com',
  profilePicUrl: '',
  role: Role.demo,
  businessUnit: BusinessUnit.unknown,
  createdAt: mockTimestamp as FirebaseFirestoreTypes.Timestamp,
  updatedAt: mockTimestamp as FirebaseFirestoreTypes.Timestamp,
};

const mockAccessTokens = {
  accessToken: 'testAccessToken123',
  idToken: 'testIdToken123',
};
const mockNameData = {names: [{givenName: 'Test', familyName: 'User'}]};
const mockOrgData = {organizations: [{department: 'Marketing'}]};

const mockSet = jest.fn(() => {});

jest.mock('../Database', () => ({
  db: {
    collection: () => ({
      doc: () => ({
        set: mockSet,
      }),
    }),
  },
}));

const getFirestoreUserSpy = jest.spyOn(getFirestoreUser, 'default');
const getServerTimestampSpy = jest.spyOn(getServerTimestamp, 'default');
const signInSilentlySpy = jest.spyOn(
  FirebaseGoogleAuthentication,
  'signInSilently',
);
const getAccessTokensSpy = jest.spyOn(
  FirebaseGoogleAuthentication,
  'getAccessTokens',
);
const getNameDataSpy = jest.spyOn(getNameData, 'default');
const getOrganisationDataSpy = jest.spyOn(getOrganisationData, 'default');

describe('createFirestoreUser', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    getFirestoreUserSpy.mockResolvedValue(mockUser);
    getServerTimestampSpy.mockReturnValue(
      mockTimestamp as FirebaseFirestoreTypes.Timestamp,
    );
    signInSilentlySpy.mockResolvedValue(undefined);
    getAccessTokensSpy.mockResolvedValue(mockAccessTokens);
    getNameDataSpy.mockResolvedValue(mockNameData);
    getOrganisationDataSpy.mockResolvedValue(mockOrgData);
  });

  describe('A Demo Account', () => {
    it('creates a Firestore user successfully with prefilled info', async () => {
      // Arrange
      getFirestoreUserSpy.mockResolvedValue(demoUser);

      // Act
      const result = await createFirestoreUser(
        mockDemoFirebaseUser as FirebaseAuthTypes.User,
      );

      // Assert
      expect(result).toEqual(demoUser);
    });
  });
  describe('A normal Account', () => {
    it('creates a Firestore user successfully when passed the correct info', async () => {
      // Act
      const result = await createFirestoreUser(
        mockFirebaseUser as FirebaseAuthTypes.User,
      );

      // Assert
      expect(result).toEqual(mockUser);
    });

    it('throws an error when fails to retrieve Organisation and Name data ', async () => {
      // Arrange
      getNameDataSpy.mockResolvedValue(undefined);
      getOrganisationDataSpy.mockResolvedValue(undefined);

      // Act/Assert
      await expect(
        createFirestoreUser(mockFirebaseUser as FirebaseAuthTypes.User),
      ).rejects.toThrow(Error('Permissions of user incorrect'));
    });

    it('throws correct error when email is invalid', async () => {
      // Arrange
      const mockFirebaseUserWithNoEmail = {
        uid: 'testUid123',
        displayName: 'Test User',
        email: '',
      };

      // Act/Assert
      await expect(
        createFirestoreUser(
          mockFirebaseUserWithNoEmail as FirebaseAuthTypes.User,
        ),
      ).rejects.toThrow(Error('Missing email or key information'));
    });

    it('throws correct error when user has not been created successfully', async () => {
      // Arrange
      getFirestoreUserSpy.mockResolvedValue(undefined);

      // Act/Assert
      await expect(
        createFirestoreUser(mockFirebaseUser as FirebaseAuthTypes.User),
      ).rejects.toThrow(
        Error('Failed to set user: Error: User should now exist'),
      );
    });

    it.each([
      ['Murray', BusinessUnit.murray],
      ['Tenzing', BusinessUnit.tenzing],
      ['Tenzing S&Y', BusinessUnit.tenzing],
      ['S&Y Tenzing', BusinessUnit.tenzing],
      ['Adams', BusinessUnit.adams],
      ['Club Adams', BusinessUnit.adams],
      ['Cloud Adams', BusinessUnit.adams],
      [undefined, BusinessUnit.unknown],
      ['', BusinessUnit.unknown],
      ['nonsense', BusinessUnit.unknown],
    ])(
      'creates a Firestore user with correct BU for department %s',
      async (department, businessUnit) => {
        // Arrange
        getOrganisationDataSpy.mockResolvedValueOnce({
          organizations: [{department}],
        });
        getFirestoreUserSpy.mockResolvedValueOnce({...mockUser, businessUnit});

        // Act
        await createFirestoreUser(mockFirebaseUser as FirebaseAuthTypes.User);

        // Assert on the db call to ensure the department:BU transformation is tested
        // rather than a mocked response from getFirestoreUser
        expect(mockSet).toHaveBeenCalledWith({
          ...mockUser,
          businessUnit,
        });
      },
    );
  });
});
