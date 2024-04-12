import {Timestamp} from 'firebase-admin/firestore';
import {
  Booking,
  BusinessUnit,
  TimeSlot,
  User,
} from '../../Models/booking.model';
import * as bookingUtils from '../BookingUtils/BookingUtils';
import {
  toFreeSlots,
  findAssignableBookings,
  filterAssignableBookings,
  FreeSlot,
  findDeskAssignables,
  findCarAssignables,
} from './SpaceReassignUtils';

const isBookingDateLimittedToBUSpy = jest
  .spyOn(bookingUtils, 'isBookingDateLimitedToBU')
  .mockReturnValue(false);

describe('SpaceReassignUtils', () => {
  const dummyBooking = {
    bookingType: 'personal',
    createdAt: new Timestamp(100, 100),
    date: '2023-05-11T00:00:00Z',
    id: '1',
    isReserveSpace: false,
    spaceType: 'desk',
    timeSlot: 'am',
    updatedAt: new Timestamp(100, 100),
    userId: '123',
  } as Booking;
  const dummyFreeSlot = {
    am: 0,
    pm: 0,
    allDay: 0,
    date: '2023-05-11T00:00:00Z',
  } as FreeSlot;
  const dummyUser1 = {
    id: 'id1',
    businessUnit: BusinessUnit.Enum.murray,
  } as User;
  const prioritizedUsers = new Map<string, User>();

  describe('findDeskAssignables', () => {
    it('should find all the assignable bookings but no notification', () => {
      const freeSlot = {...dummyFreeSlot, am: 1, pm: 1, allDay: 0};
      const bookings: Booking[] = [
        {
          ...dummyBooking,
          id: '2',
          timeSlot: 'pm',
          createdAt: new Timestamp(100, 100),
        },
        {
          ...dummyBooking,
          id: '3',
          timeSlot: 'am',
          createdAt: new Timestamp(101, 101),
        },
      ];
      const assignables = findDeskAssignables([freeSlot], bookings);
      expect(assignables.bookings.length).toBe(2);
      expect(assignables.bookings).toEqual(expect.arrayContaining(bookings));
      expect(assignables.notifications).toBe(undefined);
    });

    it('should find the only bookings that matches date in the free slot list', () => {
      const freeSlot = {date: '2023-05-11T00:00:00Z', am: 2, pm: 0, allDay: 0};
      const bookings: Booking[] = [
        {
          ...dummyBooking,
          id: '2',
          timeSlot: 'am',
          date: '2023-05-11T00:00:00Z',
          createdAt: new Timestamp(100, 100),
        },
        {
          ...dummyBooking,
          id: '3',
          timeSlot: 'am',
          date: '2023-05-01T00:00:00Z',
          createdAt: new Timestamp(101, 101),
        },
      ];
      const assignables = findDeskAssignables([freeSlot], bookings);
      expect(assignables.bookings.length).toBe(1);
      expect(assignables.bookings[0].date).toEqual(freeSlot.date);
    });
  });

  describe('findCarAssignables', () => {
    it('should find all the matching bookings and no notification when all free spaces are used up', () => {
      const freeSlot = {...dummyFreeSlot, am: 1, pm: 1, allDay: 0};
      const bookings: Booking[] = [
        {
          ...dummyBooking,
          id: '2',
          timeSlot: 'pm',
          createdAt: new Timestamp(100, 100),
        },
        {
          ...dummyBooking,
          id: '3',
          timeSlot: 'am',
          createdAt: new Timestamp(101, 101),
        },
      ];
      const assignables = findCarAssignables(
        [freeSlot],
        bookings,
        BusinessUnit.Enum.murray,
        prioritizedUsers,
      );
      expect(assignables.bookings.length).toBe(2);
      expect(assignables.bookings).toEqual(expect.arrayContaining(bookings));
      expect(assignables.notifications).toBe(undefined);
    });

    it('should find bookings that belong to prioritized Users', () => {
      isBookingDateLimittedToBUSpy.mockReturnValueOnce(true);

      const freeSlot = {...dummyFreeSlot, am: 1, pm: 1, allDay: 0};
      const user2 = {...dummyUser1, id: 'id2'} as User;
      prioritizedUsers.set(dummyUser1.id, dummyUser1);
      prioritizedUsers.set(user2.id, user2);

      const notPriotizeUserBooking = {
        ...dummyBooking,
        id: '4',
        timeSlot: 'am',
        createdAt: new Timestamp(101, 101),
        userId: 'id3',
      } as Booking;
      const bookings: Booking[] = [
        {
          ...dummyBooking,
          id: '2',
          timeSlot: 'pm',
          createdAt: new Timestamp(100, 100),
          userId: 'id1',
        },
        {
          ...dummyBooking,
          id: '3',
          timeSlot: 'am',
          createdAt: new Timestamp(101, 101),
          userId: 'id2',
        },
        notPriotizeUserBooking,
      ];
      const assignables = findCarAssignables(
        [freeSlot],
        bookings,
        BusinessUnit.Enum.murray,
        prioritizedUsers,
      );
      expect(assignables.bookings.length).toBe(2);
      expect(assignables.bookings).not.toContain(notPriotizeUserBooking);
      expect(assignables.notifications).toBe(undefined);
    });

    it('should find matching bookings and notification for user who has alternative space option', () => {
      isBookingDateLimittedToBUSpy.mockReturnValueOnce(true);

      const freeSlot = {...dummyFreeSlot, am: 1, pm: 1, allDay: 0};
      const user2 = {...dummyUser1, id: 'id2'} as User;
      prioritizedUsers.set(dummyUser1.id, dummyUser1);
      prioritizedUsers.set(user2.id, user2);

      const bookings: Booking[] = [
        {
          ...dummyBooking,
          id: '2',
          timeSlot: 'pm',
          createdAt: new Timestamp(100, 100),
          userId: 'id1',
        },
        {
          ...dummyBooking,
          id: '3',
          timeSlot: 'pm',
          createdAt: new Timestamp(101, 101),
          userId: 'id2',
        },
      ];
      const assignables = findCarAssignables(
        [freeSlot],
        bookings,
        BusinessUnit.Enum.murray,
        prioritizedUsers,
      );
      expect(assignables.bookings.length).toBe(1);
      expect(assignables.bookings[0].id).toBe('2');

      const notifications = assignables.notifications;
      expect(notifications?.length).toBe(1);
      expect(notifications?.find(() => true)?.userIds).toEqual([user2.id]);
    });
  });

  describe('toFreeSlots converter function', () => {
    const freeSlotCheck = (
      freeSlot: FreeSlot | undefined,
      am: number,
      pm: number,
      allDay: number,
    ) => {
      expect(freeSlot).toBeDefined();
      expect(freeSlot?.am).toBe(am);
      expect(freeSlot?.pm).toBe(pm);
      expect(freeSlot?.allDay).toBe(allDay);
    };

    it('should return one freeSlot item with correct values for respective time slots when bookings are on the date', () => {
      const bookings: Booking[] = [
        {
          ...dummyBooking,
          id: '2',
          timeSlot: 'pm',
          date: '2023-06-15T00:00:00Z',
          createdAt: new Timestamp(100, 100),
        },
        {
          ...dummyBooking,
          id: '3',
          timeSlot: 'am',
          date: '2023-06-15T00:00:00Z',
          createdAt: new Timestamp(101, 101),
        },
      ];
      const freeSlots = toFreeSlots(bookings);
      expect(freeSlots.length).toBe(1);
      const freeSlot = freeSlots[0];
      expect(freeSlot.date).toBe('2023-06-15T00:00:00Z');
      freeSlotCheck(freeSlot, 1, 1, 0);
    });

    it('should group bookings based on date field value and reduced to freeSlot with corresponding time slot counts', () => {
      const bookings: Booking[] = [
        {
          ...dummyBooking,
          id: '2',
          timeSlot: 'pm',
          date: '2023-06-15T00:00:00Z',
          createdAt: new Timestamp(100, 100),
        },
        {
          ...dummyBooking,
          id: '3',
          timeSlot: 'am',
          date: '2023-06-15T00:00:00Z',
          createdAt: new Timestamp(101, 101),
        },
        {
          ...dummyBooking,
          id: '4',
          timeSlot: 'allDay',
          date: '2023-06-12T00:00:00Z',
          createdAt: new Timestamp(102, 102),
        },
        {
          ...dummyBooking,
          id: '5',
          timeSlot: 'allDay',
          date: '2023-06-12T00:00:00Z',
          createdAt: new Timestamp(103, 103),
        },
      ];

      const freeSlots = toFreeSlots(bookings);
      expect(freeSlots.length).toBe(2);
      const date1FreeSlot = freeSlots.find(
        slot => slot.date === '2023-06-15T00:00:00Z',
      );
      const date2FreeSlot = freeSlots.find(
        slot => slot.date === '2023-06-12T00:00:00Z',
      );
      freeSlotCheck(date1FreeSlot, 1, 1, 0);
      freeSlotCheck(date2FreeSlot, 0, 0, 2);
    });
  });

  describe('findAssignableBookings logics', () => {
    it('should find no assignable bookings if source current reserve list is empty', () => {
      const freeSlot = {...dummyFreeSlot, am: 2, pm: 2, allDay: 1};
      const assignables = findAssignableBookings(freeSlot, []);
      expect(assignables.length).toBe(0);
    });

    it('should find corresponding time slot bookings from reserved space booking list', () => {
      const freeSlot = {...dummyFreeSlot, am: 1, pm: 1, allDay: 0};
      const bookings: Booking[] = [
        {
          ...dummyBooking,
          id: '2',
          timeSlot: 'pm',
          createdAt: new Timestamp(100, 100),
        },
        {
          ...dummyBooking,
          id: '3',
          timeSlot: 'am',
          createdAt: new Timestamp(101, 101),
        },
      ];
      const assignables = findAssignableBookings(freeSlot, bookings);
      expect(assignables.length).toBe(2);
      expect(assignables).toEqual(expect.arrayContaining(bookings));
    });

    it('should find bookings and based on the priority on created field', () => {
      const freeSlot = {...dummyFreeSlot, am: 0, pm: 1, allDay: 1};
      const bookings: Booking[] = [
        {
          ...dummyBooking,
          id: '2',
          timeSlot: 'pm',
          createdAt: new Timestamp(100, 100),
        },
        {
          ...dummyBooking,
          id: '3',
          timeSlot: 'am',
          createdAt: new Timestamp(101, 101),
        },
        {
          ...dummyBooking,
          id: '4',
          timeSlot: 'allDay',
          createdAt: new Timestamp(102, 102),
        },
      ];
      const assignables = findAssignableBookings(freeSlot, bookings);
      expect(assignables.length).toBe(2);
      const leastPriorityBooking = assignables.find(
        booking => booking.id === '4',
      );
      expect(leastPriorityBooking).toBeUndefined();
    });
  });

  describe('filterAs signableBookings logics', () => {
    const bookings: Booking[] = [
      {
        ...dummyBooking,
        id: '2',
        timeSlot: 'pm',
        createdAt: new Timestamp(100, 100),
      },
      {
        ...dummyBooking,
        id: '3',
        timeSlot: 'am',
        createdAt: new Timestamp(101, 101),
      },
    ];

    it('should filter and returns 0 match when there are bookings with reserved space', () => {
      const assignables = filterAssignableBookings(
        [],
        1,
        TimeSlot.Enum.allDay,
        booking => booking.timeSlot === TimeSlot.Enum.allDay,
      );
      expect(assignables.length).toBe(0);
    });

    it('should filter and returns 0 match when no assignable booking is found', () => {
      const assignables = filterAssignableBookings(
        bookings,
        1,
        TimeSlot.Enum.allDay,
        booking => booking.timeSlot === TimeSlot.Enum.allDay,
      );
      expect(assignables.length).toBe(0);
    });

    it('should filter and returns 1 match when an assignable booking is found', () => {
      const assignables = filterAssignableBookings(
        bookings,
        1,
        TimeSlot.Enum.am,
        booking => booking.timeSlot === TimeSlot.Enum.am,
      );
      expect(assignables.length).toBe(1);
    });

    it('should filter and returns 2 match when there is one all Day free slot and there are am and pm bookings', () => {
      const assignables = filterAssignableBookings(
        bookings,
        1,
        TimeSlot.Enum.allDay,
        booking => booking.timeSlot !== TimeSlot.Enum.allDay,
      );
      expect(assignables.length).toBe(2);
    });

    it('should filter and returns 3 match when there are two all Day free slots and there are one am, one pm and one allDay bookings', () => {
      const threeBookings = bookings.concat([
        {
          ...dummyBooking,
          id: '4',
          timeSlot: 'allDay',
          createdAt: new Timestamp(102, 102),
        },
      ]);
      const assignables = filterAssignableBookings(
        threeBookings,
        2,
        TimeSlot.Enum.allDay,
        _ => true,
      );
      expect(assignables.length).toBe(3);
    });

    it('should filter and prioritise the matching creteria to the bookings that created earlier', () => {
      const multipleBookings = bookings.concat([
        {
          ...dummyBooking,
          id: '4',
          timeSlot: 'am',
          createdAt: new Timestamp(50, 50),
        },
        {
          ...dummyBooking,
          id: '5',
          timeSlot: 'am',
          createdAt: new Timestamp(49, 49),
        },
        {
          ...dummyBooking,
          id: '6',
          timeSlot: 'pm',
          createdAt: new Timestamp(102, 102),
        },
      ]);
      const assignables = filterAssignableBookings(
        multipleBookings,
        1,
        TimeSlot.Enum.allDay,
        _ => true,
      );
      expect(assignables.length).toBe(2);
      const am = assignables.find(
        booking => booking.timeSlot === TimeSlot.Enum.am,
      );
      const pm = assignables.find(
        booking => booking.timeSlot === TimeSlot.Enum.pm,
      );
      expect(am?.id).toBe('5');
      expect(pm?.id).toBe('2');
    });
  });
});
