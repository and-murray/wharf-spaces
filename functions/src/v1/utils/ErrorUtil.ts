import {HttpError} from 'http-errors';

export function constructError(
  httpError: HttpError,
  message: string,
  id?: string,
): Error {
  httpError.message = id
    ? JSON.stringify({
        message: message,
        failedId: id,
      })
    : JSON.stringify({
        message: message,
      });
  return httpError;
}
