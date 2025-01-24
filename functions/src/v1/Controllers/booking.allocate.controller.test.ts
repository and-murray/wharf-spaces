import type {Request, Response} from 'express';
import * as isBookingDateLimitedToBU from '../utils/BookingUtils/BookingUtils';
import * as checkBookingCapacity from '../Services/DeskCapacity/checkBookingCapacity';
import * as assignEmptySpacesToReserved from '../Services/FirebaseAdminService/assignEmptySpacesToReserved';
import {allocateEmptySlots} from './booking.allocate.controller';

const isBookingDateLimitedToBUSpy = jest.spyOn(
  isBookingDateLimitedToBU,
  'isBookingDateLimitedToBU',
);
const checkBookingCapacitySpy = jest.spyOn(
  checkBookingCapacity,
  'checkBookingCapacity',
);
const assignEmptySpacesToReservedSpy = jest.spyOn(
  assignEmptySpacesToReserved,
  'assignEmptySpacesToReserved',
);
describe('Allocate Empty Slots Controller', () => {
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
    } as Request;
    checkBookingCapacitySpy.mockResolvedValue({am: 1, pm: 1, allDay: 1});
  });
  describe('when passed an invalid request ', () => {
    it('should return 400', async () => {
      const emptyBookingObj = {};
      mockRequest.body = emptyBookingObj;
      await allocateEmptySlots(mockRequest, mockResponse);
      expect(mockResponse.status).toBeCalledWith(400);
    });
  });

  describe('Is Sent Car Type', () => {
    describe('Booking Date is Limited to BU', () => {
      beforeEach(() => {
        isBookingDateLimitedToBUSpy.mockReturnValue(true);
      });
      describe('No BU Is Provided', () => {
        it('Should return a 400 error', async () => {
          mockRequest = {
            body: {
              date: '2023-05-11T00:00:00Z',
              spaceType: 'car',
            },
          } as Request;
          assignEmptySpacesToReservedSpy.mockResolvedValue(true);
          await allocateEmptySlots(mockRequest, mockResponse);
          expect(mockResponse.status).toBeCalledWith(400);
        });
      });

      describe('A BU Is Provided', () => {
        it('should return 204 no content status', async () => {
          mockRequest = {
            body: {
              date: '2023-05-11T00:00:00Z',
              spaceType: 'car',
              businessUnit: 'murray',
            },
          } as Request;
          assignEmptySpacesToReservedSpy.mockResolvedValue(true);
          isBookingDateLimitedToBUSpy.mockReturnValue(true);
          await allocateEmptySlots(mockRequest, mockResponse);
          expect(mockResponse.status).toBeCalledWith(204);
        });
      });
    });

    describe('Booking Date is not limited to BU', () => {
      beforeEach(() => {
        isBookingDateLimitedToBUSpy.mockReturnValue(false);
      });
      describe('No BU Is Provided', () => {
        it('should return 204 no content status', async () => {
          mockRequest = {
            body: {
              date: '2023-05-11T00:00:00Z',
              spaceType: 'car',
            },
          } as Request;
          assignEmptySpacesToReservedSpy.mockResolvedValue(true);
          isBookingDateLimitedToBUSpy.mockReturnValue(false);
          await allocateEmptySlots(mockRequest, mockResponse);
          expect(mockResponse.status).toBeCalledWith(204);
        });
      });

      describe('A BU Is Provided', () => {
        it('should return 204 no content status', async () => {
          mockRequest.body = {
            date: '2023-05-11T00:00:00Z',
            spaceType: 'car',
            businessUnit: 'murray',
          };
          assignEmptySpacesToReservedSpy.mockResolvedValue(true);
          await allocateEmptySlots(mockRequest, mockResponse);
          expect(mockResponse.status).toBeCalledWith(204);
        });
      });
    });
  });
  describe('Is NOT sent car type', () => {
    describe('Booking Date is Limited to BU', () => {
      beforeEach(() => {
        isBookingDateLimitedToBUSpy.mockReturnValue(true);
      });
      describe('No BU Is Provided', () => {
        it('should return 204 no content status', async () => {
          mockRequest = {
            body: {
              date: '2023-05-11T00:00:00Z',
              spaceType: 'desk',
            },
          } as Request;
          assignEmptySpacesToReservedSpy.mockResolvedValue(true);
          await allocateEmptySlots(mockRequest, mockResponse);
          expect(mockResponse.status).toBeCalledWith(204);
        });
      });

      describe('A BU Is Provided', () => {
        it('should return 204 no content status', async () => {
          mockRequest = {
            body: {
              date: '2023-05-11T00:00:00Z',
              spaceType: 'desk',
              businessUnit: 'murray',
            },
          } as Request;
          assignEmptySpacesToReservedSpy.mockResolvedValue(true);
          isBookingDateLimitedToBUSpy.mockReturnValue(true);
          await allocateEmptySlots(mockRequest, mockResponse);
          expect(mockResponse.status).toBeCalledWith(204);
        });
      });
    });

    describe('Booking Date is not limited to BU', () => {
      beforeEach(() => {
        isBookingDateLimitedToBUSpy.mockReturnValue(false);
      });
      describe('No BU Is Provided', () => {
        it('should return 204 no content status', async () => {
          mockRequest = {
            body: {
              date: '2023-05-11T00:00:00Z',
              spaceType: 'desk',
            },
          } as Request;
          assignEmptySpacesToReservedSpy.mockResolvedValue(true);
          await allocateEmptySlots(mockRequest, mockResponse);
          expect(mockResponse.status).toBeCalledWith(204);
        });
      });

      describe('A BU Is Provided', () => {
        it('should return 204 no content status', async () => {
          mockRequest = {
            body: {
              date: '2023-05-11T00:00:00Z',
              spaceType: 'desk',
              businessUnit: 'murray',
            },
          } as Request;
          assignEmptySpacesToReservedSpy.mockResolvedValue(true);
          await allocateEmptySlots(mockRequest, mockResponse);
          expect(mockResponse.status).toBeCalledWith(204);
        });
      });
    });
  });
});
