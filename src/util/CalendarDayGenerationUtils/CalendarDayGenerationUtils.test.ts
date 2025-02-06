import dayjs from 'dayjs';
import {generateDaysFrom} from './CalendarDayGenerationUtils';

describe('generateDaysFrom', () => {
  it('generates the days correctly for a normal time period', () => {
    const result = generateDaysFrom(dayjs('2023-06-30'));
    expect(result).toStrictEqual([
      '2023-06-26T00:00:00Z',
      '2023-06-27T00:00:00Z',
      '2023-06-28T00:00:00Z',
      '2023-06-29T00:00:00Z',
      '2023-06-30T00:00:00Z',
      '2023-07-03T00:00:00Z',
      '2023-07-04T00:00:00Z',
      '2023-07-05T00:00:00Z',
      '2023-07-06T00:00:00Z',
      '2023-07-07T00:00:00Z',
    ]);
  });
  it('generates the days correctly for a leap year', () => {
    const result = generateDaysFrom(dayjs('2024-02-24'));
    expect(result).toStrictEqual([
      '2024-02-19T00:00:00Z',
      '2024-02-20T00:00:00Z',
      '2024-02-21T00:00:00Z',
      '2024-02-22T00:00:00Z',
      '2024-02-23T00:00:00Z',
      '2024-02-26T00:00:00Z',
      '2024-02-27T00:00:00Z',
      '2024-02-28T00:00:00Z',
      '2024-02-29T00:00:00Z',
      '2024-03-01T00:00:00Z',
    ]);
  });
});
