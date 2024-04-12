import {deleteBookings} from '../Services/FirebaseAdminService/firebaseAdminService';
import {DeleteBookingRequest} from '../Models/booking.model';
import * as functions from 'firebase-functions';
import {HttpError} from 'http-errors';
import {assignSpacesToReserved} from '../Services/FirebaseAdminService/firebaseSpaceReassignService';

export const removeBookings = async (
  req: functions.Request,
  res: functions.Response<any>,
) => {
  try {
    DeleteBookingRequest.parse(req.body);
  } catch (error) {
    res.status(400).send(error);
    return;
  }
  try {
    const deletedBookings = await deleteBookings(
      req.body.bookingIds,
      req.user?.uid ?? '',
    );
    await assignSpacesToReserved(deletedBookings);
    res.status(204).send();
  } catch (error) {
    if (error instanceof HttpError) {
      res.status(error.statusCode).send(error.message);
      return;
    }
    res.status(500).send('Should not have got here');
  }
};

export default removeBookings;
