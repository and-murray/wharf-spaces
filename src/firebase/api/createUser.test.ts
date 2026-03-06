import {createUser} from '@firebase/api/createUser';
import {Endpoints} from '@customTypes/Endpoints';
import User, {BusinessUnit, Role} from '@customTypes/user';
import {FirebaseFirestoreTypes} from '@react-native-firebase/firestore';
import * as FirebaseGoogleAuthentication from '@firebase/authentication/FirebaseGoogleAuthentication';
import * as admin from 'firebase-admin';
import * as appCheckFunction from '@firebase/api/functions';

admin.initializeApp();

const signInSilentlySpy = jest.spyOn(
  FirebaseGoogleAuthentication,
  'signInSilently',
);
const appCheckSpy = jest.spyOn(
    appCheckFunction,
    'getAppCheckToken',
);
const mockAppCheckToken = '123456';
const getGoogleAccessTokensSpy = jest.spyOn(
  FirebaseGoogleAuthentication,
  'getAccessTokens',
);
const mockGoogleAccessTokens = {
  accessToken: 'testAccessToken123',
  idToken: 'testIdToken123',
};
const firebaseTokenSpy = jest.spyOn(FirebaseGoogleAuthentication, 'getTokenID');
const mockEndpoints: Endpoints = {
    carAPIURL: 'https://carapigen2-qg3ssmjwca-ew.a.run.app',
    deskAPIURL: 'https://deskapigen2-qg3ssmjwca-ew.a.run.app',
    genericAPIURL: 'https://apigen2-qg3ssmjwca-ew.a.run.app',
};
describe('createUser Tests', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });
    describe('Sign In Silently fails', () => {
        beforeEach(() => {
            signInSilentlySpy.mockRejectedValueOnce(Error('Permissions of user incorrect'));
        });
        it('Throws an Error', async () => {
            await expect(createUser(mockEndpoints)).rejects.toThrow(Error('Permissions of user incorrect'));
        });
    });
    describe('Sign In Silently Succeeds', () => {
        beforeEach(() => {
            signInSilentlySpy.mockResolvedValue(undefined);
        });
        describe('App Check Token returns correct value', () => {
            beforeEach(() => {
                appCheckSpy.mockResolvedValue(mockAppCheckToken);
            });
            describe('Get Google Access Token Fails', () => {
                beforeEach(() => {
                    getGoogleAccessTokensSpy.mockRejectedValueOnce(Error('Permissions of google tokens incorrect'));
                });
                it('Throws an Error', async () => {
                    await expect(createUser(mockEndpoints)).rejects.toThrow(Error('Permissions of google tokens incorrect'));
                });
            });
            describe('Get Google Access Token Succeeds', () => {
                    beforeEach(() => {
                        getGoogleAccessTokensSpy.mockResolvedValueOnce(mockGoogleAccessTokens);
                    });
                    describe('Get Firebase Auth Token Fails', () => {
                        beforeEach(() => {
                            firebaseTokenSpy.mockRejectedValueOnce(Error('Permissions of firebase tokens incorrect'));
                        });
                        it('Throws an Error', async () => {
                            await expect(createUser(mockEndpoints)).rejects.toThrow(Error('Permissions of firebase tokens incorrect'));
                        });
                    });
                     describe('Get Firebase Auth Token Succeeds', () => {
                            beforeEach(() => {
                                firebaseTokenSpy.mockResolvedValue('ABCDE');
                            });
                            describe('It calls the endpoint successfully', () => {
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
                                beforeEach(() => {
                                    global.fetch = jest.fn().mockResolvedValueOnce({
                                        ok: true,
                                        status: 200,
                                        json: () => (mockUser),
                                    });
                                });
                                it('calls the endpoint with the correct info', async () => {
                                    await createUser(mockEndpoints);
                                    const expectedRequest = {
                                        'headers': {
                                            'Authorization': 'Bearer ABCDE',
                                            'Firebase-AppCheck': '123456',
                                            'Google-Access-Token': 'testAccessToken123',
                                            'Content-Type': 'application/json',
                                        },
                                        'method': 'POST',
                                    };
                                    expect(global.fetch).toHaveBeenCalledWith('https://apigen2-qg3ssmjwca-ew.a.run.app/v1/user', expectedRequest);
                                });
                                it('Returns the user', async () => {
                                    const result = await createUser(mockEndpoints);
                                    expect(result).toEqual(mockUser);
                                });
                            });
                            describe('It calls the endpoint with a failure', () => {
                                beforeEach(() => {
                                    global.fetch = jest.fn().mockResolvedValueOnce({
                                        ok: false,
                                        status: 500,
                                    });
                                });
                                it('calls the endpoint with the correct info', async () => {
                                    const expectedRequest = {
                                            'headers': {
                                                'Authorization': 'Bearer ABCDE',
                                                'Firebase-AppCheck': '123456',
                                                'Google-Access-Token': 'testAccessToken123',
                                                'Content-Type': 'application/json',
                                            },
                                            'method': 'POST',
                                        };
                                    try {
                                        await createUser(mockEndpoints);
                                        fail('Should throw error');
                                    } catch {
                                    expect(global.fetch).toHaveBeenCalledWith('https://apigen2-qg3ssmjwca-ew.a.run.app/v1/user', expectedRequest);
                                    }
                                });
                                it('Throws an error', async () => {
                                    await expect(createUser(mockEndpoints)).rejects.toThrow(Error);
                                });
                            });
                        });
                    });
                });
            });
        });
