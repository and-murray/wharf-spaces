import crashlytics from '@react-native-firebase/crashlytics';

export enum LogLevel {
  log = 'log',
  error = 'error',
}
// Crashlytics logger expects a string but every use case of this logger function does not ensure a string is passed.
// TODO: Enhance error handling, probably by adding an error parser to convert into a string before logging
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function logMessage(level: LogLevel, message: any) {
  switch (level) {
    case 'log':
      console.log(message);
      crashlytics().log(message);
      break;
    case 'error':
      console.error(message);
      crashlytics().recordError(new Error(message));
      break;
  }
}
