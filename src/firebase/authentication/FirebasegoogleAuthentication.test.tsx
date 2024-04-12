import {mockDeleteToken} from '@root/setup-jest';
import {signOut} from './FirebaseGoogleAuthentication';

jest.mock('@react-native-firebase/auth', () => () => ({
  signOut: () => {},
  currentUser: {uid: '1', getIdToken: () => {}},
}));

jest.mock('@firebase/firestore/Database', () => ({
  db: {
    collection: () => ({
      doc: () => ({
        update: () => {},
      }),
    }),
  },
}));

jest.mock('@firebase/messaging/tokenManagerUtils', () => ({
  removeToken: () => {},
}));

describe('when the user signs out', () => {
  it('should reset the fcm token', async () => {
    await signOut();
    expect(mockDeleteToken).toBeCalledTimes(1);
  });
});
