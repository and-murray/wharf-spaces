import type {Request, Response} from 'express';
import {createUser} from './user.create.controller';
import {User} from '../Models/booking.model';
import {Timestamp} from 'firebase-admin/firestore';
import * as getFirestoreUser from '../Services/FirebaseAdminService/getFirestoreUser';

const getFirestoreUserSpy = jest.spyOn(getFirestoreUser, 'getFirestoreUser');
jest.mock('firebase-admin', () => ({
  initializeApp: jest.fn(),
  auth: jest.fn(),
}));
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
        });
    });
});
