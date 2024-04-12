import crashlytics from '@react-native-firebase/crashlytics';

export enum LogLevel {
  log = 'log',
  error = 'error',
}
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
