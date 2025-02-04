import {toString} from './TimeSlotUtils';
import {TimeSlot} from '@customTypes/booking';

describe('TimeSlotUtils', () => {
  describe('toString', () => {
    const testData: {input: TimeSlot; expected: string}[] = [
      {input: TimeSlot.am, expected: 'AM'},
      {input: TimeSlot.pm, expected: 'PM'},
      {input: TimeSlot.allDay, expected: 'All day'},
      {input: 'unknown' as TimeSlot, expected: ''},
    ];

    testData.forEach(({input, expected}) => {
      it(`should return "${expected}" for "${input}" time slot`, () => {
        const result = toString(input);
        expect(result).toBe(expected);
      });
    });
  });
});
