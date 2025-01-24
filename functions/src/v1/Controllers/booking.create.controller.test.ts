import type {Request, Response} from 'express';
import createNewBookings from './booking.create.controller';
import * as firebaseAdminService from '../Services/FirebaseAdminService/firebaseAdminService';
import * as checkBookingCapacity from '../Services/DeskCapacity/checkBookingCapacity';
import * as bookingUtils from '../utils/BookingUtils/BookingUtils';
import {TimeSlot, User} from '../Models/booking.model';
import {Timestamp} from 'firebase-admin/firestore';
import * as isCorrectFunction from '../utils/IsCorrectFunction';

const mockUser: User = {
  id: 'testUid',
  firstName: 'Test',
  lastName: 'User',
  email: 'test@example.com',
  profilePicUrl: 'https://example.com/test-photo.jpg',
  role: 'user',
  businessUnit: 'murray',
  createdAt: new Timestamp(0, 0),
  updatedAt: new Timestamp(0, 0),
};

const isCorrectFunctionSpy = jest.spyOn(isCorrectFunction, 'isCorrectFunction');
const checkDatesBeingBookedSpy = jest.spyOn(
  bookingUtils,
  'checkDatesBeingBooked',
);
const checkSpaceTypeBeingBookedSpy = jest.spyOn(
  bookingUtils,
  'checkSpaceTypeBeingBooked',
);
const isValidCarBookingDateSpy = jest.spyOn(
  bookingUtils,
  'isValidCarBookingDate',
);
const sendToBookingsSpy = jest.spyOn(firebaseAdminService, 'sendToBookings');
let getFirestoreUserSpy = jest.spyOn(firebaseAdminService, 'getFirestoreUser');
let mockBookingCapacity = jest.spyOn(
  checkBookingCapacity,
  'checkBookingCapacity',
);
jest.mock('uuid', () => ({v4: () => '1'}));

describe('Create Booking controller ', () => {
  const mockStatus = jest.fn().mockImplementation(() => ({
    send: mockSend,
  }));
  const mockSend = jest.fn();
  const mockResponse = {
    status: mockStatus,
  } as unknown as Response<any>;

  let mockRequest: Request;
  beforeEach(() => {
    jest.clearAllMocks();
    mockRequest = {
      body: [],
    } as Request;
    checkDatesBeingBookedSpy.mockReturnValue(['2023-05-11T00:00:00Z']);
    checkSpaceTypeBeingBookedSpy.mockReturnValue(['desk']);
    isCorrectFunctionSpy.mockReturnValue(true);
    isValidCarBookingDateSpy.mockReturnValue(true);
    sendToBookingsSpy.mockReturnValue();
    getFirestoreUserSpy.mockResolvedValue(mockUser);
    mockBookingCapacity.mockResolvedValue({am: 36, pm: 36, allDay: 36});
  });
  afterAll(() => {
    jest.clearAllMocks();
  });

  describe('when passed an invalid request ', () => {
    it('should return 400', async () => {
      const emptyBookingObj = {};
      mockRequest.body = emptyBookingObj;
      await createNewBookings(mockRequest, mockResponse);
      expect(mockResponse.status).toBeCalledWith(400);
    });

    it('should return 403 when car booking and invalid booking date', async () => {
      mockRequest.body = mockRequest.body = {
        bookings: [
          {
            userId: '123',
            date: '2023-05-11T00:00:00Z',
            timeSlot: TimeSlot.Enum.am,
            bookingType: 'personal',
            spaceType: 'car',
          },
        ],
      };
      checkSpaceTypeBeingBookedSpy.mockReturnValue(['car']);
      isValidCarBookingDateSpy.mockReturnValue(false);
      await createNewBookings(mockRequest, mockResponse);
      expect(mockResponse.status).toBeCalledWith(403);
    });
  });

  describe('when a booking is made', () => {
    const testCases = [
      {
        timeSlot: 'allDay',
        currentCapacity: {am: 1, pm: 1, allDay: 1},
        expectedCapacity: {am: 0, pm: 0, allDay: 0},
      },
      {
        timeSlot: 'am',
        currentCapacity: {am: 1, pm: 2, allDay: 1},
        expectedCapacity: {am: 0, pm: 2, allDay: 0},
      },
      {
        timeSlot: 'am',
        currentCapacity: {am: 2, pm: 1, allDay: 1},
        expectedCapacity: {am: 1, pm: 1, allDay: 1},
      },
      {
        timeSlot: 'pm',
        currentCapacity: {am: 2, pm: 3, allDay: 2},
        expectedCapacity: {am: 2, pm: 2, allDay: 2},
      },
      {
        timeSlot: 'pm',
        currentCapacity: {am: 2, pm: 1, allDay: 1},
        expectedCapacity: {am: 2, pm: 0, allDay: 0},
      },
      {
        timeSlot: 'allDay',
        currentCapacity: {am: -1, pm: -1, allDay: -1},
        expectedCapacity: {am: -2, pm: -2, allDay: -2},
      },
      {
        timeSlot: 'allDay',
        currentCapacity: {am: -1, pm: 1, allDay: -1},
        expectedCapacity: {am: -2, pm: 0, allDay: -2},
      },
      {
        timeSlot: 'am',
        currentCapacity: {am: 1, pm: -2, allDay: -2},
        expectedCapacity: {am: 0, pm: -2, allDay: -2},
      },
      {
        timeSlot: 'am',
        currentCapacity: {am: -2, pm: -1, allDay: -2},
        expectedCapacity: {am: -3, pm: -1, allDay: -3},
      },
      {
        timeSlot: 'pm',
        currentCapacity: {am: -1, pm: 2, allDay: -1},
        expectedCapacity: {am: -1, pm: 1, allDay: -1},
      },
      {
        timeSlot: 'pm',
        currentCapacity: {am: -2, pm: -1, allDay: -2},
        expectedCapacity: {am: -2, pm: -2, allDay: -2},
      },
    ];
    const testCasesForIsReserved = [
      {
        timeSlot: 'allDay',
        currentCapacity: {am: 1, pm: 1, allDay: 1},
        isReserved: false,
      },
      {
        timeSlot: 'am',
        currentCapacity: {am: 1, pm: 2, allDay: 1},
        isReserved: false,
      },
      {
        timeSlot: 'am',
        currentCapacity: {am: 2, pm: 1, allDay: 1},
        isReserved: false,
      },
      {
        timeSlot: 'pm',
        currentCapacity: {am: 2, pm: 3, allDay: 2},
        isReserved: false,
      },
      {
        timeSlot: 'pm',
        currentCapacity: {am: 2, pm: 1, allDay: 1},
        isReserved: false,
      },
      {
        timeSlot: 'allDay',
        currentCapacity: {am: -1, pm: -1, allDay: -1},
        isReserved: true,
      },
      {
        timeSlot: 'allDay',
        currentCapacity: {am: -1, pm: 1, allDay: -1},
        isReserved: true,
      },
      {
        timeSlot: 'am',
        currentCapacity: {am: 1, pm: -2, allDay: -2},
        isReserved: false,
      },
      {
        timeSlot: 'am',
        currentCapacity: {am: -2, pm: -1, allDay: -2},
        isReserved: true,
      },
      {
        timeSlot: 'pm',
        currentCapacity: {am: -1, pm: 2, allDay: -1},
        isReserved: false,
      },
      {
        timeSlot: 'pm',
        currentCapacity: {am: -2, pm: 0, allDay: -2},
        isReserved: true,
      },
    ];
    it.each(testCases)(
      'should update the remaining capacity from $currentCapacity to $expectedCapacity for $timeSlot booking correctly',
      async ({timeSlot, currentCapacity, expectedCapacity}) => {
        // currentCapacity is passed by reference
        mockBookingCapacity.mockResolvedValue(currentCapacity);
        mockRequest.body = {
          bookings: [
            {
              userId: '123',
              date: '2023-05-11T00:00:00Z',
              timeSlot: timeSlot,
              bookingType: 'personal',
              spaceType: 'desk',
            },
          ],
        };
        await createNewBookings(mockRequest, mockResponse);
        expect(mockResponse.status).toBeCalledWith(201);
        expect(currentCapacity).toEqual(expectedCapacity);
      },
    );
    it.each(testCasesForIsReserved)(
      'should set isReserved to $isReserved based on your $currentCapacity and the $timeSlot you selected',
      async ({timeSlot, currentCapacity, isReserved}) => {
        mockBookingCapacity.mockResolvedValue(currentCapacity);
        mockRequest.body = {
          bookings: [
            {
              userId: '123',
              date: '2023-05-11T00:00:00Z',
              timeSlot: timeSlot,
              bookingType: 'personal',
              spaceType: 'desk',
            },
          ],
        };

        await createNewBookings(mockRequest, mockResponse);
        expect(mockResponse.status).toBeCalledWith(201);
        expect(sendToBookingsSpy).toBeCalledWith([
          {
            bookingType: 'personal',
            createdAt: {},
            date: '2023-05-11T00:00:00Z',
            id: '1',
            isReserveSpace: isReserved,
            spaceType: 'desk',
            timeSlot: timeSlot,
            updatedAt: {},
            userId: '123',
          },
        ]);
      },
    );
  });

  describe('when a demo account requests a booking', () => {
    beforeEach(() => {
      const demoUser: User = {
        id: 'testUid',
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        profilePicUrl: 'https://example.com/test-photo.jpg',
        role: 'demo',
        businessUnit: 'murray',
        createdAt: new Timestamp(0, 0),
        updatedAt: new Timestamp(0, 0),
      };
      getFirestoreUserSpy.mockResolvedValue(demoUser);
    });
    it('should return a 403', async () => {
      mockRequest.body = {
        bookings: [
          {
            userId: '123',
            date: '2023-05-11T00:00:00Z',
            timeSlot: 'am',
            bookingType: 'personal',
            spaceType: 'desk',
          },
        ],
      };
      await createNewBookings(mockRequest, mockResponse);
      expect(mockResponse.status).toBeCalledWith(403);
    });
  });

  describe('when booking a guest car spot', () => {
    beforeEach(() => {
      mockRequest.body = {
        bookings: [
          {
            userId: '123',
            date: '2023-05-11T00:00:00Z',
            timeSlot: 'am',
            bookingType: 'guest',
            spaceType: 'car',
          },
        ],
      };
    });
    describe('when an admin tries to book', () => {
      beforeEach(() => {
        const adminUser: User = {
          id: 'testUid',
          firstName: 'Test',
          lastName: 'User',
          email: 'test@example.com',
          profilePicUrl: 'https://example.com/test-photo.jpg',
          role: 'admin',
          businessUnit: 'murray',
          createdAt: new Timestamp(0, 0),
          updatedAt: new Timestamp(0, 0),
        };
        getFirestoreUserSpy.mockResolvedValue(adminUser);
      });

      it('should succeed given it is valid', async () => {
        await createNewBookings(mockRequest, mockResponse);
        expect(mockResponse.status).toBeCalledWith(201);
      });
    });

    describe('when a none admin tries to book', () => {
      beforeEach(() => {
        getFirestoreUserSpy.mockResolvedValue(mockUser);
      });

      it('should return a 403', async () => {
        await createNewBookings(mockRequest, mockResponse);
        expect(mockResponse.status).toBeCalledWith(403);
      });
    });
  });

  describe('when booking a guest desk spot', () => {
    beforeEach(() => {
      mockRequest.body = {
        bookings: [
          {
            userId: '123',
            date: '2023-05-11T00:00:00Z',
            timeSlot: 'am',
            bookingType: 'guest',
            spaceType: 'desk',
          },
        ],
      };
    });
    describe('when an admin tries to book', () => {
      beforeEach(() => {
        const adminUser: User = {
          id: 'testUid',
          firstName: 'Test',
          lastName: 'User',
          email: 'test@example.com',
          profilePicUrl: 'https://example.com/test-photo.jpg',
          role: 'admin',
          businessUnit: 'murray',
          createdAt: new Timestamp(0, 0),
          updatedAt: new Timestamp(0, 0),
        };
        getFirestoreUserSpy.mockResolvedValue(adminUser);
      });

      it('should succeed given it is valid', async () => {
        await createNewBookings(mockRequest, mockResponse);
        expect(mockResponse.status).toBeCalledWith(201);
      });
    });

    describe('when a none admin tries to book', () => {
      beforeEach(() => {
        getFirestoreUserSpy.mockResolvedValue(mockUser);
      });

      it('should succeed given it is valid', async () => {
        await createNewBookings(mockRequest, mockResponse);
        expect(mockResponse.status).toBeCalledWith(201);
      });
    });
  });
  describe('when an invalid account is returned', () => {
    beforeEach(() => {
      getFirestoreUserSpy.mockRejectedValue(new Error());
    });
    it('should return a 400', async () => {
      mockRequest.body = {
        bookings: [
          {
            userId: '123',
            date: '2023-05-11T00:00:00Z',
            timeSlot: 'am',
            bookingType: 'personal',
            spaceType: 'desk',
          },
        ],
      };
      await createNewBookings(mockRequest, mockResponse);
      expect(mockResponse.status).toBeCalledWith(400);
    });
  });

  describe('when passed a valid request ', () => {
    describe('and a single booking is being made ', () => {
      describe(' and there being capacity ', () => {
        beforeEach(() => {
          mockBookingCapacity.mockResolvedValue({am: 1, pm: 2, allDay: 3});
        });
        it('should return 201 and call sendToBooking with correct params and isReserveSpace false', async () => {
          mockRequest.body = {
            bookings: [
              {
                userId: '123',
                date: '2023-05-11T00:00:00Z',
                timeSlot: 'am',
                bookingType: 'personal',
                spaceType: 'desk',
              },
            ],
          };
          await createNewBookings(mockRequest, mockResponse);
          expect(mockResponse.status).toBeCalledWith(201);
          expect(sendToBookingsSpy).toBeCalledWith([
            {
              bookingType: 'personal',
              createdAt: {},
              date: '2023-05-11T00:00:00Z',
              id: '1',
              isReserveSpace: false,
              spaceType: 'desk',
              timeSlot: 'am',
              updatedAt: {},
              userId: '123',
            },
          ]);
        });
      });
      describe(' and there being no capacity ', () => {
        beforeEach(() => {
          mockBookingCapacity.mockResolvedValue({am: 0, pm: 2, allDay: 3});
        });
        it('should return 201 and call sendToBooking with correct params and isReserveSpace true', async () => {
          mockRequest.body = {
            bookings: [
              {
                userId: '123',
                date: '2023-05-11T00:00:00Z',
                timeSlot: 'am',
                bookingType: 'personal',
                spaceType: 'desk',
              },
            ],
          };
          await createNewBookings(mockRequest, mockResponse);
          expect(mockResponse.status).toBeCalledWith(201);
          expect(sendToBookingsSpy).toBeCalledWith([
            {
              bookingType: 'personal',
              createdAt: {},
              date: '2023-05-11T00:00:00Z',
              id: '1',
              isReserveSpace: true,
              spaceType: 'desk',
              timeSlot: 'am',
              updatedAt: {},
              userId: '123',
            },
          ]);
        });
      });
    });

    describe('and multiple bookings are being made ', () => {
      describe('with both bookings being on alternate days', () => {
        it('returns an error', async () => {
          mockRequest.body = {
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
          checkDatesBeingBookedSpy.mockReturnValue([
            '2023-05-11T00:00:00Z',
            '2023-05-12T00:00:00Z',
          ]);
          await createNewBookings(mockRequest, mockResponse);
          expect(mockResponse.status).toBeCalledWith(400);
        });
      });

      describe('with both bookings having different space types', () => {
        it('returns an error', async () => {
          mockRequest.body = {
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
          checkSpaceTypeBeingBookedSpy.mockReturnValue(['desk', 'car']);
          await createNewBookings(mockRequest, mockResponse);
          expect(mockResponse.status).toBeCalledWith(400);
        });
      });

      describe('with both bookings on the same day and the same space type', () => {
        describe('and has no capacity ', () => {
          beforeEach(() => {
            mockBookingCapacity.mockResolvedValue({am: 0, pm: 2, allDay: 3});
          });
          it('returns a 201 and passes correct params with both isReserveSpace being true', async () => {
            mockRequest.body = {
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
            await createNewBookings(mockRequest, mockResponse);
            expect(mockResponse.status).toBeCalledWith(201);
            expect(sendToBookingsSpy).toBeCalledWith([
              {
                bookingType: 'personal',
                createdAt: {},
                date: '2023-05-11T00:00:00Z',
                id: '1',
                isReserveSpace: true,
                spaceType: 'desk',
                timeSlot: 'am',
                updatedAt: {},
                userId: '123',
              },
              {
                bookingType: 'personal',
                createdAt: {},
                date: '2023-05-11T00:00:00Z',
                id: '1',
                isReserveSpace: true,
                spaceType: 'desk',
                timeSlot: 'am',
                updatedAt: {},
                userId: '123',
              },
            ]);
          });
        });

        describe('and has capacity for only 1 of the bookings ', () => {
          beforeEach(() => {
            mockBookingCapacity.mockResolvedValue({am: 1, pm: 2, allDay: 3});
          });
          it('returns a 201 and passes correct params with isReserveSpace being false and then true', async () => {
            mockRequest.body = {
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
            await createNewBookings(mockRequest, mockResponse);
            expect(mockResponse.status).toBeCalledWith(201);
            expect(sendToBookingsSpy).toBeCalledWith([
              {
                bookingType: 'personal',
                createdAt: {},
                date: '2023-05-11T00:00:00Z',
                id: '1',
                isReserveSpace: false,
                spaceType: 'desk',
                timeSlot: 'am',
                updatedAt: {},
                userId: '123',
              },
              {
                bookingType: 'personal',
                createdAt: {},
                date: '2023-05-11T00:00:00Z',
                id: '1',
                isReserveSpace: true,
                spaceType: 'desk',
                timeSlot: 'am',
                updatedAt: {},
                userId: '123',
              },
            ]);
          });
        });
      });
    });
  });
});
