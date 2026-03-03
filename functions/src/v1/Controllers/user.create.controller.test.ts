import type {Request, Response} from 'express';
import {createUser} from './user.create.controller';
import {BusinessUnit, Role, User} from '../Models/booking.model';
import {Timestamp} from 'firebase-admin/firestore';
import * as firestoreUser from '../Services/FirebaseAdminService/firestoreUser';
import { DecodedIdToken } from 'firebase-admin/auth';
import * as getFirestoreServerTimestamp from '../utils/FirebaseUtils/FirestoreTimestamp';

const getFirestoreUserSpy = jest.spyOn(firestoreUser, 'getFirestoreUser');
const createFirestoreUserSpy = jest.spyOn(firestoreUser, 'createFirestoreUser');
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
        // const mockUser: User = {
        //   id: 'testUid',
        //   firstName: 'Test',
        //   lastName: 'User',
        //   email: 'test@example.com',
        //   profilePicUrl: 'https://example.com/test-photo.jpg',
        //   role: 'user',
        //   businessUnit: 'murray',
        //   createdAt: new Timestamp(0, 0),
        //   updatedAt: new Timestamp(0, 0),
        // };
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
                mockRequest.headersDistinct['x-google-access-token'] = ['123456'];
            });
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
        });
    });
});
