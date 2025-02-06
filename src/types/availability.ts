import {TimeSlot} from '@customTypes/booking';

type AvailableSpacesOption = {
  id: number;
  heading: string;
  spaceLeft?: number;
  reservedSpaces?: number;
  timeSlot: TimeSlot;
  isSelected: boolean;
  isBooked: boolean;
};

export type AvailableTimeSlots = {
  dayLeft: number;
  dayReserved: number;
  morningLeft: number;
  morningReserved: number;
  afternoonLeft: number;
  afternoonReserved: number;
};

export default AvailableSpacesOption;
