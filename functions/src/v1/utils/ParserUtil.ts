import {Booking, User} from '../Models/booking.model';
import createError from 'http-errors';

export const parseBooking = (bookingData: unknown) => {
  try {
    return Booking.parse(bookingData);
  } catch (error) {
    console.log(error);
    const httpError = new createError.InternalServerError();
    httpError.message = JSON.stringify({
      message: 'Something went wrong',
      error: error,
    });
    throw httpError;
  }
};

export const parseUser = (userData: unknown): User => {
  try {
    return User.parse(userData);
  } catch (error) {
    console.log(error);
    const httpError = new createError.InternalServerError();
    httpError.message = JSON.stringify({
      message: 'Something went wrong',
      error: error,
    });
    throw httpError;
  }
};
