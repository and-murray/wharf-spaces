import {AvailableTimeSlots, Booking} from '@customTypes';
import {availableSpacesOptionfactory, calculateRemainingSpaces} from './helper';
import {TimeSlot} from '@customTypes/booking';
import {BookingType, SpaceType} from '@customTypes/booking';

describe('methods in the Helper file', () => {
  describe('calculateRemainingSpaces with different bookings', () => {
    const capacity = 36;
    const bookingCopy = {
      date: '2023-05-15',
      timeSlot: TimeSlot.allDay,
      bookingType: BookingType.personal,
      spaceType: SpaceType.desk,
      isReserveSpace: false,
      userId: 'userId',
      createdAt: 0,
      updatedAt: 0,
    } as Booking;

    const shallowCopyTimes = (
      timeSlot: TimeSlot,
      copyTimes: number = 1,
      booking: Booking = bookingCopy,
    ) =>
      Array(copyTimes)
        .fill(0)
        .map(() => {
          return {...booking, timeSlot: timeSlot} as Booking;
        });
    const createDummpyBookings = (day: number, pm: number, am: number) => {
      const allDays = shallowCopyTimes(TimeSlot.allDay, day);
      const pms = shallowCopyTimes(TimeSlot.pm, pm);
      const ams = shallowCopyTimes(TimeSlot.am, am);
      return [...allDays, ...pms, ...ams];
    };
    it('calculates and wraps remaining spaces in AvailableTimeSlots when no there are no bookings', () => {
      const testBookings: Booking[] = [];
      const availableTimeSlots = calculateRemainingSpaces(
        testBookings,
        capacity,
      );
      expect(availableTimeSlots.dayLeft).toBe(capacity);
      expect(availableTimeSlots.afternoonLeft).toBe(capacity);
      expect(availableTimeSlots.morningLeft).toBe(capacity);
    });

    it('calculates and wraps remaining spaces in AvailableTimeSlots when no pm or am slots are booked', () => {
      const testBookings = createDummpyBookings(10, 0, 0);
      const availableTimeSlots = calculateRemainingSpaces(
        testBookings,
        capacity,
      );
      expect(availableTimeSlots.dayLeft).toBe(capacity - 10);
      expect(availableTimeSlots.afternoonLeft).toBe(capacity - 10);
      expect(availableTimeSlots.morningLeft).toBe(capacity - 10);
    });
    it('calculates and wraps remaining spaces in AvailableTimeSlots when only pm and an slots are booked', () => {
      const testBookings = createDummpyBookings(0, 10, 15);
      const availableTimeSlots = calculateRemainingSpaces(
        testBookings,
        capacity,
      );
      expect(availableTimeSlots.dayLeft).toBe(capacity - 15);
      expect(availableTimeSlots.afternoonLeft).toBe(capacity - 10);
      expect(availableTimeSlots.morningLeft).toBe(capacity - 15);
    });

    it('calculates and wraps remaining spaces in AvailableTimeSlots when there are bookings in allDays, pm and am', () => {
      const testBookings = createDummpyBookings(5, 10, 15);
      const availableTimeSlots = calculateRemainingSpaces(
        testBookings,
        capacity,
      );
      expect(availableTimeSlots.dayLeft).toBe(capacity - 5 - 15);
      expect(availableTimeSlots.afternoonLeft).toBe(capacity - 5 - 10);
      expect(availableTimeSlots.morningLeft).toBe(capacity - 5 - 15);
    });
  });

  describe('availableSpacesOptionfactory generating AvailableSpacesOption for provided availabilities', () => {
    const dayId = 1;
    const morningId = 2;
    const afternoonId = 3;
    it('returns AvailableSpacesOption with no spaces left', () => {
      const availableSpacesOption = availableSpacesOptionfactory();
      const allDays = availableSpacesOption.find(value => value.id === dayId);
      const mornings = availableSpacesOption.find(
        value => value.id === morningId,
      );
      const afternoons = availableSpacesOption.find(
        value => value.id === afternoonId,
      );
      expect(allDays?.spaceLeft).toBe(0);
      expect(mornings?.spaceLeft).toBe(0);
      expect(afternoons?.spaceLeft).toBe(0);
    });
    it('returns AvailableSpacesOption with corresponding available spaces', () => {
      const availableSlots = {
        dayLeft: 10,
        morningLeft: 8,
        afternoonLeft: 5,
      } as AvailableTimeSlots;

      const availableSpacesOption =
        availableSpacesOptionfactory(availableSlots);
      const allDays = availableSpacesOption.find(value => value.id === dayId);
      const mornings = availableSpacesOption.find(
        value => value.id === morningId,
      );
      const afternoons = availableSpacesOption.find(
        value => value.id === afternoonId,
      );
      expect(allDays?.spaceLeft).toBe(10);
      expect(mornings?.spaceLeft).toBe(8);
      expect(afternoons?.spaceLeft).toBe(5);
    });
  });
});
