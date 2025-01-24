import type {Request, Response} from 'express';
import {assignEmptySpacesToReserved} from '../Services/FirebaseAdminService/assignEmptySpacesToReserved';
import {AllocateEmptySlotsRequest} from '../Models/booking.model';
import {checkBookingCapacity} from '../Services/DeskCapacity/checkBookingCapacity';
import {isBookingDateLimitedToBU} from '../utils/BookingUtils/BookingUtils';

export const allocateEmptySlots = async (req: Request, res: Response<any>) => {
  let allocateEmptySlotsRequest: AllocateEmptySlotsRequest;
  try {
    try {
      allocateEmptySlotsRequest = AllocateEmptySlotsRequest.parse(req.body);
    } catch (error) {
      res.status(400).send(error);
      return;
    }
    if (
      isBookingDateLimitedToBU(allocateEmptySlotsRequest.date) &&
      allocateEmptySlotsRequest.spaceType === 'car' &&
      !allocateEmptySlotsRequest.businessUnit
    ) {
      res
        .status(400)
        .send(
          'If date is restricted to business unit and space type is cars then business unit to make allocations against must be provided',
        );
    }
    const remainingCapacity = await checkBookingCapacity(
      allocateEmptySlotsRequest.date,
      allocateEmptySlotsRequest.spaceType,
      allocateEmptySlotsRequest.businessUnit,
    );
    await assignEmptySpacesToReserved(
      remainingCapacity,
      allocateEmptySlotsRequest.date,
      allocateEmptySlotsRequest.spaceType,
      allocateEmptySlotsRequest.businessUnit,
    );
    res.status(204).send();
  } catch (error) {
    res.status(500).send(error);
    return;
  }
};
