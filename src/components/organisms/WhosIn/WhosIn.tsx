import React, {useMemo, useState} from 'react';
import {Platform} from 'react-native';
import {VStack, HStack, Text, Box, Card} from 'native-base';
import {Booking} from '@customTypes';
import {WhosInRow} from '@molecules';
import {toString} from '@utils/TimeSlotUtils/TimeSlotUtils';
import {useAppSelector} from '@state/utils/hooks';
import {BookingType, SpaceType} from '@customTypes/booking';
import {ReducedUserData} from '@customTypes/ReducedUserData';
type WhosInProps = {
  bookings: Booking[];
  userData: ReducedUserData;
};

const WhosIn = ({bookings, userData}: WhosInProps) => {
  const [andiAndvisitorNumbers, setAndiAndVisitorNumbers] = useState<number[]>([
    0, 0,
  ]);
  const [andiCount, visitorCount] = andiAndvisitorNumbers;

  const [rows, setRows] = useState<Element[]>([]);
  const selectedSpaceType = useAppSelector(
    state => state.selectedDayOptions.selectedSpaceType,
  );
  const user = useAppSelector(state => state.user.user);

  useMemo(async () => {
    // default rows back when nothing booked otherwise data persists onto days without any bookings
    if (Object.keys(userData).length === 0 || user?.id === undefined) {
      setRows([]);
      setAndiAndVisitorNumbers([0, 0]);
      return;
    }

    const changeToVisitorName = (name: string, visitorNumber: number) => {
      // proper grammar for apostrophe of words ending when not ending with an s
      const pluralRegex = new RegExp('[sS]$').test(name)
        ? `${name}' Visitor ${visitorNumber}`
        : `${name}'s Visitor ${visitorNumber}`;

      return pluralRegex;
    };

    const calculateVisitorsAndAndis = (
      allVisitors: Element[],
      totalVisitorCount: number,
    ) => {
      const numberOfAndis = allVisitors.length - totalVisitorCount;
      setAndiAndVisitorNumbers([numberOfAndis, totalVisitorCount]);
    };

    // Generate dictionary for pairing visitors by their id to their count for tracking and naming purposes
    const andiVisitors: {[Key: string]: number} = {};
    let totalVisitorCount = 0;

    /**
     * Returns reserve list bookings in order with the first position in the array the one that was booked first
     * Can be used to determine wait list position.
     * */
    const reserveListBookingsInOrder = () => {
      const reserveListBookings = bookings.filter(
        booking => booking.isReserveSpace === true,
      );
      const ordered = reserveListBookings.sort(
        (a: Booking, b: Booking) => a.createdAt - b.createdAt,
      );
      return ordered;
    };
    const orderedReserveList = reserveListBookingsInOrder();

    const generatedRows = bookings.map((booking, index) => {
      const isGuest = booking.bookingType === BookingType.guest;
      const bookingUserData = userData[booking.userId] ?? {
        name: 'Error loading name data',
        profilePictureURI: 'Error loading image data',
        businessUnit: 'unknown',
      };

      let {name, profilePictureURI} = bookingUserData;

      // change name to include visitor and default the image if a guest
      if (isGuest) {
        const currentCount = andiVisitors[booking.userId] ?? 1;
        name = changeToVisitorName(name, currentCount);
        profilePictureURI = undefined;
        andiVisitors[booking.userId] = currentCount + 1;

        totalVisitorCount++;
      }
      let positionInWaitList: number | undefined;
      if (booking.isReserveSpace) {
        const indexOfElement = orderedReserveList.findIndex(
          (orderedBooking: Booking) => {
            return orderedBooking.id === booking.id;
          },
        );
        positionInWaitList = indexOfElement + 1;
      }
      return (
        <WhosInRow
          key={booking.spaceType + index}
          name={name}
          profilePictureURI={profilePictureURI}
          timeSlot={toString(booking.timeSlot)}
          // Check that it is not a guest booking when asserting if current user
          isCurrentUser={booking.userId === user?.id && !isGuest}
          isReserveSpace={booking.isReserveSpace}
          spaceType={booking.spaceType}
          reserveListPosition={positionInWaitList}
        />
      );
    });
    generatedRows.sort((a, b) => a.props.name.localeCompare(b.props.name));

    setRows(generatedRows);
    calculateVisitorsAndAndis(generatedRows, totalVisitorCount);
  }, [bookings, user?.id, userData]);

  const constructWhoIsInCountString = () => {
    let whoIsInString = andiCount + ' ANDi' + (andiCount === 1 ? '' : 's');

    if (visitorCount > 0) {
      whoIsInString +=
        ' + ' + visitorCount + ' visitor' + (visitorCount === 1 ? '' : 's');
    }

    return whoIsInString;
  };

  const constructBeTheFirstString = () => {
    if (selectedSpaceType === SpaceType.desk) {
      return 'Be the first to book a desk space!';
    } else if (selectedSpaceType === SpaceType.car) {
      return 'Be the first to book a parking space!';
    }
    return '';
  };

  const constructWhoIsInString = () => {
    if (selectedSpaceType === SpaceType.desk) {
      return "Who's in?";
    } else if (selectedSpaceType === SpaceType.car) {
      return "Who's parking?";
    }
    return '';
  };
  return (
    <VStack alignItems="center" marginX={4} testID="WhosIn">
      <HStack
        justifyContent={'space-between'}
        alignItems={'center'}
        marginBottom={6}
        width={'100%'}>
        <Text
          color="brand.charcoal"
          fontFamily={'body'}
          fontWeight={400}
          fontSize={16}>
          {constructWhoIsInString()}
        </Text>
        <Box
          backgroundColor={'other.lightGrey'}
          borderRadius={24}
          paddingX={4}
          paddingY={1}
          flexShrink={1}>
          <Text
            color="brand.charcoal"
            fontFamily={'body'}
            fontWeight={500}
            fontSize={16}>
            {constructWhoIsInCountString()}
          </Text>
        </Box>
      </HStack>
      {rows.length === 0 ? (
        <Text
          color="other.greyMid"
          fontFamily={'body'}
          fontWeight={400}
          fontSize={16}>
          {constructBeTheFirstString()}
        </Text>
      ) : (
        <Card
          shadow={4}
          backgroundColor="white"
          borderRadius={20}
          padding={2} // Padding required corners not to be intersected by background of the rows
          width="100%"
          overflow={Platform.OS === 'android' ? 'hidden' : 'visible'}>
          {rows}
        </Card>
      )}
    </VStack>
  );
};
export default WhosIn;
