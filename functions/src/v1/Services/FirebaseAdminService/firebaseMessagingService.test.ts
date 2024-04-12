import sendNotifications from './firebaseMessagingService';

const mockBatchUpdate = jest.fn().mockReturnThis();
const mockBatchCommit = jest.fn();
const mockGet = jest.fn();
const mockWhere = jest.fn();
const mockSendEachForMulticast = jest.fn();

const mockDoc = jest.fn(() => ({
  get: mockGet,
}));

const mockCollection = jest.fn(() => ({
  get: mockGet,
  where: mockWhere,
  doc: mockDoc,
}));

jest.mock('firebase-admin', () => ({
  initializeApp: jest.fn(),
  firestore: () => ({
    batch: () => ({
      update: mockBatchUpdate,
      commit: mockBatchCommit,
    }),
    collection: mockCollection,
  }),
  messaging: () => ({
    sendEachForMulticast: mockSendEachForMulticast,
  }),
}));

jest.mock('../../utils/ArrayUtils/ArrayUtils', () => ({
  arrayRemove: jest.fn().mockImplementation(x => x),
}));

describe('WHEN sendNotification is invoked', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('AND one user id is provided', () => {
    describe('AND one token is provided', () => {
      describe('AND runs successfully', () => {
        beforeEach(() => {
          mockSendEachForMulticast.mockResolvedValue({failureCount: 0});
        });
        it('it should send one notification', async () => {
          const messageBody = () => ({
            notification: {title: 'Title', body: 'Body'},
          });
          const userId = '1';

          mockGet.mockResolvedValueOnce({
            ref: '1',
            data: () => ({
              tokens: ['1'],
            }),
          });

          await sendNotifications(messageBody, [userId]);

          expect(mockSendEachForMulticast).toBeCalledWith({
            android: {priority: 'high'},
            notification: {body: 'Body', title: 'Title'},
            tokens: ['1'],
          });
        });
      });
      describe('AND fails', () => {
        beforeEach(() => {
          mockSendEachForMulticast.mockResolvedValue({
            failureCount: 1,
            responses: [{error: {code: 'messaging/invalid-argument'}}],
          });
        });

        it('it should responde with an error and delete the token', async () => {
          const messageBody = () => ({
            notification: {title: 'Title', body: 'Body'},
          });
          const userId = '1';
          expect.assertions(2);
          mockGet.mockResolvedValueOnce({
            ref: '1',
            data: () => ({
              tokens: ['User Token'],
            }),
          });

          await sendNotifications(messageBody, [userId]);

          expect(mockSendEachForMulticast).toBeCalledWith({
            android: {priority: 'high'},
            notification: {body: 'Body', title: 'Title'},
            tokens: ['User Token'],
          });

          expect(mockBatchUpdate).toBeCalledWith('1', {tokens: 'User Token'});
        });
      });
    });

    describe('AND multiple token is provided', () => {
      describe('AND runs successfully', () => {
        beforeEach(() => {
          mockSendEachForMulticast.mockResolvedValue({failureCount: 0});
        });
        it('it should send multiple notification', async () => {
          const messageBody = () => ({
            notification: {title: 'Title', body: 'Body'},
          });
          const userId = '1';

          mockGet.mockResolvedValueOnce({
            ref: '1',
            data: () => ({
              tokens: ['1', '2', '3'],
            }),
          });

          await sendNotifications(messageBody, [userId]);

          expect(mockSendEachForMulticast).toBeCalledWith({
            android: {priority: 'high'},
            notification: {body: 'Body', title: 'Title'},
            tokens: ['1', '2', '3'],
          });
        });
      });

      describe('AND fails', () => {
        beforeEach(() => {
          mockSendEachForMulticast.mockResolvedValue({
            failureCount: 1,
            responses: [
              'success',
              {error: {code: 'messaging/invalid-argument'}},
              'success',
            ],
          });
        });

        it('it should send multiple notification', async () => {
          const messageBody = () => ({
            notification: {title: 'Title', body: 'Body'},
          });
          const userId = '1';

          mockGet.mockResolvedValueOnce({
            ref: '1',
            data: () => ({
              tokens: ['usertoken1', 'usertoken12', 'usertoken13'],
            }),
          });

          await sendNotifications(messageBody, [userId]);

          expect(mockSendEachForMulticast).toBeCalledWith({
            android: {priority: 'high'},
            notification: {body: 'Body', title: 'Title'},
            tokens: ['usertoken1', 'usertoken12', 'usertoken13'],
          });
          expect(mockBatchUpdate).toBeCalledWith('1', {tokens: 'usertoken12'});
        });
      });
    });
  });

  describe('AND multiple user id is provided', () => {
    describe('AND one token is provided', () => {
      describe('AND runs successfully', () => {
        beforeEach(() => {
          mockSendEachForMulticast.mockResolvedValue({failureCount: 0});
        });

        it('it should send multiple notification', async () => {
          const messageBody = () => ({
            notification: {title: 'Title', body: 'Body'},
          });
          const userId = ['user1', 'user2', 'user3'];

          mockGet.mockResolvedValueOnce({
            ref: '1',
            data: () => ({
              tokens: ['1'],
            }),
          });
          mockGet.mockResolvedValueOnce({
            ref: '2',
            data: () => ({
              tokens: ['2'],
            }),
          });
          mockGet.mockResolvedValueOnce({
            ref: '3',
            data: () => ({
              tokens: ['3'],
            }),
          });

          await sendNotifications(messageBody, userId);

          expect(mockSendEachForMulticast).toHaveBeenNthCalledWith(1, {
            android: {priority: 'high'},
            notification: {body: 'Body', title: 'Title'},
            tokens: ['1'],
          });
          expect(mockSendEachForMulticast).toHaveBeenNthCalledWith(2, {
            android: {priority: 'high'},
            notification: {body: 'Body', title: 'Title'},
            tokens: ['2'],
          });
          expect(mockSendEachForMulticast).toHaveBeenNthCalledWith(3, {
            android: {priority: 'high'},
            notification: {body: 'Body', title: 'Title'},
            tokens: ['3'],
          });
        });
      });

      describe('AND fails', () => {
        beforeEach(() => {
          mockSendEachForMulticast
            .mockResolvedValueOnce({failureCount: 0})
            .mockResolvedValueOnce({
              failureCount: 1,
              responses: [{error: {code: 'messaging/invalid-argument'}}],
            })
            .mockResolvedValueOnce({
              failureCount: 1,
              responses: [{error: {code: 'messaging/invalid-argument'}}],
            });
        });

        it('it should send multiple notification', async () => {
          const messageBody = () => ({
            notification: {title: 'Title', body: 'Body'},
          });
          const userId = ['user1', 'user2', 'user3'];

          mockGet.mockResolvedValueOnce({
            ref: '1',
            data: () => ({
              tokens: ['1'],
            }),
          });
          mockGet.mockResolvedValueOnce({
            ref: '2',
            data: () => ({
              tokens: ['2'],
            }),
          });
          mockGet.mockResolvedValueOnce({
            ref: '3',
            data: () => ({
              tokens: ['3'],
            }),
          });

          await sendNotifications(messageBody, userId);

          expect(mockSendEachForMulticast).toHaveBeenNthCalledWith(1, {
            android: {priority: 'high'},
            notification: {body: 'Body', title: 'Title'},
            tokens: ['1'],
          });
          expect(mockSendEachForMulticast).toHaveBeenNthCalledWith(2, {
            android: {priority: 'high'},
            notification: {body: 'Body', title: 'Title'},
            tokens: ['2'],
          });
          expect(mockSendEachForMulticast).toHaveBeenNthCalledWith(3, {
            android: {priority: 'high'},
            notification: {body: 'Body', title: 'Title'},
            tokens: ['3'],
          });

          expect(mockBatchUpdate).toHaveBeenNthCalledWith(1, '2', {
            tokens: '2',
          });

          expect(mockBatchUpdate).toHaveBeenNthCalledWith(2, '3', {
            tokens: '3',
          });
        });
      });
    });

    describe('AND multiple token is provided', () => {
      describe('AND runs successfully', () => {
        beforeEach(() => {
          mockSendEachForMulticast.mockResolvedValue({failureCount: 0});
        });

        it('it should send multiple notification to multiple tokens', async () => {
          const messageBody = () => ({
            notification: {title: 'Title', body: 'Body'},
          });
          const userId = ['user1', 'user2', 'user3'];

          mockGet.mockResolvedValueOnce({
            ref: '1',
            data: () => ({
              tokens: ['token11', 'token12', 'token13'],
            }),
          });
          mockGet.mockResolvedValueOnce({
            ref: '2',
            data: () => ({
              tokens: ['token21', 'token22', 'token23'],
            }),
          });
          mockGet.mockResolvedValueOnce({
            ref: '3',
            data: () => ({
              tokens: ['token31', 'token32', 'token33'],
            }),
          });

          await sendNotifications(messageBody, userId);

          expect(mockSendEachForMulticast).toHaveBeenNthCalledWith(1, {
            android: {priority: 'high'},
            notification: {body: 'Body', title: 'Title'},
            tokens: ['token11', 'token12', 'token13'],
          });
          expect(mockSendEachForMulticast).toHaveBeenNthCalledWith(2, {
            android: {priority: 'high'},
            notification: {body: 'Body', title: 'Title'},
            tokens: ['token21', 'token22', 'token23'],
          });
          expect(mockSendEachForMulticast).toHaveBeenNthCalledWith(3, {
            android: {priority: 'high'},
            notification: {body: 'Body', title: 'Title'},
            tokens: ['token31', 'token32', 'token33'],
          });
        });
      });

      describe('AND fails', () => {
        beforeEach(() => {
          mockSendEachForMulticast
            .mockResolvedValueOnce({failureCount: 0})
            .mockResolvedValueOnce({
              failureCount: 2,
              responses: [
                'success',
                {error: {code: 'messaging/invalid-argument'}},
                {error: {code: 'messaging/registration-token-not-registered'}},
              ],
            })
            .mockResolvedValueOnce({
              failureCount: 3,
              responses: [
                {error: {code: 'messaging/invalid-recipient'}},
                {error: {code: 'messaging/invalid-argument'}},
                {error: {code: 'messaging/registration-token-not-registered'}},
              ],
            });
        });

        it('it should send multiple notification to multiple tokens', async () => {
          const messageBody = () => ({
            notification: {title: 'Title', body: 'Body'},
          });
          const userId = ['user1', 'user2', 'user3'];

          mockGet.mockResolvedValueOnce({
            ref: '1',
            data: () => ({
              tokens: ['token11', 'token12', 'token13'],
            }),
          });
          mockGet.mockResolvedValueOnce({
            ref: '2',
            data: () => ({
              tokens: ['token21', 'token22', 'token23'],
            }),
          });
          mockGet.mockResolvedValueOnce({
            ref: '3',
            data: () => ({
              tokens: ['token31', 'token32', 'token33'],
            }),
          });

          await sendNotifications(messageBody, userId);

          expect(mockSendEachForMulticast).toHaveBeenNthCalledWith(1, {
            android: {priority: 'high'},
            notification: {body: 'Body', title: 'Title'},
            tokens: ['token11', 'token12', 'token13'],
          });
          expect(mockSendEachForMulticast).toHaveBeenNthCalledWith(2, {
            android: {priority: 'high'},
            notification: {body: 'Body', title: 'Title'},
            tokens: ['token21', 'token22', 'token23'],
          });
          expect(mockSendEachForMulticast).toHaveBeenNthCalledWith(3, {
            android: {priority: 'high'},
            notification: {body: 'Body', title: 'Title'},
            tokens: ['token31', 'token32', 'token33'],
          });

          expect(mockBatchUpdate).toHaveBeenCalledTimes(5);

          expect(mockBatchUpdate).toHaveBeenCalledWith('2', {
            tokens: 'token22',
          });

          expect(mockBatchUpdate).toHaveBeenCalledWith('2', {
            tokens: 'token23',
          });

          expect(mockBatchUpdate).toHaveBeenCalledWith('3', {
            tokens: 'token31',
          });

          expect(mockBatchUpdate).toHaveBeenCalledWith('3', {
            tokens: 'token32',
          });

          expect(mockBatchUpdate).toHaveBeenCalledWith('3', {
            tokens: 'token33',
          });
        });
      });
    });
  });
});
