export enum SpaceType {
  desk = 'desk',
  car = 'car',
}

export enum BookingType {
  personal = 'personal',
  guest = 'guest',
}

export enum TimeSlot {
  am = 'am',
  pm = 'pm',
  allDay = 'allDay',
}

export type Booking = {
  date: string;
  timeSlot: TimeSlot;
  bookingType: BookingType;
  spaceType: SpaceType;
  isReserveSpace: boolean;
  userId: string;
  createdAt: number;
  updatedAt: number;
  clientName?: string;
  id: string;
};

export type BookingInput = {
  date: string;
  timeSlot: TimeSlot;
  bookingType: BookingType;
  spaceType: SpaceType;
  userId: string;
  clientName?: string;
};

export type BookingPostRequest = {
  bookings: BookingInput[];
};

export type BookingDeleteRequest = {
  bookingIds: string[];
};

export type EditBooking = {
  bookingId: string;
  newTimeSlot: TimeSlot;
};

export type BookingEditRequest = {
  bookings: EditBooking[];
};

export default Booking;
