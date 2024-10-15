import React, {useState, useEffect, useMemo} from 'react';
import {AvailableSpaceView} from '@molecules';
import {VStack} from 'native-base';
import {BookingType, SpaceType} from '@customTypes/booking';
import {
  availableSpacesOptionfactory,
  calculateRemainingSpaces,
} from '@organisms/AvailableSpaces/helper';
import {Booking, ReducedUserData} from '@customTypes';
import Animated, {FadeInUp, FadeOutUp} from 'react-native-reanimated';
import {BusinessUnit, Role} from '@customTypes/user';
import {isCloseToBookingDate} from '@utils/DateTimeUtils/DateTimeUtils';
import dayjs from 'dayjs';
import {useAppSelector} from '@state/utils/hooks';

type AvailableSpacesProps = {
  bookings: Booking[];
  userData: ReducedUserData;
};

const AvailableSpaces = ({bookings, userData}: AvailableSpacesProps) => {
  const [showGuestSpaces, setShowGuestSpaces] = useState<boolean>(false);
  const [canBookGuests, setCanBookGuests] = useState<boolean>(false);

  const [capacity, setCapacity] = useState<number>(0);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [isVisitorEditEnabled, setIsVisitorEditEnabled] = useState(false);
  const toggleDisplayGuestBooking = () => setShowGuestSpaces(!showGuestSpaces);
  let {
    selectedDayOptions: {selectedSpaceType, selectedDay},
    user: {user},
    firebaseRemoteConfig: {deskCapacity, parkingCapacity},
    utils: {londonServerTimestamp, storedDeviceTimestamp},
  } = useAppSelector(state => state);

  const remainingSpaces = calculateRemainingSpaces(filteredBookings, capacity);
  const remainingOptions = availableSpacesOptionfactory(remainingSpaces);

  useEffect(() => {
    function calculateCarSpaceCapacity(
      dateToBook: string,
      businessUnit: BusinessUnit = BusinessUnit.unknown,
    ): number {
      const currentDate = dayjs();
      const bookingDate = dayjs(dateToBook);
      const canBookAnySpace = isCloseToBookingDate(
        dayjs(londonServerTimestamp),
        dayjs(storedDeviceTimestamp),
        currentDate,
        bookingDate,
      );

      let remainingCapacity = 0;
      remainingCapacity = parkingCapacity[businessUnit];

      // override parking capacity for adams before join date
      // if (businessUnit === BusinessUnit.adams) {
      //   remainingCapacity = parkingCapacity.adams;
      // } else

      if (canBookAnySpace && businessUnit !== BusinessUnit.unknown) {
        remainingCapacity =
          parkingCapacity.murray +
          parkingCapacity.tenzing +
          parkingCapacity.adams;
      }

      return remainingCapacity;
    }

    function calculateRelevantBookings(): Booking[] {
      const currentDate = dayjs();
      const bookingDate = dayjs(selectedDay);
      const canBookAnySpace = isCloseToBookingDate(
        dayjs(londonServerTimestamp),
        dayjs(storedDeviceTimestamp),
        currentDate,
        bookingDate,
      );

      if (canBookAnySpace) {
        return bookings;
      } else {
        return bookings.filter(booking => {
          let bookingUserData = userData[booking.userId];
          let businessUnit = bookingUserData
            ? bookingUserData.businessUnit
            : null;
          if (businessUnit === user?.businessUnit) {
            return booking;
          }
        });
      }
    }

    if (selectedSpaceType === SpaceType.car) {
      setCapacity(calculateCarSpaceCapacity(selectedDay, user?.businessUnit));
      setFilteredBookings(calculateRelevantBookings());
    } else {
      setCapacity(deskCapacity);
      setFilteredBookings(bookings);
    }
  }, [
    selectedSpaceType,
    parkingCapacity,
    selectedDay,
    bookings,
    userData,
    user?.businessUnit,
    deskCapacity,
    londonServerTimestamp,
    storedDeviceTimestamp,
  ]);

  useMemo(() => {
    if (selectedSpaceType === SpaceType.car && user?.role !== Role.admin) {
      setShowGuestSpaces(false);
      setCanBookGuests(false);
    } else {
      setCanBookGuests(true);
    }
    setIsVisitorEditEnabled(
      selectedSpaceType === SpaceType.car && user?.role === Role.admin,
    );
  }, [user, selectedSpaceType]);

  return (
    <VStack marginX={4} space={'24px'} testID="AvailableSpaces">
      <Animated.View entering={FadeInUp} exiting={FadeOutUp}>
        <AvailableSpaceView
          bookingType={BookingType.personal}
          spaceType={selectedSpaceType}
          relevantBookings={bookings.filter(
            booking =>
              booking.userId === user?.id &&
              booking.bookingType === BookingType.personal,
          )}
          showGuestSpaces={showGuestSpaces}
          canBookGuests={canBookGuests}
          toggleDisplayGuestBooking={toggleDisplayGuestBooking}
          capacity={capacity}
          remainingOptions={remainingOptions}
        />
      </Animated.View>
      {showGuestSpaces && (
        <Animated.View entering={FadeInUp} exiting={FadeOutUp}>
          <AvailableSpaceView
            bookingType={BookingType.guest}
            spaceType={selectedSpaceType}
            relevantBookings={bookings.filter(
              booking =>
                booking.userId === user?.id &&
                booking.bookingType === BookingType.guest,
            )}
            showGuestSpaces={showGuestSpaces}
            canBookGuests={canBookGuests}
            toggleDisplayGuestBooking={toggleDisplayGuestBooking}
            capacity={capacity}
            remainingOptions={remainingOptions}
            enableVistorEdit={isVisitorEditEnabled}
          />
        </Animated.View>
      )}
    </VStack>
  );
};

export default AvailableSpaces;
