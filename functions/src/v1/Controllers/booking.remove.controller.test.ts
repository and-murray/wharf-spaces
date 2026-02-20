import * as firebaseAdminService from '../Services/FirebaseAdminService/firebaseAdminService';
import * as firebaseSpaceReassignService from '../Services/FirebaseAdminService/firebaseSpaceReassignService';
import removeBookings from './booking.remove.controller';
import type {Request, Response} from 'express';
import {ZodError} from 'zod';
import createError from 'http-errors';

jest.mock('uuid', () => ({v4: () => '1'}));
jest.mock('../Config');

describe('Remove Booking controller', () => {
  const deleteBookingsSpy = jest
    .spyOn(firebaseAdminService, 'deleteBookings')
    .mockResolvedValue([]);

  const reassignBookingSpy = jest
    .spyOn(firebaseSpaceReassignService, 'assignSpacesToReserved')
    .mockResolvedValue(true);

  const mockStatus = jest.fn().mockImplementation(() => ({
    send: mockSend,
  }));
  const mockSend = jest.fn();
  const mockResponse = {
    status: mockStatus,
  } as unknown as Response;

  describe('has the correct request', () => {
    let mockRequest: Request;
    beforeEach(() => {
      jest.clearAllMocks();
      mockRequest = {
        body: {bookingIds: ['1234', '5678']},
        user: {
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
          uid: '98765',
        },
      } as Request;
    });

    it('should call delete bookings with correct parameters and assignSpacesToReserved', async () => {
      await removeBookings(mockRequest, mockResponse);
      expect(deleteBookingsSpy).toBeCalledWith(['1234', '5678'], '98765');
      expect(reassignBookingSpy).toBeCalledTimes(1);
    });

    describe('delete bookings succeeds', () => {
      it('should return 204', async () => {
        await removeBookings(mockRequest, mockResponse);
        expect(mockResponse.status).toBeCalledWith(204);
      });
    });

    describe('delete bookings fails', () => {
      it('should return the error thrown from delete bookings and assignSpacesToReserved is not called', async () => {
        const httpError = new createError.Forbidden();
        deleteBookingsSpy.mockRejectedValueOnce(httpError);
        await removeBookings(mockRequest, mockResponse);
        expect(mockResponse.status).toBeCalledWith(403);
        expect(mockSend).toBeCalledWith('Forbidden');
        expect(reassignBookingSpy).toBeCalledTimes(0);
      });
    });
  });
  describe('Is called with incorrect parameters', () => {
    let mockRequest: Request;
    beforeEach(() => {
      mockRequest = {
        body: {bookingIds: '1234'},
        user: {
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
        },
      } as Request;
    });

    it('Should return a 400', async () => {
      await removeBookings(mockRequest, mockResponse);
      expect(mockResponse.status).toBeCalledWith(400);
    });

    it('Should return the error', async () => {
      await removeBookings(mockRequest, mockResponse);
      expect(mockSend).toBeCalled();
      const error = new ZodError([
        {
          code: 'invalid_type',
          expected: 'array',
          received: 'string',
          path: ['bookingIds'],
          message: 'Expected array, received string',
        },
      ]);
      expect(mockSend).toBeCalledWith(error);
    });
  });
});
