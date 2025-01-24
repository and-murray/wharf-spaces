import dayjs from 'dayjs';
import {Request, Response} from 'express';
import admin from 'firebase-admin';
import {applicationTimezone} from '../utils/BookingUtils/BookingUtils';

export const getLondonTime = async (req: Request, res: Response<any>) => {
  const getServerTimestamp = admin.firestore.Timestamp.now().toDate();
  const londonServerTimestamp =
    dayjs(getServerTimestamp).tz(applicationTimezone);
  const returnObject = JSON.stringify({
    londonServerTime: londonServerTimestamp.format('YYYY-MM-DDTHH:mm:ss'),
  });
  res.status(200).send(returnObject);
};
