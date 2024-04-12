import {
  updatedLondonTime,
  isCloseToBookingDate,
  isValidParkingDate,
} from './DateTimeUtils';
import dayjs from 'dayjs';

describe('DateTimeUtils tests', () => {
  describe('isCloseToBookingDate', () => {
    it('should return true if the current date is the same as the booking date', () => {
      const bookingDate = dayjs('2023-07-25 00:00:00');
      const storedLondonTimestamp = dayjs('2023-07-25T10:00:00');
      const storedDeviceTimestamp = dayjs('2023-07-25T10:00:01');
      const currentDeviceTimestamp = dayjs('2023-07-25T14:00:01');
      const result = isCloseToBookingDate(
        storedLondonTimestamp,
        storedDeviceTimestamp,
        currentDeviceTimestamp,
        bookingDate,
      );
      expect(result).toBeTruthy();
    });

    it('should return false if the current date is the day before the booking date and is just before 9 PM', () => {
      const bookingDate = dayjs('2023-07-25 00:00:00');
      const storedLondonTimestamp = dayjs('2023-07-24T10:00:00');
      const storedDeviceTimestamp = dayjs('2023-07-24T10:00:01');
      const currentDeviceTimestamp = dayjs('2023-07-24T20:59:59');
      const result = isCloseToBookingDate(
        storedLondonTimestamp,
        storedDeviceTimestamp,
        currentDeviceTimestamp,
        bookingDate,
      );
      expect(result).toBeFalsy();
    });

    it('should return true if the current date is the day before the booking date and is 9 PM', () => {
      const bookingDate = dayjs('2023-07-25 00:00:00');
      const storedLondonTimestamp = dayjs('2023-07-25T10:00:00');
      const storedDeviceTimestamp = dayjs('2023-07-25T10:00:01');
      const currentDeviceTimestamp = dayjs('2023-07-25T21:00:01');
      const result = isCloseToBookingDate(
        storedLondonTimestamp,
        storedDeviceTimestamp,
        currentDeviceTimestamp,
        bookingDate,
      );
      expect(result).toBeTruthy();
    });

    it('should return true if the current date is the day before the booking date and after 9 PM', () => {
      const bookingDate = dayjs('2023-07-25 00:00:00');
      const storedLondonTimestamp = dayjs('2023-07-24T10:00:00');
      const storedDeviceTimestamp = dayjs('2023-07-24T10:00:01');
      const currentDeviceTimestamp = dayjs('2023-07-24T22:00:01');
      const result = isCloseToBookingDate(
        storedLondonTimestamp,
        storedDeviceTimestamp,
        currentDeviceTimestamp,
        bookingDate,
      );
      expect(result).toBeTruthy();
    });

    it('should return false if the current date is not close to the booking date', () => {
      const bookingDate = dayjs('2023-07-25 00:00:00');
      const storedLondonTimestamp = dayjs('2023-07-23T12:00:00');
      const storedDeviceTimestamp = dayjs('2023-07-23T12:00:00');
      const currentDeviceTimestamp = dayjs('2023-07-23T12:00:00');
      const result = isCloseToBookingDate(
        storedLondonTimestamp,
        storedDeviceTimestamp,
        currentDeviceTimestamp,
        bookingDate,
      );
      expect(result).toBeFalsy();
    });
  });

  describe('Getting the london time now', () => {
    it('returns the correct london time if the device is ahead', () => {
      const mockServerLondonTimestamp = dayjs('2023-06-30T13:00:00Z');
      const mockStoredDeviceTimestamp = dayjs('2023-06-30T14:00:00Z');
      const mockCurrentDeviceTimestamp = dayjs('2023-06-30T14:30:00Z'); //30 minute gap
      const expectedResponse = dayjs('2023-06-30T13:30:00Z');
      const result = updatedLondonTime(
        mockServerLondonTimestamp,
        mockStoredDeviceTimestamp,
        mockCurrentDeviceTimestamp,
      );
      expect(result).toStrictEqual(expectedResponse);
    });

    it('returns the correct london time if the device is behind', () => {
      const mockServerLondonTimestamp = dayjs('2023-06-30T13:00:00Z');
      const mockStoredDeviceTimestamp = dayjs('2023-06-30T11:00:00Z');
      const mockCurrentDeviceTimestamp = dayjs('2023-06-30T11:30:00Z'); //30 minute gap
      const expectedResponse = dayjs('2023-06-30T13:30:00Z');
      const result = updatedLondonTime(
        mockServerLondonTimestamp,
        mockStoredDeviceTimestamp,
        mockCurrentDeviceTimestamp,
      );
      expect(result).toStrictEqual(expectedResponse);
    });

    it('returns the correct london time if the device is behind but gap is now ahead', () => {
      const mockServerLondonTimestamp = dayjs('2023-06-30T13:00:00Z');
      const mockStoredDeviceTimestamp = dayjs('2023-06-30T12:00:00Z');
      const mockCurrentDeviceTimestamp = dayjs('2023-06-30T13:30:00Z'); //90 minute gap
      const expectedResponse = dayjs('2023-06-30T14:30:00Z');
      const result = updatedLondonTime(
        mockServerLondonTimestamp,
        mockStoredDeviceTimestamp,
        mockCurrentDeviceTimestamp,
      );
      expect(result).toStrictEqual(expectedResponse);
    });
  });

  describe('is booking date available', () => {
    describe('the booking is for in the past', () => {
      it('should return false', () => {
        const bookingDate = dayjs('2023-07-05T00:00:00Z');
        const storedLondonTimestamp = dayjs('2023-07-06T10:00:00'); // 10 GMT am London
        const storedDeviceTimestamp = dayjs('2023-07-06T10:00:01'); // 1 second gap
        const currentDeviceTimestamp = dayjs('2023-07-06T14:00:01'); // 4 hour gap
        const isValidBookingDate = isValidParkingDate(
          storedLondonTimestamp,
          storedDeviceTimestamp,
          currentDeviceTimestamp,
          bookingDate,
        );
        expect(isValidBookingDate).toBe(false);
      });
    });
    describe('the booking is 6 days in the future', () => {
      it('should return true', () => {
        const bookingDate = dayjs('2023-07-12T00:00:00Z');
        const storedLondonTimestamp = dayjs('2023-07-06T10:00:00'); // 10 GMT am London
        const storedDeviceTimestamp = dayjs('2023-07-06T10:00:01'); // 1 second gap
        const currentDeviceTimestamp = dayjs('2023-07-06T11:00:01'); // 4 hour gap
        const isValidBookingDate = isValidParkingDate(
          storedLondonTimestamp,
          storedDeviceTimestamp,
          currentDeviceTimestamp,
          bookingDate,
        );
        expect(isValidBookingDate).toBe(true);
      });
    });

    describe('the booking is 7 days in the future', () => {
      describe('it is before midday today', () => {
        it('should return false', () => {
          const bookingDate = dayjs('2023-07-13T00:00:00Z');
          const storedLondonTimestamp = dayjs('2023-07-06T10:00:00'); // 10 GMT am London
          const storedDeviceTimestamp = dayjs('2023-07-06T10:00:01'); // 1 second gap
          const currentDeviceTimestamp = dayjs('2023-07-06T11:00:01'); // 1 hour gap
          const isValidBookingDate = isValidParkingDate(
            storedLondonTimestamp,
            storedDeviceTimestamp,
            currentDeviceTimestamp,
            bookingDate,
          );
          expect(isValidBookingDate).toBe(false);
        });
      });

      describe('it is after midday today', () => {
        it('should return true', () => {
          const bookingDate = dayjs('2023-07-13T00:00:00Z');
          const storedLondonTimestamp = dayjs('2023-07-06T10:00:00'); // 10 GMT am London
          const storedDeviceTimestamp = dayjs('2023-07-06T10:00:01'); // 1 second gap
          const currentDeviceTimestamp = dayjs('2023-07-06T14:00:01'); // 4 hour gap
          const isValidBookingDate = isValidParkingDate(
            storedLondonTimestamp,
            storedDeviceTimestamp,
            currentDeviceTimestamp,
            bookingDate,
          );
          expect(isValidBookingDate).toBe(true);
        });
      });
    });

    describe('the booking is more than 7 days in the future', () => {
      it('should return false', () => {
        const bookingDate = dayjs('2023-07-15T00:00:00Z');
        const storedLondonTimestamp = dayjs('2023-07-06T10:00:00'); // 10 GMT am London
        const storedDeviceTimestamp = dayjs('2023-07-06T10:00:01'); // 1 second gap
        const currentDeviceTimestamp = dayjs('2023-07-06T11:00:01'); // 1 hour gap
        const isValidBookingDate = isValidParkingDate(
          storedLondonTimestamp,
          storedDeviceTimestamp,
          currentDeviceTimestamp,
          bookingDate,
        );
        expect(isValidBookingDate).toBe(false);
      });
    });

    describe('the booking is for today', () => {
      it('should return true', () => {
        const bookingDate = dayjs('2023-07-06T00:00:00Z');
        const storedLondonTimestamp = dayjs('2023-07-06T10:00:00'); // 10 GMT am London
        const storedDeviceTimestamp = dayjs('2023-07-06T10:00:01'); // 1 second gap
        const currentDeviceTimestamp = dayjs('2023-07-06T11:00:01'); // 4 hour gap
        const isValidBookingDate = isValidParkingDate(
          storedLondonTimestamp,
          storedDeviceTimestamp,
          currentDeviceTimestamp,
          bookingDate,
        );
        expect(isValidBookingDate).toBe(true);
      });
    });
  });
});
