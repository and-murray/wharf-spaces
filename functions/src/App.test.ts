import App from './App';
import type {Request, Response} from 'express';
import supertest from 'supertest';
import validateFirebaseIdToken from './v1/Middleware/authentication';
import {DecodedIdToken} from 'firebase-admin/auth';
import removeBookings from './v1/Controllers/booking.remove.controller';
import createNewBookings from './v1/Controllers/booking.create.controller';
import appCheck from './v1/Middleware/appCheck';

jest.mock('./v1/Middleware/authentication', () => jest.fn());
jest.mock('./v1/Middleware/appCheck', () => jest.fn());
jest.mock('./v1/Controllers/booking.create.controller', () => jest.fn());
jest.mock('./v1/Controllers/booking.remove.controller', () => jest.fn());

describe('Desk Booking Function', () => {
  afterAll(() => {
    jest.clearAllMocks();
  });
  describe('Is Not Authenticated', () => {
    let request: supertest.SuperTest<supertest.Test>;
    beforeEach(() => {
      jest.clearAllMocks();
      createMockMiddleware(false);
      createMockAppCheckMiddleware();
      request = supertest(App);
    });

    describe('Delete Request', () => {
      it('should return a 401', async () => {
        const testResponse = await request.delete('/v1/booking');
        expect(testResponse.statusCode).toBe(401);
      });
    });
    describe('Post Request', () => {
      it('should return a 401', async () => {
        const testResponse = await request.post('/v1/booking');
        expect(testResponse.statusCode).toBe(401);
      });
    });
  });
  describe('Is Authenticated', () => {
    let request: supertest.SuperTest<supertest.Test>;
    beforeEach(() => {
      jest.clearAllMocks();
      createMockMiddleware(true);
      createMockAppCheckMiddleware();
      request = supertest(App);
    });
    describe('Creating Bookings', () => {
      it('should have called createNewBookings callback and return 201', async () => {
        const createNewBookingsMock = forceTypeToMockFunction(
          createNewBookings,
        ).mockImplementationOnce((_req, res) => {
          res.status(201).send();
          return Promise.resolve();
        });
        await request
          .post('/v1/booking')
          .send(JSON.stringify({bookings: []}))
          .set('Content-Type', 'application/json')
          .then(res => {
            expect(res.statusCode).toBe(201);
            expect(createNewBookingsMock).toBeCalledTimes(1);
          });
      });
    });

    describe('"Delete" Bookings Request', () => {
      it('should have called removeBookings and return 204', async () => {
        const removeBookingsMock = forceTypeToMockFunction(
          removeBookings,
        ).mockImplementationOnce(async (_req, res) => {
          res.status(204).send();
        });
        await request
          .delete('/v1/booking')
          .send(JSON.stringify({bookingIds: []}))
          .set('Content-Type', 'application/json')
          .then(res => {
            expect(res.statusCode).toBe(204);
            expect(removeBookingsMock).toBeCalledTimes(1);
          });
      });
    });
  });
});

const createMockAppCheckMiddleware = () => {
  forceTypeToMockFunction(appCheck).mockImplementation(
    async (_req: Request, _res: Response, next: Function) => {
      next();
    },
  );
};

const createMockMiddleware = (isAuthenticated: boolean) => {
  forceTypeToMockFunction(validateFirebaseIdToken).mockImplementation(
    async (req: Request, res: Response, next: Function) => {
      if (isAuthenticated) {
        const token: DecodedIdToken = {
          aud: '',
          auth_time: 0,
          exp: 0,
          firebase: {
            identities: {},
            sign_in_provider: '',
            sign_in_second_factor: undefined,
            second_factor_identifier: undefined,
            tenant: undefined,
          },
          iat: 0,
          iss: '',
          sub: '',
          uid: '1234',
        };
        req.user = token;
        next();
      } else {
        res.status(401).send('Unauthorized');
      }
    },
  );
};

const forceTypeToMockFunction = <F extends (...args: any[]) => any>(f: F) => {
  return f as jest.MockedFunction<F>;
};
