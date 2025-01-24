import {getLondonTime} from './serverTime.get.controller';
import {Request, Response} from 'express';

let mockServerTimestamp = '2023-06-30T00:00:00Z';
const mockedToDate = jest.fn(() => mockServerTimestamp);
jest.mock('firebase-admin', () => ({
  firestore: {
    Timestamp: {
      now: jest.fn(() => ({
        toDate: mockedToDate,
      })),
    },
  },
}));
describe('Get london server time', () => {
  let mockRequest: Request;
  const mockStatus = jest.fn().mockImplementation(() => ({
    send: mockSend,
  }));
  const mockSend = jest.fn();
  const mockResponse = {
    status: mockStatus,
  } as unknown as Response<any>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockRequest = {} as Request;
  });

  it('should return 200', async () => {
    await getLondonTime(mockRequest, mockResponse);
    expect(mockResponse.status).toBeCalledWith(200);
    expect(mockSend).toBeCalledWith(
      '{"londonServerTime":"2023-06-30T01:00:00"}',
    );
  });
});
