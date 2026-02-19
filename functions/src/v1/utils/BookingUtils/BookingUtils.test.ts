import {BookingRequest, BusinessUnit} from '../../Models/booking.model';
import {
  calculateCarSpaceCapacity,
  checkDatesBeingBooked,
  checkSpaceTypeBeingBooked,
  isBookingDateLimitedToBU,
  isValidCarBookingDate,
} from './BookingUtils';

let mockServerTimestamp = '2023-06-30T00:00:00Z';
const mockedToDate = jest.fn(() => mockServerTimestamp);
jest.mock('firebase-admin', () => ({
  firestore: {
    Timestamp: {
      now: jest.fn(() => ({
        toDate: mockedToDate,
      })),
    },
  },
}));
const defaults = {
  deskCapacity: 36,
  murrayCarCapacity: 6,
  tenzingCarCapacity: 2,
  adamsCarCapacity: 2,
  unknownCarCapacity: 0,
};
jest.mock('../../Services/Defaults/defaults', () => ({
  defaults: defaults,
}));

let mockBookingRequest: BookingRequest;
describe('BookingUtils', () => {
  afterAll(() => {
    jest.clearAllMocks();
  });
  describe('checkDatesBeingBooked', () => {
    it('pass back length of more than 1 if different dates', () => {
      mockBookingRequest = {
        bookings: [
          {
            userId: '123',
            date: '2023-05-11T00:00:00Z',
            timeSlot: 'am',
            bookingType: 'personal',
            spaceType: 'desk',
          },
          {
            userId: '123',
            date: '2023-05-12T00:00:00Z',
            timeSlot: 'am',
            bookingType: 'personal',
            spaceType: 'desk',
          },
        ],
      };
      const testResult = checkDatesBeingBooked(mockBookingRequest);

      expect(testResult.length).toBe(2);
      expect(testResult).toStrictEqual([
        '2023-05-11T00:00:00Z',
        '2023-05-12T00:00:00Z',
      ]);
    });

    it('pass back length of 1 if all same date', () => {
      mockBookingRequest = {
        bookings: [
          {
            userId: '123',
            date: '2023-05-11T00:00:00Z',
            timeSlot: 'am',
            bookingType: 'personal',
            spaceType: 'desk',
          },
          {
            userId: '123',
            date: '2023-05-11T00:00:00Z',
            timeSlot: 'am',
            bookingType: 'personal',
            spaceType: 'desk',
          },
        ],
      };
      const testResult = checkDatesBeingBooked(mockBookingRequest);

      expect(testResult.length).toBe(1);
      expect(testResult).toStrictEqual(['2023-05-11T00:00:00Z']);
    });
  });

  describe('checkSpaceTypeBeingBooked', () => {
    it('pass back length of more than 1 if different space types', () => {
      mockBookingRequest = {
        bookings: [
          {
            userId: '123',
            date: '2023-05-11T00:00:00Z',
            timeSlot: 'am',
            bookingType: 'personal',
            spaceType: 'desk',
          },
          {
            userId: '123',
            date: '2023-05-11T00:00:00Z',
            timeSlot: 'am',
            bookingType: 'personal',
            spaceType: 'car',
          },
        ],
      };
      const testResult = checkSpaceTypeBeingBooked(mockBookingRequest);

      expect(testResult.length).toBe(2);
      expect(testResult).toStrictEqual(['desk', 'car']);
    });

    it('pass back length of 1 if all the same space type', () => {
      mockBookingRequest = {
        bookings: [
          {
            userId: '123',
            date: '2023-05-11T00:00:00Z',
            timeSlot: 'am',
            bookingType: 'personal',
            spaceType: 'desk',
          },
          {
            userId: '123',
            date: '2023-05-11T00:00:00Z',
            timeSlot: 'am',
            bookingType: 'personal',
            spaceType: 'desk',
          },
        ],
      };
      const testResult = checkSpaceTypeBeingBooked(mockBookingRequest);

      expect(testResult.length).toBe(1);
      expect(testResult).toStrictEqual(['desk']);
    });
  });
  describe('calculateCarSpaceCapacity', () => {
    const testCases = [
      {
        serverTimestamp: '2024-05-11T12:00:00Z',
        dateToBook: '2024-05-11T00:00:00Z',
        businessUnit: 'murray',
        expectedCapacity:
          defaults.murrayCarCapacity +
          defaults.tenzingCarCapacity +
          defaults.adamsCarCapacity,
        description:
          'should calculate correct car space capacity for murray BU when booking for the same day',
      },
      {
        serverTimestamp: '2024-05-11T22:00:00Z',
        dateToBook: '2024-05-11T00:00:00Z',
        businessUnit: 'murray',
        expectedCapacity:
          defaults.murrayCarCapacity +
          defaults.tenzingCarCapacity +
          defaults.adamsCarCapacity,
        description:
          'should calculate correct car space capacity for murray BU when booking after 9PM for the next day',
      },
      {
        serverTimestamp: '2024-05-11T19:00:00Z',
        dateToBook: '2024-05-12T00:00:00Z',
        businessUnit: 'murray',
        expectedCapacity: defaults.murrayCarCapacity,
        description:
          'should calculate correct car space capacity for murray BU when booking before 9PM for the next day',
      },
      {
        serverTimestamp: '2024-05-11T10:00:00Z',
        dateToBook: '2024-05-13T00:00:00Z',
        businessUnit: 'murray',
        expectedCapacity: defaults.murrayCarCapacity,
        description:
          'should calculate correct car space capacity for murray BU when booking 2 days before',
      },
      {
        serverTimestamp: '2024-05-11T12:00:00Z',
        dateToBook: '2024-05-11T00:00:00Z',
        businessUnit: 'tenzing',
        expectedCapacity:
          defaults.murrayCarCapacity +
          defaults.tenzingCarCapacity +
          defaults.adamsCarCapacity,
        description:
          'should calculate correct car space capacity for tenzing BU when booking for the same day',
      },
      {
        serverTimestamp: '2024-05-11T22:00:00Z',
        dateToBook: '2024-05-12T00:00:00Z',
        businessUnit: 'tenzing',
        expectedCapacity:
          defaults.murrayCarCapacity +
          defaults.tenzingCarCapacity +
          defaults.adamsCarCapacity,
        description:
          'should calculate correct car space capacity for tenzing BU when booking after 9PM for the next day',
      },
      {
        serverTimestamp: '2024-05-11T19:00:00Z',
        dateToBook: '2024-05-12T00:00:00Z',
        businessUnit: 'tenzing',
        expectedCapacity: defaults.tenzingCarCapacity,
        description:
          'should calculate correct car space capacity for tenzing BU when booking before 9PM for the next day',
      },
      {
        serverTimestamp: '2024-05-11T10:00:00Z',
        dateToBook: '2024-05-13T00:00:00Z',
        businessUnit: 'tenzing',
        expectedCapacity: defaults.tenzingCarCapacity,
        description:
          'should calculate correct car space capacity for tenzing BU when booking 2 days before',
      },
      {
        serverTimestamp: '2024-05-11T12:00:00Z',
        dateToBook: '2024-05-11T00:00:00Z',
        businessUnit: 'adams',
        expectedCapacity:
          defaults.murrayCarCapacity +
          defaults.tenzingCarCapacity +
          defaults.adamsCarCapacity,
        description:
          'should calculate correct car space capacity for adams BU when booking for the same day',
      },
      {
        serverTimestamp: '2024-05-11T22:00:00Z',
        dateToBook: '2024-05-12T00:00:00Z',
        businessUnit: 'adams',
        expectedCapacity:
          defaults.murrayCarCapacity +
          defaults.tenzingCarCapacity +
          defaults.adamsCarCapacity,
        description:
          'should calculate correct car space capacity for adams BU when booking after 9PM for the next day',
      },
      {
        serverTimestamp: '2024-05-11T19:00:00Z',
        dateToBook: '2024-05-12T00:00:00Z',
        businessUnit: 'adams',
        expectedCapacity: defaults.adamsCarCapacity,
        description:
          'should calculate correct car space capacity for adams BU when booking before 9PM for the next day',
      },
      {
        serverTimestamp: '2024-05-11T10:00:00Z',
        dateToBook: '2024-05-13T00:00:00Z',
        businessUnit: 'adams',
        expectedCapacity: defaults.adamsCarCapacity,
        description:
          'should calculate correct car space capacity for adams BU when booking 2 days before',
      },
      {
        serverTimestamp: '2024-05-11T12:00:00Z',
        dateToBook: '2024-05-11T00:00:00Z',
        businessUnit: 'unknown',
        expectedCapacity: defaults.unknownCarCapacity,
        description:
          'should calculate correct car space capacity for unknown BU',
      },
    ];

    it.each(testCases)(
      '$description',
      async ({serverTimestamp, dateToBook, businessUnit, expectedCapacity}) => {
        mockServerTimestamp = serverTimestamp;
        const capacity = calculateCarSpaceCapacity(
          dateToBook,
          businessUnit as BusinessUnit,
        );
        expect(capacity).toBe(expectedCapacity);
      },
    );
  });

  describe('isBookingLimittedToBU', () => {
    it('should return false if the booking date is same as the server date', () => {
      const bookingDate = '2023-07-06T00:00:00Z';
      mockServerTimestamp = bookingDate; // same day as server
      const isLimittedToBU = isBookingDateLimitedToBU(bookingDate);
      expect(isLimittedToBU).toBe(false);
    });
  });

  it('should return false if the booking date is next day and the booking is made at 9pm server time', () => {
    const bookingDate = '2023-07-07T00:00:00Z';
    mockServerTimestamp = '2023-07-06T21:00:00Z'; // day before and at 9pm
    const isLimittedToBU = isBookingDateLimitedToBU(bookingDate);
    expect(isLimittedToBU).toBe(false);
  });

  it('should return false if the booking date is next day and the booking is made after 9pm server time', () => {
    const bookingDate = '2023-07-07T00:00:00Z';
    mockServerTimestamp = '2023-07-06T22:00:00Z'; // day before and after 9pm
    const isLimittedToBU = isBookingDateLimitedToBU(bookingDate);
    expect(isLimittedToBU).toBe(false);
  });

  it('should return true if the booking date is next day and the booking is made before 9pm server time', () => {
    const bookingDate = '2023-07-5T00:00:00Z';
    mockServerTimestamp = '2023-07-06T20:00:00Z'; // day before and before 9pm
    const isLimittedToBU = isBookingDateLimitedToBU(bookingDate);
    expect(isLimittedToBU).toBe(true);
  });

  it('should return true if the booking date is in past date', () => {
    const bookingDate = '2023-07-5T00:00:00Z'; // past date
    mockServerTimestamp = '2023-07-06T00:00:00Z';
    const isLimittedToBU = isBookingDateLimitedToBU(bookingDate);
    expect(isLimittedToBU).toBe(true);
  });

  it('should return true if the booking date is in two days', () => {
    const bookingDate = '2023-07-8T00:00:00Z'; // booking in two days
    mockServerTimestamp = '2023-07-06T00:00:00Z';
    const isLimittedToBU = isBookingDateLimitedToBU(bookingDate);
    expect(isLimittedToBU).toBe(true);
  });

  describe('is booking date available', () => {
    describe('the booking is for in the past', () => {
      it('should return false', () => {
        const bookingDate = '2023-07-05T00:00:00Z';
        mockServerTimestamp = '2023-07-06T10:00:00Z'; // 10 am UTC
        const isValidBookingDate = isValidCarBookingDate(bookingDate);
        expect(isValidBookingDate).toBe(false);
      });
    });
    describe('the booking is 6 days in the future', () => {
      it('should return true', () => {
        const bookingDate = '2023-07-12T00:00:00Z';
        mockServerTimestamp = '2023-07-06T10:00:00Z'; // 10 am UTC
        const isValidBookingDate = isValidCarBookingDate(bookingDate);
        expect(isValidBookingDate).toBe(true);
      });
    });

    describe('the booking is 7 days in the future', () => {
      describe('it is before midday today', () => {
        it('should return false', () => {
          const bookingDate = '2023-07-13T00:00:00Z';
          mockServerTimestamp = '2023-07-06T10:00:00Z'; // 10 am UTC
          const isValidBookingDate = isValidCarBookingDate(bookingDate);
          expect(isValidBookingDate).toBe(false);
        });
      });

      describe('it is after midday today', () => {
        it('should return true', () => {
          const bookingDate = '2023-07-13T00:00:00Z';
          mockServerTimestamp = '2023-07-06T14:00:00Z'; // 2 pm UTC
          const isValidBookingDate = isValidCarBookingDate(bookingDate);
          expect(isValidBookingDate).toBe(true);
        });
      });
    });

    describe('the booking is more than 7 days in the future', () => {
      it('should return false', () => {
        const bookingDate = '2023-07-15T00:00:00Z';
        mockServerTimestamp = '2023-07-06T10:00:00Z'; // 10 am UTC
        const isValidBookingDate = isValidCarBookingDate(bookingDate);
        expect(isValidBookingDate).toBe(false);
      });
    });

    describe('the booking is for today', () => {
      it('should return true', () => {
        const bookingDate = '2023-07-06T00:00:00Z';
        mockServerTimestamp = '2023-07-06T10:00:00Z'; // 10 am UTC
        const isValidBookingDate = isValidCarBookingDate(bookingDate);
        expect(isValidBookingDate).toBe(true);
      });
    });
  });
});
