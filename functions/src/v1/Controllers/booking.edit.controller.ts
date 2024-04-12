import * as functions from 'firebase-functions';
import {EditBookingsRequest} from '../Models/booking.model';
import {HttpError} from 'http-errors';
import {editExistingBookings} from '../Services/FirebaseAdminService/editExistingBookings';

export const editBookings = async (
  req: functions.Request,
  res: functions.Response<any>,
) => {
  let editBookingsRequest: EditBookingsRequest;
  try {
    try {
      editBookingsRequest = EditBookingsRequest.parse(req.body);
    } catch (error) {
      res.status(400).send(error);
      return;
    }
    const userId = req.user?.uid;
    if (!userId) {
      res.status(403).send('No user id can be found');
      return;
    }
    await editExistingBookings(editBookingsRequest.bookings, userId);
    res.status(204).send();
  } catch (error) {
    res.status((error as HttpError).status).send(error);
    return;
  }
};
