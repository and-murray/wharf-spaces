import validateFirebaseIdToken from './authentication';
import * as admin from 'firebase-admin';
import {DecodedIdToken} from 'firebase-admin/auth';
import {Request, Response} from 'express';
import {
  createRequest,
  createResponse,
  MockRequest,
  MockResponse,
} from 'node-mocks-http';

describe('Validate Firebase Id Token tests', () => {
  admin.initializeApp();
  let testRequest: MockRequest<Request>;
  let testResponse: MockResponse<Response<any>>;
  let testNextFunction: Function = () => {};

  beforeEach(() => {
    testResponse = createResponse();
  });

  afterAll(() => {
    jest.clearAllMocks();
  });

  describe('When request header does not contain any authorisation', () => {
    describe('When request header does not contain cookies found in session', () => {
      it('Error status 401 received', async () => {
        testRequest = createRequest();
        await validateFirebaseIdToken(
          testRequest,
          testResponse,
          testNextFunction,
        );

        expect(testResponse.statusCode).toBe(401);
      });
    });

    describe('When request header does contain cookies found in session', () => {
      it('No Error received', async () => {
        const mockToken = 'Bearer eyTEST12345';
        testRequest = createRequest({
          cookies: {
            __session: mockToken,
          },
        });
        const firebaseAuthSpy = jest.spyOn(admin.auth(), 'verifyIdToken');
        firebaseAuthSpy.mockResolvedValue(
          mockToken as unknown as DecodedIdToken,
        ); // Force casting to remove error

        await validateFirebaseIdToken(
          testRequest,
          testResponse,
          testNextFunction,
        );

        expect(testResponse.statusCode).toBe(200);
      });
    });
  });

  describe('When request header does contain authorisation', () => {
    describe('When request header does not contain a Bearer token', () => {
      it('Error status 401 received', async () => {
        testRequest = createRequest({
          headers: {
            authorization: 'NOTBEARER eyTEST12345',
          },
        });
        await validateFirebaseIdToken(
          testRequest,
          testResponse,
          testNextFunction,
        );

        expect(testResponse.statusCode).toBe(401);
      });
    });

    describe('When request header does contain a Bearer token', () => {
      it('No Error received', async () => {
        const mockToken = 'Bearer eyTEST12345';
        testRequest = createRequest({
          headers: {
            authorization: mockToken,
          },
        });
        const firebaseAuthSpy = jest.spyOn(admin.auth(), 'verifyIdToken');
        firebaseAuthSpy.mockResolvedValue(
          mockToken as unknown as DecodedIdToken,
        ); // Force casting to remove error

        await validateFirebaseIdToken(
          testRequest,
          testResponse,
          testNextFunction,
        );

        expect(testResponse.statusCode).toBe(200);
      });
    });
  });
});
