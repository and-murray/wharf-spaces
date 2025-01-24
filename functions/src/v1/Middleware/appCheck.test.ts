import * as admin from 'firebase-admin';
import {DecodedIdToken} from 'firebase-admin/auth';
import type {Request, Response} from 'express';
import {
  createRequest,
  createResponse,
  MockRequest,
  MockResponse,
} from 'node-mocks-http';
import {DecodedAppCheckToken} from 'firebase-admin/app-check';
import appCheck from './appCheck';

admin.initializeApp();

const firebaseAuthSpy = jest.spyOn(admin.auth(), 'verifyIdToken');

describe('Validate App Check Token tests', () => {
  let testRequest: MockRequest<Request>;
  let testResponse: MockResponse<Response>;
  let testNextFunction: Function = () => {};
  const mockAuthToken = 'Bearer eyTEST12345';
  const mockToken = '123456';
  beforeEach(() => {
    firebaseAuthSpy.mockResolvedValue(
      mockAuthToken as unknown as DecodedIdToken,
    );
    testResponse = createResponse();
  });

  afterAll(() => {
    jest.clearAllMocks();
  });

  describe('When request header does contain App Check Token', () => {
    describe('When request header does not contain an App Check Token', () => {
      it('Error status 401 received', async () => {
        testRequest = createRequest({
          headers: {
            authorization: mockAuthToken,
          },
        });
        await appCheck(testRequest, testResponse, testNextFunction);

        expect(testResponse.statusCode).toBe(401);
      });
    });

    describe('When request header does contain an App Check token', () => {
      describe('It has an incorrect app id', () => {
        it('Receives a 401', async () => {
          testRequest = createRequest({
            headers: {
              authorization: mockAuthToken,
              'x-firebase-appcheck': mockToken,
            },
          });
          const firebaseAppCheckSpy = jest.spyOn(
            admin.appCheck(),
            'verifyToken',
          );
          firebaseAppCheckSpy.mockResolvedValue({
            appId: 'some id',
            token: mockToken as unknown as DecodedAppCheckToken,
          }); // Force casting to remove error

          await appCheck(testRequest, testResponse, testNextFunction);

          expect(testResponse.statusCode).toBe(401);
        });
      });

      describe('It has a valid id', () => {
        it('Receives no error', async () => {
          testRequest = createRequest({
            headers: {
              authorization: mockAuthToken,
              'x-firebase-appcheck': mockToken,
            },
          });
          const firebaseAppCheckSpy = jest.spyOn(
            admin.appCheck(),
            'verifyToken',
          );
          firebaseAppCheckSpy.mockResolvedValue({
            appId: '1:766732919970:ios:780269d67752bb334623fb',
            token: mockToken as unknown as DecodedAppCheckToken,
          }); // Force casting to remove error

          await appCheck(testRequest, testResponse, testNextFunction);

          expect(testResponse.statusCode).toBe(200);
        });
      });
    });
  });
});
