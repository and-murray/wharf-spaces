import dayjs, {Dayjs} from 'dayjs';

export const sanitiseDate = (day: Dayjs = new Dayjs()) => {
  const midnightDate = dayjs(day)
    .set('hour', 0)
    .set('minute', 0)
    .set('second', 0)
    .set('millisecond', 0);

  return dayjs(midnightDate);
};
