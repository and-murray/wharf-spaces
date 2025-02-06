import dayjs from 'dayjs';
import type {Request, Response} from 'express';
import admin from 'firebase-admin';
import {applicationTimezone} from '../utils/BookingUtils/BookingUtils';

export const getLondonTime = async (_req: Request, res: Response) => {
  const getServerTimestamp = admin.firestore.Timestamp.now().toDate();
  const londonServerTimestamp =
    dayjs(getServerTimestamp).tz(applicationTimezone);
  const returnObject = JSON.stringify({
    londonServerTime: londonServerTimestamp.format('YYYY-MM-DDTHH:mm:ss'),
  });
  res.status(200).send(returnObject);
};
