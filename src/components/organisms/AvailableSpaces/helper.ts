import {
  Booking,
  AvailableSpacesOption,
  AvailableTimeSlots,
} from '@customTypes/.';
import {TimeSlot} from '@customTypes/booking';
import dayjs from 'dayjs';

export const calculateRemainingSpaces = (
  bookings: Booking[],
  spaceCapacity: number,
): AvailableTimeSlots => {
  const counts = {allDay: 0, am: 0, pm: 0} as {
    allDay: number;
    am: number;
    pm: number;
  };
  bookings.forEach(booking => {
    counts[booking.timeSlot] += 1;
  });
  const {allDay, am, pm} = counts;
  const dayLeft = spaceCapacity - allDay - Math.max(am, pm);
  const afternoonLeft = spaceCapacity - allDay - pm;
  const morningLeft = spaceCapacity - allDay - am;

  return {dayLeft, afternoonLeft, morningLeft};
};

export const availableSpacesOptionfactory = (
  availableSlots: AvailableTimeSlots = {
    dayLeft: 0,
    afternoonLeft: 0,
    morningLeft: 0,
  },
): AvailableSpacesOption[] => {
  const {dayLeft, morningLeft, afternoonLeft} = availableSlots;
  return [
    {
      id: 1,
      heading: 'All Day',
      spaceLeft: dayLeft,
      timeSlot: TimeSlot.allDay,
      isSelected: false,
      isBooked: false,
    },
    {
      id: 2,
      heading: 'AM',
      spaceLeft: morningLeft,
      timeSlot: TimeSlot.am,
      isSelected: false,
      isBooked: false,
    },
    {
      id: 3,
      heading: 'PM',
      spaceLeft: afternoonLeft,
      timeSlot: TimeSlot.pm,
      isSelected: false,
      isBooked: false,
    },
  ];
};

// TODO: revert after hawking join date
export const isBookingDateBeforeHawkingJoin = (dateToBook: string) => {
  const hawkingJoinDate = dayjs('2024-04-29T00:00:00Z');
  const dateUserBooks = dayjs(dateToBook);
  return dateUserBooks.isBefore(hawkingJoinDate, 'day');
};
