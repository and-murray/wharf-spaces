import {
  Booking,
  AvailableSpacesOption,
  AvailableTimeSlots,
} from '@customTypes/.';
import {TimeSlot} from '@customTypes/booking';

export const calculateRemainingSpaces = (
  bookings: Booking[],
  spaceCapacity: number,
): AvailableTimeSlots => {
  const counts = {
    allDay: 0,
    allDayReserved: 0,
    am: 0,
    amReserved: 0,
    pm: 0,
    pmReserved: 0,
  } as {
    allDay: number;
    allDayReserved: number;
    am: number;
    amReserved: number;
    pm: number;
    pmReserved: number;
  };

  bookings.forEach(booking => {
    if (booking.isReserveSpace) {
      switch (booking.timeSlot) {
        case 'allDay':
          counts.allDayReserved += 1;
          break;
        case 'am':
          counts.amReserved += 1;
          break;
        case 'pm':
          counts.pmReserved += 1;
          break;
      }
    } else {
      counts[booking.timeSlot] += 1;
    }
  });

  const {allDay, am, pm} = counts;

  const dayLeft = spaceCapacity - allDay - Math.max(am, pm);
  const morningLeft = spaceCapacity - allDay - am;
  const afternoonLeft = spaceCapacity - allDay - pm;

  const dayReserved = counts.allDayReserved;
  const morningReserved = counts.amReserved + counts.allDayReserved;
  const afternoonReserved = counts.pmReserved + counts.allDayReserved;

  return {
    dayLeft,
    dayReserved,
    morningLeft,
    morningReserved,
    afternoonLeft,
    afternoonReserved,
  };
};

export const availableSpacesOptionfactory = (
  availableSlots: AvailableTimeSlots = {
    dayLeft: 0,
    dayReserved: 0,
    afternoonReserved: 0,
    afternoonLeft: 0,
    morningReserved: 0,
    morningLeft: 0,
  },
): AvailableSpacesOption[] => {
  const {
    dayLeft,
    dayReserved,
    morningLeft,
    morningReserved,
    afternoonLeft,
    afternoonReserved,
  } = availableSlots;

  return [
    {
      id: 1,
      heading: 'All Day',
      spaceLeft: dayLeft,
      reservedSpaces: dayReserved,
      timeSlot: TimeSlot.allDay,
      isSelected: false,
      isBooked: false,
    },
    {
      id: 2,
      heading: 'AM',
      spaceLeft: morningLeft,
      reservedSpaces: morningReserved,
      timeSlot: TimeSlot.am,
      isSelected: false,
      isBooked: false,
    },
    {
      id: 3,
      heading: 'PM',
      spaceLeft: afternoonLeft,
      reservedSpaces: afternoonReserved,
      timeSlot: TimeSlot.pm,
      isSelected: false,
      isBooked: false,
    },
  ];
};
