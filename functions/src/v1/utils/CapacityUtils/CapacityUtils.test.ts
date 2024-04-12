import {BookingCapacity} from '../../Services/DeskCapacity/checkBookingCapacity';
import {
  reduceRemainingCapacity,
  increaseRemainingCapacity,
} from './CapacityUtils';

describe('Capacity Util Tests', () => {
  let initialRemainingCapacity: BookingCapacity = {am: 1, pm: 1, allDay: 1};

  beforeEach(() => {
    jest.clearAllMocks();
    initialRemainingCapacity = {am: 1, pm: 1, allDay: 1};
  });

  describe('Remove Booking from remaining Capacity', () => {
    describe('Removing an AM Time Slot Booking', () => {
      it('Increases the AM Time slot only', () => {
        const result = increaseRemainingCapacity(
          initialRemainingCapacity,
          'am',
        );
        expect(result).toEqual({am: 2, pm: 1, allDay: 1});
      });
    });

    describe('Removing a PM Time Slot Booking', () => {
      it('Increases the PM Time slot only', () => {
        const result = increaseRemainingCapacity(
          initialRemainingCapacity,
          'pm',
        );
        expect(result).toEqual({am: 1, pm: 2, allDay: 1});
      });
    });

    describe('Remove an All Day Time Slot Booking', () => {
      it('Increases all the time slots', () => {
        const result = increaseRemainingCapacity(
          initialRemainingCapacity,
          'allDay',
        );
        expect(result).toEqual({am: 2, pm: 2, allDay: 2});
      });
    });
  });

  describe('Adds a booking to Remaining Capacity', () => {
    describe('Adding an AM Time Slot Booking', () => {
      it('Decreases the AM Time slot and all day slot', () => {
        const result = reduceRemainingCapacity(initialRemainingCapacity, 'am');
        expect(result).toEqual({am: 0, pm: 1, allDay: 0});
      });
    });

    describe('Adding a PM Time Slot Booking', () => {
      it('Decreases the PM Time slot and the all day slot', () => {
        const result = reduceRemainingCapacity(initialRemainingCapacity, 'pm');
        expect(result).toEqual({am: 1, pm: 0, allDay: 0});
      });
    });

    describe('Adding an All Day Time Slot Booking', () => {
      it('Decreases all the time slots', () => {
        const result = reduceRemainingCapacity(
          initialRemainingCapacity,
          'allDay',
        );
        expect(result).toEqual({am: 0, pm: 0, allDay: 0});
      });
    });
  });
});
