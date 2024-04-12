import {canUpdateBooking} from './canUpdateBooking';
import {Booking} from '../../Models/booking.model';
import {Timestamp} from 'firebase-admin/firestore';

describe('Can Update Booking', () => {
  describe('Is an AM Booking', () => {
    const dummyBooking: Booking = {
      bookingType: 'personal',
      createdAt: new Timestamp(100, 100),
      date: '2023-05-11T00:00:00Z',
      id: '1',
      isReserveSpace: true,
      spaceType: 'desk',
      timeSlot: 'am',
      updatedAt: new Timestamp(100, 100),
      userId: '123',
    } as Booking;
    describe('Has AM Capacity', () => {
      it('returns true and am slot', () => {
        const result = canUpdateBooking(dummyBooking, {
          am: 1,
          pm: 0,
          allDay: 0,
        });
        expect(result.shouldUpdate).toEqual(true);
        expect(result.timeSlot).toEqual('am');
      });
    });

    describe('Does not have AM Capacity', () => {
      it('returns false and all day slot', () => {
        const result = canUpdateBooking(dummyBooking, {
          am: 0,
          pm: 1,
          allDay: 1,
        });
        expect(result.shouldUpdate).toEqual(false);
        expect(result.timeSlot).toEqual('allDay');
      });
    });
  });

  describe('Is an PM Booking', () => {
    const dummyBooking: Booking = {
      bookingType: 'personal',
      createdAt: new Timestamp(100, 100),
      date: '2023-05-11T00:00:00Z',
      id: '1',
      isReserveSpace: true,
      spaceType: 'desk',
      timeSlot: 'pm',
      updatedAt: new Timestamp(100, 100),
      userId: '123',
    } as Booking;
    describe('Has PM Capacity', () => {
      it('returns true and om slot', () => {
        const result = canUpdateBooking(dummyBooking, {
          am: 0,
          pm: 1,
          allDay: 1,
        });
        expect(result.shouldUpdate).toEqual(true);
        expect(result.timeSlot).toEqual('pm');
      });
    });

    describe('Does not have PM Capacity', () => {
      it('returns false and all day slot', () => {
        const result = canUpdateBooking(dummyBooking, {
          am: 1,
          pm: 0,
          allDay: 1,
        });
        expect(result.shouldUpdate).toEqual(false);
        expect(result.timeSlot).toEqual('allDay');
      });
    });
  });

  describe('Is an all day Booking', () => {
    const dummyBooking: Booking = {
      bookingType: 'personal',
      createdAt: new Timestamp(100, 100),
      date: '2023-05-11T00:00:00Z',
      id: '1',
      isReserveSpace: true,
      spaceType: 'desk',
      timeSlot: 'allDay',
      updatedAt: new Timestamp(100, 100),
      userId: '123',
    } as Booking;
    describe('Has PM Capacity', () => {
      it('returns true and om slot', () => {
        const result = canUpdateBooking(dummyBooking, {
          am: 1,
          pm: 1,
          allDay: 1,
        });
        expect(result.shouldUpdate).toEqual(true);
        expect(result.timeSlot).toEqual('allDay');
      });
    });

    describe('Does not have allDay Capacity', () => {
      it('returns false and all day slot', () => {
        const result = canUpdateBooking(dummyBooking, {
          am: 0,
          pm: 0,
          allDay: 0,
        });
        expect(result.shouldUpdate).toEqual(false);
        expect(result.timeSlot).toEqual('allDay');
      });
    });
  });
});
