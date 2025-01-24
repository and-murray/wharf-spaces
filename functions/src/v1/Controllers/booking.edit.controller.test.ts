import {Request, Response} from 'express';
import {editBookings} from './booking.edit.controller';
import * as editExistingBookings from '../Services/FirebaseAdminService/editExistingBookings';

const editExistingBookingsSpy = jest.spyOn(
  editExistingBookings,
  'editExistingBookings',
);
describe('Edit Bookings Controller', () => {
  const mockStatus = jest.fn().mockImplementation(() => ({
    send: mockSend,
  }));
  const mockSend = jest.fn();
  const mockResponse = {
    status: mockStatus,
  } as unknown as Response<any>;

  let mockRequest: Request;

  beforeEach(() => {
    jest.clearAllMocks();
    mockRequest = {
      body: [],
    } as Request;
  });
  describe('when passed an invalid request ', () => {
    it('should return 400', async () => {
      const emptyBookingObj = {};
      mockRequest.body = emptyBookingObj;
      await editBookings(mockRequest, mockResponse);
      expect(mockResponse.status).toBeCalledWith(400);
    });

    it('should return 403 when no user Id is passed in', async () => {
      mockRequest.body = mockRequest.body = {
        bookings: [
          {
            bookingId: '123',
            newTimeSlot: 'am',
          },
        ],
      };
      await editBookings(mockRequest, mockResponse);
      expect(mockResponse.status).toBeCalledWith(403);
    });
  });

  describe('Edit existing bookings function succeeds', () => {
    it('should return 204 no content status', async () => {
      mockRequest = {
        body: {
          bookings: [
            {
              bookingId: '123',
              newTimeSlot: 'am',
            },
          ],
        },
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
      editExistingBookingsSpy.mockResolvedValue();
      await editBookings(mockRequest, mockResponse);
      expect(mockResponse.status).toBeCalledWith(204);
    });
  });
});
