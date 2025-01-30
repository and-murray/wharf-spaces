import React, {useEffect, useMemo, useState} from 'react';
import {Box, HStack, Pressable, Text, View, VStack} from 'native-base';
import {Counter, DayTimeSelector, Warning} from '@atoms';
import Booking, {BookingType, SpaceType, TimeSlot} from '@customTypes/booking';
import UserProfileSection from '@molecules/UserProfileSection/UserProfileSection';
import BookButton from '@atoms/BookButton/BookButton';
import AvailableSpacesOption from '@customTypes/availability';
import {useAppDispatch, useAppSelector} from '@state/utils/hooks';
import {setLoading} from '@state/reducers/LoadingSlice';
import {
  deleteBookings,
  editBookings,
  postBookings,
} from '@state/reducers/selectedDayOptionsSlice';
import {Cross} from '@res/images/Cross';
import {determineWarningProps} from './viewHelper';
import {GroupIcon} from '@res/images/GroupIcon';
import BoldText from '@atoms/BoldText/BoldText';
import {BusinessUnit} from '@customTypes/user';
import AlertMessage from '@atoms/AlertMessage/AlertMessage';
import SimpleInfoMessage from '@atoms/SimpleInfoIMessage/SimpleInfoMessage';
import MurrayButton from '@atoms/MurrayButton/MurrayButton';
import {LogLevel, logMessage} from '@root/src/util/Logging/Logging';

export type AvailableSpaceViewProps = {
  relevantBookings: Booking[];
  bookingType: BookingType;
  spaceType: SpaceType;
  toggleDisplayGuestBooking: () => void;
  showGuestSpaces: boolean;
  canBookGuests: boolean;
  capacity: number;
  remainingOptions: AvailableSpacesOption[];
  enableVistorEdit?: boolean;
};

const AvailableSpaceView = ({
  relevantBookings,
  bookingType,
  spaceType,
  toggleDisplayGuestBooking,
  showGuestSpaces,
  canBookGuests,
  capacity,
  remainingOptions,
  enableVistorEdit,
}: AvailableSpaceViewProps) => {
  const dispatch = useAppDispatch();
  const [options, setOptions] = useState(remainingOptions);
  const [hasBooked, setHasBooked] = useState(false);
  const [isBookButtonEnabled, setBookButtonEnabled] = useState<boolean>(false);
  const [guestCount, setGuestCount] = useState<number>(1);
  const [isGuestCountValid, setGuestCountValid] = useState<boolean>(true);
  const [isFullSelected, setIsFullSelected] = useState<boolean>(false);
  const [guestSpacesWidth, setGuestSpacesWidth] = useState<number>(0);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [previousSelectedSpaceType, setPreviousSelectedSpaceType] =
    useState<SpaceType>();
  const [isBookingEditable, setIsBookingEditable] = useState(false);
  const [shouldShowEdit, setShouldShowEdit] = useState(false);

  const [isUnknownUserAlertOpen, setisUnknownUserAlertOpen] = useState(false);

  const {selectedDay, selectedSpaceType} = useAppSelector(
    state => state.selectedDayOptions,
  );
  const user = useAppSelector(state => state.user.user);

  useEffect(() => {
    const relevantBookingTimeSlot: TimeSlot | undefined =
      relevantBookings[0]?.timeSlot;

    setHasBooked(relevantBookingTimeSlot ? true : false);

    const newOptions = options.map(option => {
      return {
        ...option,
        isBooked: option.timeSlot === relevantBookingTimeSlot ? true : false,
        isSelected:
          previousSelectedSpaceType === selectedSpaceType
            ? option.isSelected
            : false,
        spaceLeft: remainingOptions.find(
          remainingOption => remainingOption.id === option.id,
        )?.spaceLeft,
      };
    });
    setIsFullSelected(
      newOptions.some(
        option => option.isSelected === true && (option.spaceLeft ?? 1) <= 0,
      ),
    );
    setPreviousSelectedSpaceType(selectedSpaceType);
    setOptions(newOptions);
    // line below disabled as it wants the dependency array to include
    // options - since the useEffect sets options, we don't want this to run
    // every time options changes. This will be optimised in a future
    // ticket.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [relevantBookings, remainingOptions, selectedSpaceType]);

  useEffect(() => {
    setBookButtonEnabled(
      selectedDay &&
        isGuestCountValid &&
        (options.some(option => option.isSelected) || hasBooked)
        ? true
        : false,
    );
    const selectedOption = options.find(option => option.isSelected);
    const editable =
      hasBooked &&
      (bookingType === BookingType.personal || enableVistorEdit === true);
    setIsBookingEditable(editable);
    setShouldShowEdit(editable && selectedOption?.isBooked === false);
  }, [
    hasBooked,
    isGuestCountValid,
    options,
    enableVistorEdit,
    selectedDay,
    bookingType,
  ]);

  const hasCommunalSpace: boolean = useMemo(() => {
    if (hasBooked) {
      // Find all active bookings for current day and check if any of them are
      // communal bookings to determine full warning message
      return relevantBookings.some(
        relevantBooking => relevantBooking.isReserveSpace === true,
      );
    }
    return false;
  }, [hasBooked, relevantBookings]);

  const heading = hasBooked ? 'Selected time:' : 'Select a time';
  const subHeading = 'Booking for someone else?';
  const hasBookedText = shouldShowEdit
    ? 'Change booking?'
    : hasCommunalSpace && spaceType === SpaceType.car
    ? 'You’ve booked onto the waiting list.'
    : "You've Booked!";

  const borderColor = isFullSelected
    ? 'brand.orange'
    : hasBooked
    ? 'other.greenAccent'
    : 'other.grey';

  const backgroundColor = hasBooked
    ? 'other.greenAccentTransparent'
    : 'brand.white';

  const handleAlertClose = () => {
    setIsAlertOpen(false);
  };

  const handleUnkownUserAlertClose = () => {
    setisUnknownUserAlertOpen(false);
  };

  const updateSelectedDuration = (id: number) => {
    if (
      !hasBooked ||
      bookingType === BookingType.personal ||
      enableVistorEdit
    ) {
      const newOptions = options.map(option => {
        return {
          ...option,
          isSelected: option.id === id ? !option.isSelected : false,
        };
      });

      setIsFullSelected(
        newOptions.some(
          option => option.isSelected === true && (option.spaceLeft ?? 1) <= 0,
        ),
      );
      setOptions(newOptions);
    } else {
      setIsFullSelected(false);
    }
  };

  const deleteBookingsFunc = async () => {
    handleAlertClose();
    const bookingsToDelete = relevantBookings.map(booking => booking.id);
    await dispatch(deleteBookings(bookingsToDelete));
  };

  const editBookingsFunc = async () => {
    const newTimeSlot = options.find(option => option.isSelected)?.timeSlot;
    if (!newTimeSlot) {
      console.error(
        'Edit booking can not be performed. A new time slot is not yet selected',
      );
      return;
    }
    const existSameTimeSlot = relevantBookings.some(
      option => option.timeSlot === newTimeSlot,
    );
    if (existSameTimeSlot) {
      const currentTimeSlot = relevantBookings.find(_b => true);
      console.error(
        `Edit booking not performed. Must select different time slot. current: ${currentTimeSlot}, new: ${newTimeSlot}`,
      );
      return;
    }
    const bookingsToEdit = relevantBookings.map(booking => {
      return {bookingId: booking.id, newTimeSlot: newTimeSlot};
    });
    await dispatch(editBookings(bookingsToEdit));
  };

  const editDismissFn = () => {
    const selectedOption = options.some(option => option.isSelected);
    if (selectedOption) {
      setOptions(
        options.map(option => {
          return {...option, isSelected: false};
        }),
      );
      setShouldShowEdit(false);
    }
  };

  const postBookingsFunc = async () => {
    const timeSlot = options.find(option => option.isSelected)?.timeSlot;
    const numberOfBookings =
      bookingType === BookingType.personal ? 1 : guestCount;
    const userId = user?.id;
    if (!timeSlot || !userId) {
      console.error('Undefined args in postBookingsFunc');
      return;
    } else {
      await dispatch(
        postBookings({
          selectedDay,
          userId,
          timeSlot,
          bookingType,
          spaceType,
          numberOfBookings,
        }),
      );
      updateSelectedDuration(-1);
    }
  };

  const handleButtonPress = async <T,>(action: () => Promise<T>) => {
    if (
      user?.businessUnit === BusinessUnit.unknown &&
      spaceType === SpaceType.car
    ) {
      setisUnknownUserAlertOpen(true);
    } else {
      dispatch(setLoading(true));
      try {
        await action();
      } catch (error) {
        logMessage(LogLevel.error, error);
      }
      dispatch(setLoading(false));
    }
  };

  const showWarning = isFullSelected || hasCommunalSpace;
  return (
    <VStack
      importantForAccessibility="no"
      borderRadius="xl"
      padding="16px"
      backgroundColor={backgroundColor}
      borderColor={borderColor}
      borderWidth={1}
      space="24px"
      accessible={false}
      testID="AvailableSpaceView"
      onLayout={event => {
        setGuestSpacesWidth(event.nativeEvent.layout.width);
      }}>
      {showWarning && (
        <Box>
          <Warning
            {...determineWarningProps(
              spaceType,
              hasBooked,
              hasCommunalSpace,
              options,
            )}
          />
        </Box>
      )}

      {bookingType === BookingType.guest && (
        <View flexDirection={'row'} alignItems={'center'}>
          <Text
            color="brand.blue"
            fontFamily={'body'}
            fontWeight={500}
            fontSize={14}
            marginRight={4}>
            {'Book visitor spaces'}
          </Text>
          <Pressable
            testID="CloseGuestBooking"
            accessibilityHint="Close visitor booking"
            accessibilityRole="button"
            onPress={toggleDisplayGuestBooking}>
            <Cross />
          </Pressable>
        </View>
      )}
      <VStack space="16px">
        {bookingType === BookingType.guest && hasBooked && (
          <HStack alignItems={'flex-start'} testID="GuestBookedID">
            <GroupIcon />
            <Text
              importantForAccessibility="yes"
              fontFamily={'body'}
              fontSize={16}
              paddingX={2}
              paddingY={0.5}>
              You have booked <BoldText>{relevantBookings.length}</BoldText>{' '}
              visitor spaces
            </Text>
          </HStack>
        )}

        <Text
          importantForAccessibility="yes"
          color="brand.charcoal"
          fontFamily={'body'}
          fontWeight={400}
          fontSize={16}>
          {heading}
        </Text>
      </VStack>
      <HStack space="10px">
        {options.map(option => (
          <DayTimeSelector
            key={option.id}
            capacity={capacity}
            update={updateSelectedDuration}
            hasBookedCommunal={hasCommunalSpace}
            isBookingEditable={isBookingEditable}
            {...option}
          />
        ))}
      </HStack>
      <HStack alignItems="center" justifyContent="space-between" space={4}>
        {bookingType === BookingType.personal && !hasBooked && (
          <UserProfileSection />
        )}
        {bookingType === BookingType.guest && !hasBooked && (
          <View flex={1}>
            <Counter
              upperLimit={capacity}
              lowerLimit={1}
              initialValue={1}
              onCountChanged={(count: number) => setGuestCount(count)}
              setCountValid={(isValid: boolean) => setGuestCountValid(isValid)}
              invalidInputWarningWidth={guestSpacesWidth}
            />
          </View>
        )}
        {hasBooked && (
          <Text
            fontFamily={'body'}
            fontWeight={500}
            fontStyle={'normal'}
            fontSize={16}
            flex={1}>
            {hasBookedText}
          </Text>
        )}
        {shouldShowEdit ? (
          <HStack space={3}>
            <MurrayButton
              isDisabled={false}
              onPress={() => handleButtonPress(editBookingsFunc)}
              buttonText={'Yes'}
              color="grey"
            />
            <MurrayButton
              isDisabled={false}
              onPress={editDismissFn}
              buttonText={'No'}
              color="red"
            />
          </HStack>
        ) : (
          <View>
            <BookButton
              isDisabled={!isBookButtonEnabled}
              onPress={
                hasBooked
                  ? () => setIsAlertOpen(true)
                  : () => handleButtonPress(postBookingsFunc)
              }
              hasBooked={hasBooked}
              spaceType={spaceType}
            />
            {isAlertOpen && (
              <AlertMessage
                isOpen={isAlertOpen}
                onClose={handleAlertClose}
                title="Confirm cancellation"
                message="Are you sure you want to cancel your booking?"
                alertConfig={{
                  button1: {
                    onPress: () => handleButtonPress(deleteBookingsFunc),
                  },
                  button2: {
                    onPress: handleAlertClose,
                  },
                }}
              />
            )}
            {isUnknownUserAlertOpen && (
              <AlertMessage
                isOpen={isUnknownUserAlertOpen}
                onClose={handleUnkownUserAlertClose}
                message="Sorry, only Murray, Adams, and Tenzing users can book a parking spot."
                alertConfig={{
                  button1: {
                    onPress: handleUnkownUserAlertClose,
                    colorScheme: 'warmGray',
                    text: 'Ok',
                  },
                }}
              />
            )}
          </View>
        )}
      </HStack>
      {isBookingEditable && (
        <SimpleInfoMessage
          iconSize={14}
          message={
            'To edit the time of your booking, just press the new time slot that you would like to change it to.'
          }
        />
      )}
      {canBookGuests &&
        !showGuestSpaces &&
        bookingType === BookingType.personal && (
          <Pressable
            accessibilityRole="button"
            testID="OpenGuestBooking"
            onPress={toggleDisplayGuestBooking}>
            <Text
              accessibilityLabel="Booking for someone else?"
              color="brand.blue"
              fontFamily={'body'}
              fontWeight={500}
              fontSize={14}
              mx={'auto'}>
              {subHeading}
            </Text>
          </Pressable>
        )}
    </VStack>
  );
};

export default AvailableSpaceView;
