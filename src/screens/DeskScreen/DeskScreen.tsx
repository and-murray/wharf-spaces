import React, {useEffect, useState} from 'react';
import {Platform, StyleSheet} from 'react-native';
import {useAppDispatch, useAppSelector} from '@state/utils/hooks';
import {KeyboardAvoidingView, ScrollView, Text, VStack} from 'native-base';
import {DeskCalendar, AvailableSpaces, EventViewer, WhosIn} from '@organisms';
import {
  getBookingsOnTheDate,
  getUsersBookedDays,
  getUsers,
} from '@firebase/firestore';
import dayjs from 'dayjs';
import {
  formatToBookingDateUTC,
  isValidParkingDate,
} from '@utils/DateTimeUtils/DateTimeUtils';
import {Booking, ReducedUserData} from '@customTypes';
import {SpaceType} from '@customTypes/booking';
import {setLoading} from '@state/reducers/LoadingSlice';
import {setActiveBookingDates} from '@state/reducers/UserSlice';
import subscribeToNotesCollection from '@firebase/firestore/subscribeToNotesCollection';
import SegmentedControl from '@react-native-segmented-control/segmented-control';
import {storeSelectedSpaceType} from '@state/reducers/selectedDayOptionsSlice';
import {calculateNewUserIds} from '@utils/FirebaseUtils/FirebaseUtils';
import Animated, {Layout} from 'react-native-reanimated';
import {fetchLondonTime} from '@state/reducers/UtilsSlice';
import {LongButton} from '@root/src/components/atoms';

export default function DeskScreen() {
  const dispatch = useAppDispatch();
  const [deskBookings, setDeskBookings] = useState<Booking[]>([]);
  const [isValidBookingDate, setIsValidBookingDate] = useState<boolean>(false);
  const [carBookings, setCarBookings] = useState<Booking[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [userData, setUserData] = useState<ReducedUserData>({});
  const selectedDay = useAppSelector(
    state => state.selectedDayOptions.selectedDay,
  );
  const user = useAppSelector(state => state.user.user);
  const {londonServerTimestamp, storedDeviceTimestamp} = useAppSelector(
    state => state.utils,
  );
  const userId = user ? user.id : null;
  const styles = StyleSheet.create({
    segmentStyle: {
      flex: 1,
      height: 50,
      marginHorizontal: 16,
    },
  });

  useEffect(() => {
    if (selectedDay === '') {
      return;
    }
    dispatch(setLoading(true));

    const selectedDate = formatToBookingDateUTC(dayjs(selectedDay), false);
    const unsubscribeFromBookings = getBookingsOnTheDate(
      selectedDate,
      bookings => {
        const carBookingsOnDate = bookings.filter(
          booking => booking.spaceType === SpaceType.car,
        );
        const deskBookingsOnDate = bookings.filter(
          booking => booking.spaceType === SpaceType.desk,
        );
        setCarBookings(carBookingsOnDate);
        setDeskBookings(deskBookingsOnDate);
        dispatch(setLoading(false));
      },
    );
    const unsubscribeFromNotes = subscribeToNotesCollection(
      selectedDay,
      dispatch,
    );
    return () => {
      unsubscribeFromBookings();
      unsubscribeFromNotes();
    };
  }, [dispatch, selectedDay]);

  useEffect(() => {
    const unsubscriber = getUsersBookedDays(user?.id ?? '', activeBooking => {
      dispatch(setActiveBookingDates(activeBooking));
    });
    return () => unsubscriber();
  }, [dispatch, user]);

  function indexChanged(index: number) {
    setSelectedIndex(index);
    if (index === 0) {
      dispatch(storeSelectedSpaceType(SpaceType.desk));
    } else {
      dispatch(storeSelectedSpaceType(SpaceType.car));
      dispatch(fetchLondonTime());
    }
  }

  function refreshPressed() {
    dispatch(fetchLondonTime());
  }
  useEffect(() => {
    async function getUserDataForBookings() {
      const bookings = selectedIndex === 0 ? deskBookings : carBookings;
      // Only pull data we don't already have
      const idsToFetch = calculateNewUserIds(bookings, userData);
      if (idsToFetch.length === 0) {
        return;
      }
      const newUserData = await getUsers(idsToFetch);
      setUserData(prevState => Object.assign({}, prevState, newUserData));
    }
    getUserDataForBookings();
    // Don't want to depend on userData otherwise it'll loop
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [carBookings, deskBookings, selectedIndex]);

  useEffect(() => {
    if (selectedIndex === 0) {
      setIsValidBookingDate(true);
    } else if (selectedIndex === 1) {
      if (
        londonServerTimestamp === undefined ||
        storedDeviceTimestamp === undefined
      ) {
        dispatch(fetchLondonTime());
        setIsValidBookingDate(false);
        return;
      }
      setIsValidBookingDate(
        isValidParkingDate(
          dayjs(londonServerTimestamp),
          dayjs(storedDeviceTimestamp),
          dayjs(),
          dayjs(selectedDay),
        ),
      );
    }
  }, [
    dispatch,
    selectedDay,
    selectedIndex,
    londonServerTimestamp,
    storedDeviceTimestamp,
  ]);

  const dateAvailableToBookFrom = (): string => {
    const bookingDate = dayjs(selectedDay);
    const availableDate = bookingDate.subtract(7, 'day').format('DD MMM');
    return `Parking Spaces for this date are not available to book yet. Please try again after Midday on ${availableDate}.`;
  };

  return (
    <>
      {userId && (
        <KeyboardAvoidingView
          flex={1}
          backgroundColor="brand.white"
          paddingTop={4}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView keyboardShouldPersistTaps="handled">
            <VStack space="24px" marginBottom={10}>
              <DeskCalendar />
              <EventViewer />
              <SegmentedControl
                style={styles.segmentStyle}
                appearance="light"
                values={['Desk', 'Parking']}
                selectedIndex={selectedIndex}
                onChange={event => {
                  indexChanged(event.nativeEvent.selectedSegmentIndex);
                }}
              />
              {isValidBookingDate ? (
                <>
                  <Animated.View layout={Layout}>
                    <AvailableSpaces
                      bookings={
                        selectedIndex === 0 ? deskBookings : carBookings
                      }
                      userData={userData}
                    />
                  </Animated.View>
                  <Animated.View layout={Layout}>
                    <WhosIn
                      bookings={
                        selectedIndex === 0 ? deskBookings : carBookings
                      }
                      userData={userData}
                    />
                  </Animated.View>
                </>
              ) : (
                <VStack
                  paddingLeft={4}
                  paddingRight={4}
                  justifyContent="center">
                  <Text
                    alignSelf="center"
                    color="brand.charcoal"
                    fontFamily={'body'}
                    fontWeight={400}
                    fontSize={16}>
                    {dateAvailableToBookFrom()}
                  </Text>
                  <VStack paddingTop={4} paddingLeft={6} paddingRight={6}>
                    <LongButton
                      buttonText={'Refresh'}
                      onPress={() => refreshPressed()}
                      isDisabled={false}
                    />
                  </VStack>
                </VStack>
              )}
            </VStack>
          </ScrollView>
        </KeyboardAvoidingView>
      )}
      {!userId && (
        <VStack height="100%" justifyContent="center">
          <Text alignSelf="center">
            Something went wrong. Try signing in again.
          </Text>
        </VStack>
      )}
    </>
  );
}
