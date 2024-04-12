import {AvailableSpacesOption, TimeSlot} from '@customTypes';
import {determineWarningProps, checkAlternateAmOrPmFree} from './viewHelper';
import {WarningSymbolIcon} from '@atoms/Warning/WarningSymbol/WarningSymbol';
import {SpaceType} from '@customTypes/booking';

describe('Determine Warning Props Tests', () => {
  describe('Desk Warning Props', () => {
    describe('booking an allDay slot', () => {
      const testOptions: AvailableSpacesOption[] = [
        {
          id: 1,
          heading: 'All Day',
          spaceLeft: 0,
          timeSlot: TimeSlot.allDay,
          isSelected: true,
          isBooked: false,
        },
        {
          id: 2,
          heading: 'Morning',
          spaceLeft: 0,
          timeSlot: TimeSlot.am,
          isSelected: false,
          isBooked: false,
        },
        {
          id: 3,
          heading: 'Afternoon',
          spaceLeft: 5,
          timeSlot: TimeSlot.pm,
          isSelected: false,
          isBooked: false,
        },
      ];
      it('returns correct props when user is not booked', () => {
        const testResult = determineWarningProps(
          SpaceType.desk,
          false,
          false,
          testOptions,
        );

        expect(testResult.warningMessage).toBe(
          'Sorry, there are no more designated desk spaces available on this day, but you can book a communal space.',
        );
        expect(testResult.symbolToUse).toBe(WarningSymbolIcon.warningTriangle);
        expect(testResult.backgroundColor).toBe('other.orangeTransparent');
      });

      it('returns correct props when user has a standard booked space', () => {
        const testResult = determineWarningProps(
          SpaceType.desk,
          true,
          false,
          testOptions,
        );

        expect(testResult.warningMessage).toBe(
          'You have already booked a desk space for this day. Feel free to cancel it, if not needed anymore.',
        );
        expect(testResult.symbolToUse).toBe(WarningSymbolIcon.infoCircle);
        expect(testResult.backgroundColor).toBe('other.blueTransparent');
      });

      it('returns correct props when user has a reserve booked space', () => {
        const testResult = determineWarningProps(
          SpaceType.desk,
          true,
          true,
          testOptions,
        );

        expect(testResult.warningMessage).toBe(
          'You have booked a communal space. Please try not to occupy any designated desk of the clubhouse as they are already booked by others.',
        );
        expect(testResult.symbolToUse).toBe(WarningSymbolIcon.infoCircle);
        expect(testResult.backgroundColor).toBe('other.blueTransparent');
      });
    });

    describe('Booking a non allDay slot', () => {
      const testOptions: AvailableSpacesOption[] = [
        {
          id: 1,
          heading: 'All Day',
          spaceLeft: 0,
          timeSlot: TimeSlot.allDay,
          isSelected: false,
          isBooked: false,
        },
        {
          id: 2,
          heading: 'Morning',
          spaceLeft: 0,
          timeSlot: TimeSlot.am,
          isSelected: true,
          isBooked: false,
        },
        {
          id: 3,
          heading: 'Afternoon',
          spaceLeft: 5,
          timeSlot: TimeSlot.pm,
          isSelected: false,
          isBooked: false,
        },
      ];
      it('returns correct props when user has am or pm selected space with the alternate being available', () => {
        const testResult = determineWarningProps(
          SpaceType.desk,
          false,
          true,
          testOptions,
        );

        expect(testResult.warningMessage).toBe(
          'Sorry, there are no more designated desk spaces available for this slot, but you can book a communal space.',
        );
        expect(testResult.symbolToUse).toBe(WarningSymbolIcon.warningTriangle);
        expect(testResult.backgroundColor).toBe('other.orangeTransparent');
      });
    });
  });

  describe('Parking Warning Props', () => {
    describe('booking an allDay slot', () => {
      const testOptions: AvailableSpacesOption[] = [
        {
          id: 1,
          heading: 'All Day',
          spaceLeft: 0,
          timeSlot: TimeSlot.allDay,
          isSelected: true,
          isBooked: false,
        },
        {
          id: 2,
          heading: 'Morning',
          spaceLeft: 0,
          timeSlot: TimeSlot.am,
          isSelected: false,
          isBooked: false,
        },
        {
          id: 3,
          heading: 'Afternoon',
          spaceLeft: 5,
          timeSlot: TimeSlot.pm,
          isSelected: false,
          isBooked: false,
        },
      ];
      it('returns correct props when user is not booked', () => {
        const testResult = determineWarningProps(
          SpaceType.car,
          false,
          false,
          testOptions,
        );

        expect(testResult.warningMessage).toBe(
          'Sorry, there are no spaces available at this time. However, you can book onto the waiting list.',
        );
        expect(testResult.symbolToUse).toBe(WarningSymbolIcon.infoCircle);
        expect(testResult.backgroundColor).toBe('other.orangeTransparent');
      });

      it('returns correct props when user has a reserve booked space', () => {
        const testResult = determineWarningProps(
          SpaceType.car,
          true,
          true,
          testOptions,
        );

        expect(testResult.warningMessage).toBe(
          "You're booked onto the waiting list. Keep an eye on your booking as you may be automatically given a space if there are cancelations.",
        );
        expect(testResult.symbolToUse).toBe(WarningSymbolIcon.infoCircle);
        expect(testResult.backgroundColor).toBe('other.blueTransparent');
      });
    });

    describe('Booking a non allDay slot', () => {
      const testOptions: AvailableSpacesOption[] = [
        {
          id: 1,
          heading: 'All Day',
          spaceLeft: 0,
          timeSlot: TimeSlot.allDay,
          isSelected: false,
          isBooked: false,
        },
        {
          id: 2,
          heading: 'Morning',
          spaceLeft: 0,
          timeSlot: TimeSlot.am,
          isSelected: true,
          isBooked: false,
        },
        {
          id: 3,
          heading: 'Afternoon',
          spaceLeft: 5,
          timeSlot: TimeSlot.pm,
          isSelected: false,
          isBooked: false,
        },
      ];
      it('returns correct props when user has am or pm selected space with the alternate being available', () => {
        const testResult = determineWarningProps(
          SpaceType.car,
          false,
          true,
          testOptions,
        );

        expect(testResult.warningMessage).toBe(
          'Sorry, there are no spaces available at this time. However, you can book onto the waiting list.',
        );
        expect(testResult.symbolToUse).toBe(WarningSymbolIcon.infoCircle);
        expect(testResult.backgroundColor).toBe('other.orangeTransparent');
      });
    });
  });
});

describe('Check Alternate Am Or Pm Free method', () => {
  describe('when all day is selected', () => {
    const testOptionsAllDay: AvailableSpacesOption[] = [
      {
        id: 1,
        heading: 'All Day',
        spaceLeft: 0,
        timeSlot: TimeSlot.allDay,
        isSelected: true,
        isBooked: false,
      },
      {
        id: 2,
        heading: 'Morning',
        spaceLeft: 36,
        timeSlot: TimeSlot.am,
        isSelected: false,
        isBooked: false,
      },
      {
        id: 3,
        heading: 'Afternoon',
        spaceLeft: 36,
        timeSlot: TimeSlot.pm,
        isSelected: false,
        isBooked: false,
      },
    ];
    it('returns false', () => {
      const testResult = checkAlternateAmOrPmFree(testOptionsAllDay);

      expect(testResult).toBe(false);
    });
  });
  describe('when a timeslot not All Day is selected', () => {
    describe('And the alternate time slot has no free slots', () => {
      const testOptionsNoAltSlots: AvailableSpacesOption[] = [
        {
          id: 1,
          heading: 'All Day',
          spaceLeft: 0,
          timeSlot: TimeSlot.allDay,
          isSelected: true,
          isBooked: false,
        },
        {
          id: 2,
          heading: 'Morning',
          spaceLeft: 0,
          timeSlot: TimeSlot.am,
          isSelected: false,
          isBooked: false,
        },
        {
          id: 3,
          heading: 'Afternoon',
          spaceLeft: 5,
          timeSlot: TimeSlot.pm,
          isSelected: false,
          isBooked: false,
        },
      ];

      describe('for a desk booking', () => {
        it('returns correct props when user is not booked', () => {
          const testResult = determineWarningProps(
            SpaceType.desk,
            false,
            false,
            testOptionsNoAltSlots,
          );

          expect(testResult.warningMessage).toBe(
            'Sorry, there are no more designated desk spaces available on this day, but you can book a communal space.',
          );
          expect(testResult.symbolToUse).toBe(
            WarningSymbolIcon.warningTriangle,
          );
          expect(testResult.backgroundColor).toBe('other.orangeTransparent');
        });

        it('returns correct props when user has a standard booked space', () => {
          const testResult = determineWarningProps(
            SpaceType.desk,
            true,
            false,
            testOptionsNoAltSlots,
          );

          expect(testResult.warningMessage).toBe(
            'You have already booked a desk space for this day. Feel free to cancel it, if not needed anymore.',
          );
          expect(testResult.symbolToUse).toBe(WarningSymbolIcon.infoCircle);
          expect(testResult.backgroundColor).toBe('other.blueTransparent');
        });

        it('returns correct props when user has a reserve booked space', () => {
          const testResult = determineWarningProps(
            SpaceType.desk,
            true,
            true,
            testOptionsNoAltSlots,
          );

          expect(testResult.warningMessage).toBe(
            'You have booked a communal space. Please try not to occupy any designated desk of the clubhouse as they are already booked by others.',
          );
          expect(testResult.symbolToUse).toBe(WarningSymbolIcon.infoCircle);
          expect(testResult.backgroundColor).toBe('other.blueTransparent');
        });
      });

      describe('for a car booking', () => {
        it('returns correct props when user is not booked', () => {
          const testResult = determineWarningProps(
            SpaceType.car,
            false,
            false,
            testOptionsNoAltSlots,
          );

          expect(testResult.warningMessage).toBe(
            'Sorry, there are no spaces available at this time. However, you can book onto the waiting list.',
          );
          expect(testResult.symbolToUse).toBe(WarningSymbolIcon.infoCircle);
          expect(testResult.backgroundColor).toBe('other.orangeTransparent');
        });

        it('returns correct props when user has a standard booked space', () => {
          const testResult = determineWarningProps(
            SpaceType.car,
            true,
            false,
            testOptionsNoAltSlots,
          );

          expect(testResult.warningMessage).toBe(
            'Sorry, there are no spaces available at this time. However, you can book onto the waiting list.',
          );
          expect(testResult.symbolToUse).toBe(WarningSymbolIcon.infoCircle);
          expect(testResult.backgroundColor).toBe('other.orangeTransparent');
        });

        it('returns correct props when user has a reserve booked space', () => {
          const testResult = determineWarningProps(
            SpaceType.car,
            true,
            true,
            testOptionsNoAltSlots,
          );

          expect(testResult.warningMessage).toBe(
            "You're booked onto the waiting list. Keep an eye on your booking as you may be automatically given a space if there are cancelations.",
          );
          expect(testResult.symbolToUse).toBe(WarningSymbolIcon.infoCircle);
          expect(testResult.backgroundColor).toBe('other.blueTransparent');
        });
      });
    });

    describe('Booking a non allDay slot', () => {
      const testOptions: AvailableSpacesOption[] = [
        {
          id: 1,
          heading: 'All Day',
          spaceLeft: 0,
          timeSlot: TimeSlot.allDay,
          isSelected: false,
          isBooked: false,
        },
        {
          id: 2,
          heading: 'Morning',
          spaceLeft: 0,
          timeSlot: TimeSlot.am,
          isSelected: true,
          isBooked: false,
        },
        {
          id: 3,
          heading: 'Afternoon',
          spaceLeft: 5,
          timeSlot: TimeSlot.pm,
          isSelected: false,
          isBooked: false,
        },
      ];
      describe('for a desk booking', () => {
        it('returns correct props when user has am or pm selected space with the alternate being available', () => {
          const testResult = determineWarningProps(
            SpaceType.desk,
            false,
            true,
            testOptions,
          );

          expect(testResult.warningMessage).toBe(
            'Sorry, there are no more designated desk spaces available for this slot, but you can book a communal space.',
          );
          expect(testResult.symbolToUse).toBe(
            WarningSymbolIcon.warningTriangle,
          );
          expect(testResult.backgroundColor).toBe('other.orangeTransparent');
        });
      });

      describe('for a car booking', () => {
        it('returns correct props when user has am or pm selected space with the alternate being available', () => {
          const testResult = determineWarningProps(
            SpaceType.car,
            false,
            true,
            testOptions,
          );

          expect(testResult.warningMessage).toBe(
            'Sorry, there are no spaces available at this time. However, you can book onto the waiting list.',
          );
          expect(testResult.symbolToUse).toBe(WarningSymbolIcon.infoCircle);
          expect(testResult.backgroundColor).toBe('other.orangeTransparent');
        });
      });
    });
  });

  describe('Check Alternate Am Or Pm Free method', () => {
    describe('when all day is selected', () => {
      const testOptionsAllDay: AvailableSpacesOption[] = [
        {
          id: 1,
          heading: 'All Day',
          spaceLeft: 0,
          timeSlot: TimeSlot.allDay,
          isSelected: true,
          isBooked: false,
        },
        {
          id: 2,
          heading: 'Morning',
          spaceLeft: 36,
          timeSlot: TimeSlot.am,
          isSelected: false,
          isBooked: false,
        },
        {
          id: 3,
          heading: 'Afternoon',
          spaceLeft: 36,
          timeSlot: TimeSlot.pm,
          isSelected: false,
          isBooked: false,
        },
      ];
      it('returns false', () => {
        const testResult = checkAlternateAmOrPmFree(testOptionsAllDay);

        expect(testResult).toBe(false);
      });
    });
    describe('when a timeslot not All Day is selected', () => {
      describe('And the alternate time slot has no free slots', () => {
        const testOptionsNoAltSlots: AvailableSpacesOption[] = [
          {
            id: 1,
            heading: 'All Day',
            spaceLeft: 0,
            timeSlot: TimeSlot.allDay,
            isSelected: false,
            isBooked: false,
          },
          {
            id: 2,
            heading: 'Morning',
            spaceLeft: 0,
            timeSlot: TimeSlot.am,
            isSelected: true,
            isBooked: false,
          },
          {
            id: 3,
            heading: 'Afternoon',
            spaceLeft: 0,
            timeSlot: TimeSlot.pm,
            isSelected: false,
            isBooked: false,
          },
        ];
        it('returns false', () => {
          const testResult = checkAlternateAmOrPmFree(testOptionsNoAltSlots);

          expect(testResult).toBe(false);
        });
      });
      describe('And the alternate time slot has free slots', () => {
        const testOptionsFreeAltSlots: AvailableSpacesOption[] = [
          {
            id: 1,
            heading: 'All Day',
            spaceLeft: 0,
            timeSlot: TimeSlot.allDay,
            isSelected: false,
            isBooked: false,
          },
          {
            id: 2,
            heading: 'Morning',
            spaceLeft: 0,
            timeSlot: TimeSlot.am,
            isSelected: true,
            isBooked: false,
          },
          {
            id: 3,
            heading: 'Afternoon',
            spaceLeft: 5,
            timeSlot: TimeSlot.pm,
            isSelected: false,
            isBooked: false,
          },
        ];
        it('returns false', () => {
          const testResult = checkAlternateAmOrPmFree(testOptionsFreeAltSlots);

          expect(testResult).toBe(true);
        });
      });
    });
  });
});
