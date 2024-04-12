import {getLondonTime} from './serverTime.get.controller';
import * as functions from 'firebase-functions';

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
  let mockRequest: functions.https.Request;
  const mockStatus = jest.fn().mockImplementation(() => ({
    send: mockSend,
  }));
  const mockSend = jest.fn();
  const mockResponse = {
    status: mockStatus,
  } as unknown as functions.Response<any>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockRequest = {} as functions.https.Request;
  });

  it('should return 200', async () => {
    await getLondonTime(mockRequest, mockResponse);
    expect(mockResponse.status).toBeCalledWith(200);
    expect(mockSend).toBeCalledWith(
      '{"londonServerTime":"2023-06-30T01:00:00"}',
    );
  });
});
