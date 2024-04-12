import {getUsersBookedDays} from './';

let mockWhere = jest
  .fn()
  .mockImplementationOnce(function (this: jest.Mock) {
    return this;
  })
  .mockImplementationOnce(() => ({
    onSnapshot: jest.fn(),
  }));

jest.mock('./Database', () => ({
  db: {
    collection: () => ({
      where: mockWhere,
    }),
  },
}));

jest.mock('@utils/DateTimeUtils/DateTimeUtils', () => ({
  getTodaysUTCDateMidnightString: () => '1997-11-05T00:00:00Z',
}));

describe('getUsersBookedDays', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('calls firebase with the correct query parameters', () => {
    const userId = 'userID';
    getUsersBookedDays(userId, () => {});
    expect(mockWhere).toHaveBeenNthCalledWith(
      1,
      'date',
      '>=',
      '1997-11-05T00:00:00Z',
    );
    expect(mockWhere).toHaveBeenNthCalledWith(2, 'userId', '==', userId);
  });
});
