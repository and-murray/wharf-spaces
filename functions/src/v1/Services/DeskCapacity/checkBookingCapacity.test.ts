import {checkBookingCapacity} from './checkBookingCapacity';
import * as firebaseBookingService from '../FirebaseBookingService/firebaseBookingService';
import * as bookingUtils from '../../utils/BookingUtils/BookingUtils';
import {
  Booking,
  BusinessUnit,
  SpaceType,
  User,
} from '../../Models/booking.model';
import {FieldValue, Timestamp} from 'firebase-admin/firestore';
import * as firebaseAdminService from '../../Services/FirebaseAdminService/firebaseAdminService';

let getNonReservedBookingsOnDateSpy = jest.spyOn(
  firebaseBookingService,
  'getNonReservedBookingsOnDate',
);

jest.mock('../Defaults/defaults', () => ({defaults: {deskCapacity: 36}}));
const checkCarSpaceCapacitySpy = jest.spyOn(
  bookingUtils,
  'calculateCarSpaceCapacity',
);

const isBookingDateLimitedToBUSpy = jest.spyOn(
  bookingUtils,
  'isBookingDateLimitedToBU',
);

let getFirestoreUserSpy = jest.spyOn(firebaseAdminService, 'getFirestoreUser');

const testDate = '2023-05-11T00:00:00Z';
describe('Check Booking Capacity Tests ', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  afterAll(() => {
    jest.clearAllMocks();
  });

  describe('Desk Bookings', () => {
    const spaceType: SpaceType = 'desk';

    describe('User is from Murray, Adams, or Tenzing', () => {
      let murrayBooking: Booking = {
        id: '1',
        date: '2023-05-11T00:00:00Z',
        timeSlot: 'am',
        bookingType: 'personal',
        spaceType: 'desk',
        isReserveSpace: false,
        userId: '123',
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      };
      let tenzingBooking: Booking = {
        id: '2',
        date: '2023-05-11T00:00:00Z',
        timeSlot: 'am',
        bookingType: 'personal',
        spaceType: 'desk',
        isReserveSpace: false,
        userId: '321',
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      };
      let adamsBooking: Booking = {
        id: '3',
        date: '2023-05-11T00:00:00Z',
        timeSlot: 'am',
        bookingType: 'personal',
        spaceType: 'desk',
        isReserveSpace: false,
        userId: '987',
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      };
      const mockMurrayUser: User = {
        id: '123',
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        profilePicUrl: 'https://example.com/test-photo.jpg',
        role: 'user',
        businessUnit: 'murray',
        createdAt: new Timestamp(0, 0),
        updatedAt: new Timestamp(0, 0),
      };
      const mockTenzingUser: User = {
        id: '321',
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        profilePicUrl: 'https://example.com/test-photo.jpg',
        role: 'user',
        businessUnit: 'tenzing',
        createdAt: new Timestamp(0, 0),
        updatedAt: new Timestamp(0, 0),
      };
      const mockAdamsUser: User = {
        id: '987',
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        profilePicUrl: 'https://example.com/test-photo.jpg',
        role: 'user',
        businessUnit: 'adams',
        createdAt: new Timestamp(0, 0),
        updatedAt: new Timestamp(0, 0),
      };
      const businessUnit: BusinessUnit = 'murray';

      beforeEach(() => {
        getFirestoreUserSpy.mockResolvedValueOnce(mockMurrayUser);
        getFirestoreUserSpy.mockResolvedValueOnce(mockTenzingUser);
        getFirestoreUserSpy.mockResolvedValueOnce(mockAdamsUser);
      });

      describe('Is Limited to BU', () => {
        beforeEach(() => {
          jest.clearAllMocks();
          isBookingDateLimitedToBUSpy.mockReturnValue(true);
        });
        describe('There are no bookings', () => {
          beforeEach(() => {
            jest.clearAllMocks();
            getNonReservedBookingsOnDateSpy.mockResolvedValue([]);
          });

          it('Returns a capacity of 36 for all slots', async () => {
            const result = await checkBookingCapacity(
              testDate,
              spaceType,
              businessUnit,
            );
            expect(result.am).toBe(36);
            expect(result.pm).toBe(36);
            expect(result.allDay).toBe(36);
          });
        });

        describe('There are am bookings, one from each BU', () => {
          beforeEach(() => {
            jest.clearAllMocks();
            murrayBooking.timeSlot = 'am';
            tenzingBooking.timeSlot = 'am';
            adamsBooking.timeSlot = 'am';
            getNonReservedBookingsOnDateSpy.mockResolvedValue([
              murrayBooking,
              tenzingBooking,
              adamsBooking,
            ]);
          });

          it('Returns a capacity of 33 for am and all day', async () => {
            const result = await checkBookingCapacity(
              testDate,
              spaceType,
              businessUnit,
            );
            expect(result.am).toBe(33);
            expect(result.pm).toBe(36);
            expect(result.allDay).toBe(33);
          });
        });

        describe('There are pm bookings, one from each BU', () => {
          beforeEach(() => {
            jest.clearAllMocks();
            murrayBooking.timeSlot = 'pm';
            tenzingBooking.timeSlot = 'pm';
            adamsBooking.timeSlot = 'pm';
            getNonReservedBookingsOnDateSpy.mockResolvedValue([
              murrayBooking,
              tenzingBooking,
              adamsBooking,
            ]);
          });

          it('Returns a capacity of 33 for pm and all day', async () => {
            const result = await checkBookingCapacity(
              testDate,
              spaceType,
              businessUnit,
            );
            expect(result.am).toBe(36);
            expect(result.pm).toBe(33);
            expect(result.allDay).toBe(33);
          });
        });

        describe('There are allDay bookings, one from each BU', () => {
          beforeEach(() => {
            jest.clearAllMocks();
            murrayBooking.timeSlot = 'allDay';
            tenzingBooking.timeSlot = 'allDay';
            adamsBooking.timeSlot = 'allDay';
            getNonReservedBookingsOnDateSpy.mockResolvedValue([
              murrayBooking,
              tenzingBooking,
              adamsBooking,
            ]);
          });

          it('Returns a capacity of 33 all slots', async () => {
            const result = await checkBookingCapacity(
              testDate,
              spaceType,
              businessUnit,
            );
            expect(result.am).toBe(33);
            expect(result.pm).toBe(33);
            expect(result.allDay).toBe(33);
          });
        });
      });

      describe('It is not limited to BU', () => {
        beforeEach(() => {
          jest.clearAllMocks();
          isBookingDateLimitedToBUSpy.mockReturnValue(false);
        });

        describe('There are no bookings', () => {
          beforeEach(() => {
            jest.clearAllMocks();
            getNonReservedBookingsOnDateSpy.mockResolvedValue([]);
          });

          it('Returns a capacity of 36 for all slots', async () => {
            const result = await checkBookingCapacity(
              testDate,
              spaceType,
              businessUnit,
            );
            expect(result.am).toBe(36);
            expect(result.pm).toBe(36);
            expect(result.allDay).toBe(36);
          });
        });

        describe('There are am bookings, one from each BU', () => {
          beforeEach(() => {
            jest.clearAllMocks();
            murrayBooking.timeSlot = 'am';
            tenzingBooking.timeSlot = 'am';
            adamsBooking.timeSlot = 'am';
            getNonReservedBookingsOnDateSpy.mockResolvedValue([
              murrayBooking,
              tenzingBooking,
              adamsBooking,
            ]);
          });

          it('Returns a capacity of 33 for am and all day', async () => {
            const result = await checkBookingCapacity(
              testDate,
              spaceType,
              businessUnit,
            );
            expect(result.am).toBe(33);
            expect(result.pm).toBe(36);
            expect(result.allDay).toBe(33);
          });
        });

        describe('There are pm bookings, one from each BU', () => {
          beforeEach(() => {
            jest.clearAllMocks();
            murrayBooking.timeSlot = 'pm';
            tenzingBooking.timeSlot = 'pm';
            adamsBooking.timeSlot = 'pm';
            getNonReservedBookingsOnDateSpy.mockResolvedValue([
              murrayBooking,
              tenzingBooking,
              adamsBooking,
            ]);
          });

          it('Returns a capacity of 33 for pm and all day', async () => {
            const result = await checkBookingCapacity(
              testDate,
              spaceType,
              businessUnit,
            );
            expect(result.am).toBe(36);
            expect(result.pm).toBe(33);
            expect(result.allDay).toBe(33);
          });
        });

        describe('There are allDay bookings, one from each BU', () => {
          beforeEach(() => {
            jest.clearAllMocks();
            murrayBooking.timeSlot = 'allDay';
            tenzingBooking.timeSlot = 'allDay';
            adamsBooking.timeSlot = 'allDay';
            getNonReservedBookingsOnDateSpy.mockResolvedValue([
              murrayBooking,
              tenzingBooking,
              adamsBooking,
            ]);
          });

          it('Returns a capacity of 33 all slots', async () => {
            const result = await checkBookingCapacity(
              testDate,
              spaceType,
              businessUnit,
            );
            expect(result.am).toBe(33);
            expect(result.pm).toBe(33);
            expect(result.allDay).toBe(33);
          });
        });
      });
    });

    describe('User is from unknown BU', () => {
      let murrayBooking: Booking = {
        id: '1',
        date: '2023-05-11T00:00:00Z',
        timeSlot: 'am',
        bookingType: 'personal',
        spaceType: 'car',
        isReserveSpace: false,
        userId: '123',
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      };
      let tenzingBooking: Booking = {
        id: '2',
        date: '2023-05-11T00:00:00Z',
        timeSlot: 'am',
        bookingType: 'personal',
        spaceType: 'car',
        isReserveSpace: false,
        userId: '321',
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      };
      let adamsBooking: Booking = {
        id: '3',
        date: '2023-05-11T00:00:00Z',
        timeSlot: 'am',
        bookingType: 'personal',
        spaceType: 'car',
        isReserveSpace: false,
        userId: '987',
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      };
      const mockMurrayUser: User = {
        id: '123',
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        profilePicUrl: 'https://example.com/test-photo.jpg',
        role: 'user',
        businessUnit: 'murray',
        createdAt: new Timestamp(0, 0),
        updatedAt: new Timestamp(0, 0),
      };
      const mockTenzingUser: User = {
        id: '321',
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        profilePicUrl: 'https://example.com/test-photo.jpg',
        role: 'user',
        businessUnit: 'tenzing',
        createdAt: new Timestamp(0, 0),
        updatedAt: new Timestamp(0, 0),
      };
      const mockAdamsUser: User = {
        id: '987',
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        profilePicUrl: 'https://example.com/test-photo.jpg',
        role: 'user',
        businessUnit: 'adams',
        createdAt: new Timestamp(0, 0),
        updatedAt: new Timestamp(0, 0),
      };
      const businessUnit: BusinessUnit = 'unknown';

      beforeEach(() => {
        getFirestoreUserSpy.mockResolvedValueOnce(mockMurrayUser);
        getFirestoreUserSpy.mockResolvedValueOnce(mockTenzingUser);
        getFirestoreUserSpy.mockResolvedValueOnce(mockAdamsUser);
      });

      describe('Is Limited to BU', () => {
        beforeEach(() => {
          jest.clearAllMocks();
          isBookingDateLimitedToBUSpy.mockReturnValue(true);
        });
        describe('There are no bookings', () => {
          beforeEach(() => {
            jest.clearAllMocks();
            getNonReservedBookingsOnDateSpy.mockResolvedValue([]);
          });

          it('Returns a capacity of 36 for all slots', async () => {
            const result = await checkBookingCapacity(
              testDate,
              spaceType,
              businessUnit,
            );
            expect(result.am).toBe(36);
            expect(result.pm).toBe(36);
            expect(result.allDay).toBe(36);
          });
        });

        describe('There are am bookings, one from each BU', () => {
          beforeEach(() => {
            jest.clearAllMocks();
            murrayBooking.timeSlot = 'am';
            tenzingBooking.timeSlot = 'am';
            adamsBooking.timeSlot = 'am';
            getNonReservedBookingsOnDateSpy.mockResolvedValue([
              murrayBooking,
              tenzingBooking,
              adamsBooking,
            ]);
          });

          it('Returns a capacity of 33 for am and all day', async () => {
            const result = await checkBookingCapacity(
              testDate,
              spaceType,
              businessUnit,
            );
            expect(result.am).toBe(33);
            expect(result.pm).toBe(36);
            expect(result.allDay).toBe(33);
          });
        });

        describe('There are pm bookings, one from each BU', () => {
          beforeEach(() => {
            jest.clearAllMocks();
            murrayBooking.timeSlot = 'pm';
            tenzingBooking.timeSlot = 'pm';
            adamsBooking.timeSlot = 'pm';
            getNonReservedBookingsOnDateSpy.mockResolvedValue([
              murrayBooking,
              tenzingBooking,
              adamsBooking,
            ]);
          });

          it('Returns a capacity of 33 for pm and all day', async () => {
            const result = await checkBookingCapacity(
              testDate,
              spaceType,
              businessUnit,
            );
            expect(result.am).toBe(36);
            expect(result.pm).toBe(33);
            expect(result.allDay).toBe(33);
          });
        });

        describe('There are allDay bookings, one from each BU', () => {
          beforeEach(() => {
            jest.clearAllMocks();
            murrayBooking.timeSlot = 'allDay';
            tenzingBooking.timeSlot = 'allDay';
            adamsBooking.timeSlot = 'allDay';
            getNonReservedBookingsOnDateSpy.mockResolvedValue([
              murrayBooking,
              tenzingBooking,
              adamsBooking,
            ]);
          });

          it('Returns a capacity of 33 all slots', async () => {
            const result = await checkBookingCapacity(
              testDate,
              spaceType,
              businessUnit,
            );
            expect(result.am).toBe(33);
            expect(result.pm).toBe(33);
            expect(result.allDay).toBe(33);
          });
        });
      });

      describe('It is not limited to BU', () => {
        beforeEach(() => {
          jest.clearAllMocks();
          isBookingDateLimitedToBUSpy.mockReturnValue(false);
        });

        describe('There are no bookings', () => {
          beforeEach(() => {
            jest.clearAllMocks();
            getNonReservedBookingsOnDateSpy.mockResolvedValue([]);
          });

          it('Returns a capacity of 36 for all slots', async () => {
            const result = await checkBookingCapacity(
              testDate,
              spaceType,
              businessUnit,
            );
            expect(result.am).toBe(36);
            expect(result.pm).toBe(36);
            expect(result.allDay).toBe(36);
          });
        });

        describe('There are am bookings, one from each BU', () => {
          beforeEach(() => {
            jest.clearAllMocks();
            murrayBooking.timeSlot = 'am';
            tenzingBooking.timeSlot = 'am';
            adamsBooking.timeSlot = 'am';
            getNonReservedBookingsOnDateSpy.mockResolvedValue([
              murrayBooking,
              tenzingBooking,
              adamsBooking,
            ]);
          });

          it('Returns a capacity of 33 for am and all day', async () => {
            const result = await checkBookingCapacity(
              testDate,
              spaceType,
              businessUnit,
            );
            expect(result.am).toBe(33);
            expect(result.pm).toBe(36);
            expect(result.allDay).toBe(33);
          });
        });

        describe('There are pm bookings, one from each BU', () => {
          beforeEach(() => {
            jest.clearAllMocks();
            murrayBooking.timeSlot = 'pm';
            tenzingBooking.timeSlot = 'pm';
            adamsBooking.timeSlot = 'pm';
            getNonReservedBookingsOnDateSpy.mockResolvedValue([
              murrayBooking,
              tenzingBooking,
              adamsBooking,
            ]);
          });

          it('Returns a capacity of 33 for pm and all day', async () => {
            const result = await checkBookingCapacity(
              testDate,
              spaceType,
              businessUnit,
            );
            expect(result.am).toBe(36);
            expect(result.pm).toBe(33);
            expect(result.allDay).toBe(33);
          });
        });

        describe('There are allDay bookings, one from each BU', () => {
          beforeEach(() => {
            jest.clearAllMocks();
            murrayBooking.timeSlot = 'allDay';
            tenzingBooking.timeSlot = 'allDay';
            adamsBooking.timeSlot = 'allDay';
            getNonReservedBookingsOnDateSpy.mockResolvedValue([
              murrayBooking,
              tenzingBooking,
              adamsBooking,
            ]);
          });

          it('Returns a capacity of 33 all slots', async () => {
            const result = await checkBookingCapacity(
              testDate,
              spaceType,
              businessUnit,
            );
            expect(result.am).toBe(33);
            expect(result.pm).toBe(33);
            expect(result.allDay).toBe(33);
          });
        });
      });
    });
  });

  describe('Car Bookings', () => {
    const spaceType: SpaceType = 'car';

    describe('User is from Murray, Adams, or Tenzing', () => {
      let murrayBooking: Booking = {
        id: '1',
        date: '2023-05-11T00:00:00Z',
        timeSlot: 'am',
        bookingType: 'personal',
        spaceType: 'car',
        isReserveSpace: false,
        userId: '123',
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      };
      let tenzingBooking: Booking = {
        id: '2',
        date: '2023-05-11T00:00:00Z',
        timeSlot: 'am',
        bookingType: 'personal',
        spaceType: 'car',
        isReserveSpace: false,
        userId: '321',
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      };
      let adamsBooking: Booking = {
        id: '3',
        date: '2023-05-11T00:00:00Z',
        timeSlot: 'am',
        bookingType: 'personal',
        spaceType: 'car',
        isReserveSpace: false,
        userId: '987',
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      };
      const mockMurrayUser: User = {
        id: '123',
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        profilePicUrl: 'https://example.com/test-photo.jpg',
        role: 'user',
        businessUnit: 'murray',
        createdAt: new Timestamp(0, 0),
        updatedAt: new Timestamp(0, 0),
      };
      const mockTenzingUser: User = {
        id: '321',
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        profilePicUrl: 'https://example.com/test-photo.jpg',
        role: 'user',
        businessUnit: 'tenzing',
        createdAt: new Timestamp(0, 0),
        updatedAt: new Timestamp(0, 0),
      };
      const mockAdamsUser: User = {
        id: '987',
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        profilePicUrl: 'https://example.com/test-photo.jpg',
        role: 'user',
        businessUnit: 'adams',
        createdAt: new Timestamp(0, 0),
        updatedAt: new Timestamp(0, 0),
      };
      const businessUnit: BusinessUnit = 'murray';

      beforeEach(() => {
        getFirestoreUserSpy.mockResolvedValueOnce(mockMurrayUser);
        getFirestoreUserSpy.mockResolvedValueOnce(mockTenzingUser);
        getFirestoreUserSpy.mockResolvedValueOnce(mockAdamsUser);
      });

      describe('Is Limited to BU', () => {
        beforeEach(() => {
          jest.clearAllMocks();
          checkCarSpaceCapacitySpy.mockReturnValue(6);
          isBookingDateLimitedToBUSpy.mockReturnValue(true);
        });
        describe('There are no bookings', () => {
          beforeEach(() => {
            jest.clearAllMocks();
            getNonReservedBookingsOnDateSpy.mockResolvedValue([]);
          });

          it('Returns a capacity of 6 for all slots', async () => {
            const result = await checkBookingCapacity(
              testDate,
              spaceType,
              businessUnit,
            );
            expect(result.am).toBe(6);
            expect(result.pm).toBe(6);
            expect(result.allDay).toBe(6);
          });
        });

        describe('There are am bookings, one from each BU', () => {
          beforeEach(() => {
            jest.clearAllMocks();
            murrayBooking.timeSlot = 'am';
            tenzingBooking.timeSlot = 'am';
            adamsBooking.timeSlot = 'am';
            getNonReservedBookingsOnDateSpy.mockResolvedValue([
              murrayBooking,
              tenzingBooking,
              adamsBooking,
            ]);
          });

          it('Returns a capacity of 5 for am and all day', async () => {
            const result = await checkBookingCapacity(
              testDate,
              spaceType,
              businessUnit,
            );
            expect(result.am).toBe(5);
            expect(result.pm).toBe(6);
            expect(result.allDay).toBe(5);
          });
        });

        describe('There are pm bookings, one from each BU', () => {
          beforeEach(() => {
            jest.clearAllMocks();
            murrayBooking.timeSlot = 'pm';
            tenzingBooking.timeSlot = 'pm';
            adamsBooking.timeSlot = 'pm';
            getNonReservedBookingsOnDateSpy.mockResolvedValue([
              murrayBooking,
              tenzingBooking,
              adamsBooking,
            ]);
          });

          it('Returns a capacity of 5 for pm and all day', async () => {
            const result = await checkBookingCapacity(
              testDate,
              spaceType,
              businessUnit,
            );
            expect(result.am).toBe(6);
            expect(result.pm).toBe(5);
            expect(result.allDay).toBe(5);
          });
        });

        describe('There are allDay bookings, one from each BU', () => {
          beforeEach(() => {
            jest.clearAllMocks();
            murrayBooking.timeSlot = 'allDay';
            tenzingBooking.timeSlot = 'allDay';
            adamsBooking.timeSlot = 'allDay';
            getNonReservedBookingsOnDateSpy.mockResolvedValue([
              murrayBooking,
              tenzingBooking,
              adamsBooking,
            ]);
          });

          it('Returns a capacity of 5 all slots', async () => {
            const result = await checkBookingCapacity(
              testDate,
              spaceType,
              businessUnit,
            );
            expect(result.am).toBe(5);
            expect(result.pm).toBe(5);
            expect(result.allDay).toBe(5);
          });
        });
      });

      describe('It is not limited to BU', () => {
        beforeEach(() => {
          jest.clearAllMocks();
          checkCarSpaceCapacitySpy.mockReturnValue(8);
          isBookingDateLimitedToBUSpy.mockReturnValue(false);
        });

        describe('There are no bookings', () => {
          beforeEach(() => {
            jest.clearAllMocks();
            getNonReservedBookingsOnDateSpy.mockResolvedValue([]);
          });

          it('Returns a capacity of 8 for all slots', async () => {
            const result = await checkBookingCapacity(
              testDate,
              spaceType,
              businessUnit,
            );
            expect(result.am).toBe(8);
            expect(result.pm).toBe(8);
            expect(result.allDay).toBe(8);
          });
        });

        describe('There are am bookings, one from each BU', () => {
          beforeEach(() => {
            jest.clearAllMocks();
            murrayBooking.timeSlot = 'am';
            tenzingBooking.timeSlot = 'am';
            adamsBooking.timeSlot = 'am';
            getNonReservedBookingsOnDateSpy.mockResolvedValue([
              murrayBooking,
              tenzingBooking,
              adamsBooking,
            ]);
          });

          it('Returns a capacity of 5 for am and all day', async () => {
            const result = await checkBookingCapacity(
              testDate,
              spaceType,
              businessUnit,
            );
            expect(result.am).toBe(5);
            expect(result.pm).toBe(8);
            expect(result.allDay).toBe(5);
          });
        });

        describe('There are pm bookings, one from each BU', () => {
          beforeEach(() => {
            jest.clearAllMocks();
            murrayBooking.timeSlot = 'pm';
            tenzingBooking.timeSlot = 'pm';
            adamsBooking.timeSlot = 'pm';
            getNonReservedBookingsOnDateSpy.mockResolvedValue([
              murrayBooking,
              tenzingBooking,
              adamsBooking,
            ]);
          });

          it('Returns a capacity of 5 for pm and all day', async () => {
            const result = await checkBookingCapacity(
              testDate,
              spaceType,
              businessUnit,
            );
            expect(result.am).toBe(8);
            expect(result.pm).toBe(5);
            expect(result.allDay).toBe(5);
          });
        });

        describe('There are allDay bookings, one from each BU', () => {
          beforeEach(() => {
            jest.clearAllMocks();
            murrayBooking.timeSlot = 'allDay';
            tenzingBooking.timeSlot = 'allDay';
            adamsBooking.timeSlot = 'allDay';
            getNonReservedBookingsOnDateSpy.mockResolvedValue([
              murrayBooking,
              tenzingBooking,
              adamsBooking,
            ]);
          });

          it('Returns a capacity of 5 all slots', async () => {
            const result = await checkBookingCapacity(
              testDate,
              spaceType,
              businessUnit,
            );
            expect(result.am).toBe(5);
            expect(result.pm).toBe(5);
            expect(result.allDay).toBe(5);
          });
        });

        describe('There are allDay bookings and am bookings from each BU', () => {
          beforeEach(() => {
            jest.clearAllMocks();
            murrayBooking.timeSlot = 'allDay';
            tenzingBooking.timeSlot = 'am';
            adamsBooking.timeSlot = 'am';
            getNonReservedBookingsOnDateSpy.mockResolvedValue([
              murrayBooking,
              tenzingBooking,
              adamsBooking,
            ]);
          });

          it('Returns a capacity of 5 for am and all day and 7 for pm slots', async () => {
            const result = await checkBookingCapacity(
              testDate,
              spaceType,
              businessUnit,
            );
            expect(result.am).toBe(5);
            expect(result.pm).toBe(7);
            expect(result.allDay).toBe(5);
          });
        });
      });
    });

    describe('User BU is unknown', () => {
      let murrayBooking: Booking = {
        id: '1',
        date: '2023-05-11T00:00:00Z',
        timeSlot: 'am',
        bookingType: 'personal',
        spaceType: 'car',
        isReserveSpace: false,
        userId: '123',
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      };
      let tenzingBooking: Booking = {
        id: '2',
        date: '2023-05-11T00:00:00Z',
        timeSlot: 'am',
        bookingType: 'personal',
        spaceType: 'car',
        isReserveSpace: false,
        userId: '321',
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      };
      let adamsBooking: Booking = {
        id: '3',
        date: '2023-05-11T00:00:00Z',
        timeSlot: 'am',
        bookingType: 'personal',
        spaceType: 'car',
        isReserveSpace: false,
        userId: '987',
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      };
      const mockMurrayUser: User = {
        id: '123',
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        profilePicUrl: 'https://example.com/test-photo.jpg',
        role: 'user',
        businessUnit: 'murray',
        createdAt: new Timestamp(0, 0),
        updatedAt: new Timestamp(0, 0),
      };
      const mockTenzingUser: User = {
        id: '321',
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        profilePicUrl: 'https://example.com/test-photo.jpg',
        role: 'user',
        businessUnit: 'tenzing',
        createdAt: new Timestamp(0, 0),
        updatedAt: new Timestamp(0, 0),
      };
      const mockAdamsUser: User = {
        id: '987',
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        profilePicUrl: 'https://example.com/test-photo.jpg',
        role: 'user',
        businessUnit: 'adams',
        createdAt: new Timestamp(0, 0),
        updatedAt: new Timestamp(0, 0),
      };
      const businessUnit: BusinessUnit = 'unknown';

      beforeEach(() => {
        getFirestoreUserSpy.mockResolvedValueOnce(mockMurrayUser);
        getFirestoreUserSpy.mockResolvedValueOnce(mockTenzingUser);
        getFirestoreUserSpy.mockResolvedValueOnce(mockAdamsUser);
      });
      describe('Is Limited to BU', () => {
        beforeEach(() => {
          jest.clearAllMocks();
          checkCarSpaceCapacitySpy.mockReturnValue(0);
          isBookingDateLimitedToBUSpy.mockReturnValue(true);
        });
        describe('There are no bookings', () => {
          beforeEach(() => {
            jest.clearAllMocks();
            getNonReservedBookingsOnDateSpy.mockResolvedValue([]);
          });

          it('Returns a capacity of 0 for all slots', async () => {
            const result = await checkBookingCapacity(
              testDate,
              spaceType,
              businessUnit,
            );
            expect(result.am).toBe(0);
            expect(result.pm).toBe(0);
            expect(result.allDay).toBe(0);
          });
        });

        describe('There are am bookings, one from each BU', () => {
          beforeEach(() => {
            jest.clearAllMocks();
            murrayBooking.timeSlot = 'am';
            tenzingBooking.timeSlot = 'am';
            adamsBooking.timeSlot = 'am';
            getNonReservedBookingsOnDateSpy.mockResolvedValue([
              murrayBooking,
              tenzingBooking,
              adamsBooking,
            ]);
          });

          it('Returns a capacity of 0 for am and all day', async () => {
            const result = await checkBookingCapacity(
              testDate,
              spaceType,
              businessUnit,
            );
            expect(result.am).toBe(0);
            expect(result.pm).toBe(0);
            expect(result.allDay).toBe(0);
          });
        });

        describe('There are pm bookings, one from each BU', () => {
          beforeEach(() => {
            jest.clearAllMocks();
            murrayBooking.timeSlot = 'pm';
            tenzingBooking.timeSlot = 'pm';
            adamsBooking.timeSlot = 'pm';
            getNonReservedBookingsOnDateSpy.mockResolvedValue([
              murrayBooking,
              tenzingBooking,
              adamsBooking,
            ]);
          });

          it('Returns a capacity of 0 for pm and all day', async () => {
            const result = await checkBookingCapacity(
              testDate,
              spaceType,
              businessUnit,
            );
            expect(result.am).toBe(0);
            expect(result.pm).toBe(0);
            expect(result.allDay).toBe(0);
          });
        });

        describe('There are allDay bookings, one from each BU', () => {
          beforeEach(() => {
            jest.clearAllMocks();
            murrayBooking.timeSlot = 'allDay';
            tenzingBooking.timeSlot = 'allDay';
            adamsBooking.timeSlot = 'allDay';
            getNonReservedBookingsOnDateSpy.mockResolvedValue([
              murrayBooking,
              tenzingBooking,
              adamsBooking,
            ]);
          });

          it('Returns a capacity of 0 all slots', async () => {
            const result = await checkBookingCapacity(
              testDate,
              spaceType,
              businessUnit,
            );
            expect(result.am).toBe(0);
            expect(result.pm).toBe(0);
            expect(result.allDay).toBe(0);
          });
        });
      });

      describe('It is not limited to BU', () => {
        beforeEach(() => {
          jest.clearAllMocks();
          checkCarSpaceCapacitySpy.mockReturnValue(0);
          isBookingDateLimitedToBUSpy.mockReturnValue(false);
        });

        describe('There are no bookings', () => {
          beforeEach(() => {
            jest.clearAllMocks();
            getNonReservedBookingsOnDateSpy.mockResolvedValue([]);
          });

          it('Returns a capacity of 0 for all slots', async () => {
            const result = await checkBookingCapacity(
              testDate,
              spaceType,
              businessUnit,
            );
            expect(result.am).toBe(0);
            expect(result.pm).toBe(0);
            expect(result.allDay).toBe(0);
          });
        });

        describe('There are am bookings, one from each BU', () => {
          beforeEach(() => {
            jest.clearAllMocks();
            murrayBooking.timeSlot = 'am';
            tenzingBooking.timeSlot = 'am';
            adamsBooking.timeSlot = 'am';
            getNonReservedBookingsOnDateSpy.mockResolvedValue([
              murrayBooking,
              tenzingBooking,
              adamsBooking,
            ]);
          });

          it('Returns a capacity of 0 for am and all day', async () => {
            const result = await checkBookingCapacity(
              testDate,
              spaceType,
              businessUnit,
            );
            expect(result.am).toBe(0);
            expect(result.pm).toBe(0);
            expect(result.allDay).toBe(0);
          });
        });

        describe('There are pm bookings, one from each BU', () => {
          beforeEach(() => {
            jest.clearAllMocks();
            murrayBooking.timeSlot = 'pm';
            tenzingBooking.timeSlot = 'pm';
            adamsBooking.timeSlot = 'pm';
            getNonReservedBookingsOnDateSpy.mockResolvedValue([
              murrayBooking,
              tenzingBooking,
              adamsBooking,
            ]);
          });

          it('Returns a capacity of 0 for pm and all day', async () => {
            const result = await checkBookingCapacity(
              testDate,
              spaceType,
              businessUnit,
            );
            expect(result.am).toBe(0);
            expect(result.pm).toBe(0);
            expect(result.allDay).toBe(0);
          });
        });

        describe('There are allDay bookings, one from each BU', () => {
          beforeEach(() => {
            jest.clearAllMocks();
            murrayBooking.timeSlot = 'allDay';
            tenzingBooking.timeSlot = 'allDay';
            adamsBooking.timeSlot = 'allDay';
            getNonReservedBookingsOnDateSpy.mockResolvedValue([
              murrayBooking,
              tenzingBooking,
              adamsBooking,
            ]);
          });

          it('Returns a capacity of 0 all slots', async () => {
            const result = await checkBookingCapacity(
              testDate,
              spaceType,
              businessUnit,
            );
            expect(result.am).toBe(0);
            expect(result.pm).toBe(0);
            expect(result.allDay).toBe(0);
          });
        });
      });
    });
  });
});
