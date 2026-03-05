import type {Request, Response} from 'express';
import {createUser} from './user.create.controller';
import {BusinessUnit, Role, User} from '../Models/booking.model';
import {Timestamp} from 'firebase-admin/firestore';
import * as firestoreUser from '../Services/FirebaseAdminService/firestoreUser';
import { DecodedIdToken } from 'firebase-admin/auth';
import * as getFirestoreServerTimestamp from '../utils/FirebaseUtils/FirestoreTimestamp';
import * as getPersonData from '../Services/GoogleAPI/getPersonData';
import { people_v1 } from 'googleapis';

const getFirestoreUserSpy = jest.spyOn(firestoreUser, 'getFirestoreUser');
const createFirestoreUserSpy = jest.spyOn(firestoreUser, 'createFirestoreUser');
const getPersonDataSpy = jest.spyOn(getPersonData, 'getPersonData');

jest.mock('firebase-admin', () => ({
  initializeApp: jest.fn(),
  auth: jest.fn(),
}));
const getFirestoreServerTimestampSpy = jest.spyOn(getFirestoreServerTimestamp, 'default');
const mockTimestamp = {
  seconds: 1586343437,
  nanoseconds: 0,
};
describe('Creates User', () => {
    const mockStatus = jest.fn().mockImplementation(() => ({
        send: mockSend,
    }));
    const mockSend = jest.fn();
    const mockResponse = {
        status: mockStatus,
    } as unknown as Response;

    let mockRequest: Request;

    beforeEach(() => {
        jest.clearAllMocks();
        mockRequest = {
            body: [],
            headersDistinct: {},
            user: { uid: '123' },
        } as Request;
        getFirestoreServerTimestampSpy.mockReturnValue(mockTimestamp as Timestamp);
    });

    describe('When no user id is found ', () => {
        it('should return 400', async () => {
            mockRequest.user = undefined;
            await createUser(mockRequest, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(400);
        });
    });

    describe('Finds a firestore user', () => {
        const mockUser: User = {
          id: 'testUid',
          firstName: 'Test',
          lastName: 'User',
          email: 'test@example.com',
          profilePicUrl: 'https://example.com/test-photo.jpg',
          role: 'user',
          businessUnit: 'murray',
          createdAt: new Timestamp(0, 0),
          updatedAt: new Timestamp(0, 0),
        };
        beforeEach(() => {
            getFirestoreUserSpy.mockResolvedValue(mockUser);
        });
        it('should return the found user', async() => {
            await createUser(mockRequest, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockSend).toHaveBeenCalledWith(JSON.stringify(mockUser));
        });
    });

    describe('Does not find an existing user', () => {
        beforeEach(() => {
            getFirestoreUserSpy.mockRejectedValueOnce(new Error('No User found'));
        });
        describe('does not have a google access token header', () => {
            it('should return a 400 error', async () => {
                await createUser(mockRequest, mockResponse);
                expect(mockResponse.status).toHaveBeenCalledWith(400);
                expect(mockSend).toHaveBeenCalledWith('No google access token');
            });
        });

        describe('Contains a google access token header', () => {
            beforeEach(() => {
                mockRequest.headers['google-access-token'] = ['123456'];
            });
            describe('User token does not have an email', () => {
                it('throws an error', async() => {
                    const userToken: DecodedIdToken = {
                        aud: '',
                        id: '123',
                        auth_time: 0,
                        exp: 0,
                        firebase: {identities: {}, sign_in_provider: ''},
                        iat: 0,
                        iss: '',
                        sub: '',
                        uid: '456',
                    };
                    mockRequest.user = userToken;
                    await createUser(mockRequest, mockResponse);
                    const expectedError = new Error('Missing email or key information');
                    expect(mockResponse.status).toHaveBeenCalledWith(500);
                    expect(mockSend).toHaveBeenCalledWith(expectedError);
                });
            });
            describe('User token has an email', () => {
                describe('Is a demo account', () => {
                    it('returns the demo account', async () => {
                        const userToken: DecodedIdToken = {
                            aud: '',
                            id: '123',
                            email: 'demo@example.com',
                            auth_time: 0,
                            exp: 0,
                            firebase: {identities: {}, sign_in_provider: ''},
                            iat: 0,
                            iss: '',
                            sub: '',
                            uid: '456',
                        };
                        mockRequest.user = userToken;
                        const expectedUser: User = {
                            id: '456',
                            firstName: 'ANDi',
                            lastName: 'Murray',
                            email: 'demo@example.com',
                            profilePicUrl: '',
                            role: Role.Enum.demo,
                            businessUnit: BusinessUnit.Enum.unknown,
                            createdAt: mockTimestamp as Timestamp,
                            updatedAt: mockTimestamp as Timestamp,
                        };
                        createFirestoreUserSpy.mockResolvedValueOnce(expectedUser);
                        await createUser(mockRequest, mockResponse);
                        expect(createFirestoreUserSpy).toHaveBeenCalledWith(expectedUser);
                        expect(mockResponse.status).toHaveBeenCalledWith(200);
                        expect(mockSend).toHaveBeenCalledWith(JSON.stringify(expectedUser));
                    });
                });
                describe('Is a real user account', () => {
                    const userToken: DecodedIdToken = {
                        aud: '',
                        id: '123',
                        email: 'test@example.com',
                        auth_time: 0,
                        exp: 0,
                        firebase: {identities: {}, sign_in_provider: ''},
                        iat: 0,
                        iss: '',
                        sub: '',
                        uid: 'testUid',
                        picture: 'https://example.com/test-photo.jpg',
                    };
                    const mockUser: User = {
                        id: 'testUid',
                        firstName: 'Test',
                        lastName: 'User',
                        email: 'test@example.com',
                        profilePicUrl: 'https://example.com/test-photo.jpg',
                        role: 'user',
                        businessUnit: 'murray',
                        createdAt: mockTimestamp as Timestamp,
                        updatedAt: mockTimestamp as Timestamp,
                    };
                    beforeEach(() => {
                        mockRequest.user = userToken;
                    });
                    describe('requests person data from google fails', () => {
                        it('throws an error', async () => {
                            const mockError = new Error('Person Data API failed');
                            getPersonDataSpy.mockRejectedValueOnce(mockError);
                            await createUser(mockRequest, mockResponse);
                            expect(mockResponse.status).toHaveBeenCalledWith(500);
                            expect(mockSend).toHaveBeenCalledWith(mockError);
                        });
                    });
                    describe('requests person data from google successful', () => {
                        describe('returns a person from Murray', () => {
                            let mockPersonData: people_v1.Schema$Person = {
                                names: [{givenName: 'Test', familyName: 'User'}, {givenName: 'Ignore', familyName: 'Ignore'}],
                                organizations: [{department: 'club murray'}],
                            };
                            it('creates a user with the murray BU', async () => {
                                getPersonDataSpy.mockResolvedValue(mockPersonData);
                                createFirestoreUserSpy.mockResolvedValueOnce(mockUser);
                                await createUser(mockRequest, mockResponse);
                                expect(createFirestoreUserSpy).toHaveBeenCalledWith(mockUser);
                                expect(mockResponse.status).toHaveBeenCalledWith(200);
                                expect(mockSend).toHaveBeenCalledWith(JSON.stringify(mockUser));
                            });
                        });
                        describe('returns a person from adams', () => {
                            let mockPersonData: people_v1.Schema$Person = {
                                names: [{givenName: 'Test', familyName: 'User'}, {givenName: 'Ignore', familyName: 'Ignore'}],
                                organizations: [{department: 'club adams'}],
                            };
                            it('creates a user with the adams BU', async () => {
                                    mockUser.businessUnit = BusinessUnit.Enum.adams;
                                    getPersonDataSpy.mockResolvedValue(mockPersonData);
                                    createFirestoreUserSpy.mockResolvedValueOnce(mockUser);
                                    await createUser(mockRequest, mockResponse);
                                    expect(createFirestoreUserSpy).toHaveBeenCalledWith(mockUser);
                                    expect(mockResponse.status).toHaveBeenCalledWith(200);
                                    expect(mockSend).toHaveBeenCalledWith(JSON.stringify(mockUser));
                            });
                        });
                        describe('returns a person from vaughan', () => {
                             let mockPersonData: people_v1.Schema$Person = {
                                names: [{givenName: 'Test', familyName: 'User'}, {givenName: 'Ignore', familyName: 'Ignore'}],
                                organizations: [{department: 'club vaughan'}],
                            };
                            it('creates a user with the adams BU', async () => {
                                mockUser.businessUnit = BusinessUnit.Enum.adams;
                                getPersonDataSpy.mockResolvedValue(mockPersonData);
                                createFirestoreUserSpy.mockResolvedValueOnce(mockUser);
                                await createUser(mockRequest, mockResponse);
                                expect(createFirestoreUserSpy).toHaveBeenCalledWith(mockUser);
                                expect(mockResponse.status).toHaveBeenCalledWith(200);
                                expect(mockSend).toHaveBeenCalledWith(JSON.stringify(mockUser));
                            });
                        });
                        describe('returns a person from tenzing', () => {
                            it('creates a user with the tenzing BU', async () => {
                                let mockPersonData: people_v1.Schema$Person = {
                                    names: [{givenName: 'Test', familyName: 'User'}, {givenName: 'Ignore', familyName: 'Ignore'}],
                                    organizations: [{department: 's&y tenzing'}],
                                };
                                mockUser.businessUnit = BusinessUnit.Enum.tenzing;
                                getPersonDataSpy.mockResolvedValue(mockPersonData);
                                createFirestoreUserSpy.mockResolvedValueOnce(mockUser);
                                await createUser(mockRequest, mockResponse);
                                expect(createFirestoreUserSpy).toHaveBeenCalledWith(mockUser);
                                expect(mockResponse.status).toHaveBeenCalledWith(200);
                                expect(mockSend).toHaveBeenCalledWith(JSON.stringify(mockUser));
                            });
                        });
                        describe('returns a person from an unknown club', () => {
                            it('creates a user with an unknown BU', async () => {
                                let mockPersonData: people_v1.Schema$Person = {
                                    names: [{givenName: 'Test', familyName: 'User'}, {givenName: 'Ignore', familyName: 'Ignore'}],
                                    organizations: [{department: 'random club name'}],
                                };
                                mockUser.businessUnit = BusinessUnit.Enum.unknown;
                                getPersonDataSpy.mockResolvedValue(mockPersonData);
                                createFirestoreUserSpy.mockResolvedValueOnce(mockUser);
                                await createUser(mockRequest, mockResponse);
                                expect(createFirestoreUserSpy).toHaveBeenCalledWith(mockUser);
                                expect(mockResponse.status).toHaveBeenCalledWith(200);
                                expect(mockSend).toHaveBeenCalledWith(JSON.stringify(mockUser));
                            });
                        });
                    });
                });
            });
        });
    });
});
