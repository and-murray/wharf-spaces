import {getUsers} from './getUsers';

jest.mock('@utils/FirebaseUtils/FirebaseUtils', () => ({
  chunkQuery: jest.fn().mockReturnValue([
    {
      id: 'userId1',
      firstName: 'firstName1',
      lastName: 'lastName1',
      profilePicUrl: 'profilePicUrl1',
    },
    {
      id: 'userId2',
      firstName: 'firstName2',
      lastName: 'lastName2',
      profilePicUrl: 'profilePicUrl2',
    },
  ]),
}));

jest.mock('./Database', () => ({
  db: {
    collection: jest.fn(),
  },
}));

describe('getUsers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('reduces the response correctly', async () => {
    const userIds = ['userId1', 'userId2'];
    let response = await getUsers(userIds);
    expect(response).toEqual({
      ['userId1']: {
        name: 'firstName1 lastName1',
        profilePictureURI: 'profilePicUrl1',
      },
      ['userId2']: {
        name: 'firstName2 lastName2',
        profilePictureURI: 'profilePicUrl2',
      },
    });
  });
});
