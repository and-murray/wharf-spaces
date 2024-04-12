import {Booking, SpaceType} from '../../Models/booking.model';
import {distinctFieldValues, chunk} from './ArrayUtils';

describe('Array Utils', () => {
  const dummyBooking = {
    bookingType: 'personal',
    createdAt: {},
    date: '2023-05-11T00:00:00Z',
    id: '1',
    isReserveSpace: false,
    spaceType: 'desk',
    timeSlot: 'am',
    updatedAt: {},
    userId: '123',
  } as Booking;

  describe('distinctFieldValues function of Array Utils', () => {
    it('should return empty list if source is empty', () => {
      const bookings: Booking[] = [];
      const distinctSpaces = distinctFieldValues(
        bookings,
        booking => booking.spaceType,
      );
      expect(distinctSpaces.length).toBe(0);
    });

    it('should return one item list if source has only one item in its list', () => {
      const bookings: Booking[] = [{...dummyBooking}];
      const distinctSpaces = distinctFieldValues(
        bookings,
        booking => booking.spaceType,
      );
      expect(distinctSpaces.length).toBe(1);
      expect(distinctSpaces[0]).toBe(SpaceType.Enum.desk);
    });

    it('should return one item list if source has items with only one distinct value', () => {
      const bookings: Booking[] = [
        {...dummyBooking},
        {...dummyBooking, id: '2'},
      ];
      const distinctSpaces = distinctFieldValues(
        bookings,
        booking => booking.spaceType,
      );
      expect(distinctSpaces.length).toBe(1);
      expect(distinctSpaces[0]).toBe(SpaceType.Enum.desk);
    });

    it('should return two items list if source has items with only two distinct values', () => {
      const bookings: Booking[] = [
        {...dummyBooking},
        {...dummyBooking, id: '2', spaceType: 'car'},
      ];
      const distinctSpaces = distinctFieldValues(
        bookings,
        booking => booking.spaceType,
      );
      expect(distinctSpaces.length).toBe(2);
      expect(distinctSpaces.includes(SpaceType.Enum.car)).toBe(true);
      expect(distinctSpaces.includes(SpaceType.Enum.desk)).toBe(true);
    });

    it('should return new list with distict values if source has items with duplicate field values', () => {
      const bookings: Booking[] = [
        {...dummyBooking},
        {...dummyBooking, id: '2', spaceType: 'car'},
        {...dummyBooking, id: '3', spaceType: 'car'},
        {...dummyBooking, id: '4', spaceType: 'desk'},
      ];
      const distinctSpaces = distinctFieldValues(
        bookings,
        booking => booking.spaceType,
      );
      expect(distinctSpaces.length).toBe(2);
      expect(distinctSpaces.includes(SpaceType.Enum.car)).toBe(true);
      expect(distinctSpaces.includes(SpaceType.Enum.desk)).toBe(true);
    });
  });

  describe('chunk tests', () => {
    describe('chunk', () => {
      it('should return an empty array if the input array is empty', () => {
        const result = chunk([], 2);
        expect(result).toEqual([]);
      });

      it('should return the input array as a single chunk if the chunk size is greater than the array length', () => {
        const input = [1, 2, 3, 4, 5];
        const result = chunk(input, 10);
        expect(result).toEqual([input]);
      });

      it('should split the input array into chunks of the specified size', () => {
        const input = [1, 2, 3, 4, 5];
        const result = chunk(input, 2);
        expect(result).toEqual([[1, 2], [3, 4], [5]]);
      });

      it('should handle cases where the input array length is not divisible by the chunk size', () => {
        const input = [1, 2, 3, 4, 5];
        const result = chunk(input, 3);
        expect(result).toEqual([
          [1, 2, 3],
          [4, 5],
        ]);
      });
    });
  });
});
