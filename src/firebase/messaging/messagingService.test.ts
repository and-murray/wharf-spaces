import {messagingSignOutHandler, saveTokenToDatabase} from './messagingService';
import * as firebaseUtil from '@firebase/messaging/tokenManagerUtils';
import messaging from '@react-native-firebase/messaging';

jest.mock('@react-native-firebase/auth', () => () => ({
  currentUser: {uid: '1'},
}));

describe('when a user accepts the notification permission', () => {
  const addTokenSpy = jest.spyOn(firebaseUtil, 'addToken').mockResolvedValue();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should save the FCM token to the database', () => {
    const token = 'This is a token';
    saveTokenToDatabase(token);
    expect(addTokenSpy).toHaveBeenCalledWith('1', token);
  });
});

describe("when a user doesn't accept the notification permission", () => {
  const removeTokenSpy = jest
    .spyOn(firebaseUtil, 'removeToken')
    .mockResolvedValue();

  const messagingSpy = jest
    .spyOn(messaging(), 'deleteToken')
    .mockResolvedValue();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should not save the FCM token to the database', async () => {
    await messagingSignOutHandler();
    expect(removeTokenSpy).toHaveBeenCalledWith('1', 'MessageToken');
    expect(messagingSpy).toHaveBeenCalledTimes(1);
  });
});
