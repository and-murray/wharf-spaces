export const mockFirestoreGet = jest.fn();

export const mockFirestoreCollection = jest.fn();

export const mockFirestoreAuth = jest.fn();

export const mockSignOut = jest.fn();

export const mockFirebaseFunctions = jest.fn();

export const mockFirebaseConfig = jest.fn();

export const mockFirestoreEmulator = jest.fn();

export const mockFirebaseMessageGetToken = jest
  .fn()
  .mockResolvedValue('MessageToken');

export const mockFirebaseMessageOnTokenRefresh = jest.fn();

export const mockDeleteToken = jest.fn();

export const mockOnMessage = jest.fn();

jest.mock('react-native-exit-app', () => jest.fn());
jest.mock('react-native-device-info', () => jest.fn());
jest.mock('@react-native-firebase/app-check', () => () => ({
  firebase: jest.fn(),
}));
jest.mock('@react-native-firebase/firestore', () => () => ({
  collection: mockFirestoreCollection,
  useEmulator: mockFirestoreEmulator,
}));

jest.mock('@react-native-firebase/auth', () => () => ({
  onAuthStateChanged: mockFirestoreAuth,
  signOut: mockSignOut,
}));

jest.mock('@react-native-firebase/crashlytics', () => () => ({
  isCrashlyticsCollectionEnabled: jest.fn(),
  recordError: jest.fn(),
}));

jest.mock('@react-native-firebase/functions', () => () => ({
  functions: mockFirebaseFunctions,
}));

jest.mock('@react-native-firebase/remote-config', () => () => ({
  setDefaults: mockFirebaseConfig,
  fetchAndActivate: mockFirebaseConfig,
  getNumber: mockFirebaseConfig,
  getString: mockFirebaseConfig,
  getBoolean: mockFirebaseConfig,
}));

jest.mock('@react-native-firebase/messaging', () => () => ({
  getToken: mockFirebaseMessageGetToken,
  onTokenRefresh: mockFirebaseMessageOnTokenRefresh,
  deleteToken: mockDeleteToken,
  onMessage: mockOnMessage,
}));
