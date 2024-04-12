import {TimeSlot} from '@customTypes/booking';

type AvailableSpacesOption = {
  id: number;
  heading: string;
  spaceLeft?: number;
  timeSlot: TimeSlot;
  isSelected: boolean;
  isBooked: boolean;
};

export type AvailableTimeSlots = {
  dayLeft: number;
  morningLeft: number;
  afternoonLeft: number;
};

export default AvailableSpacesOption;
