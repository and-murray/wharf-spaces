import React, {ReactNode, useMemo, useState} from 'react';
import {Platform} from 'react-native';
import {WhosInRow} from '@molecules';
import {TimeSlotUtils} from '@utils/TimeSlotUtils/TimeSlotUtils';
import {useAppSelector} from '@state/utils/hooks';
import Booking, {BookingType, SpaceType} from '@customTypes/booking';
import {ReducedUserData} from '@customTypes/ReducedUserData';
import {Box, Card, HStack, Text, VStack} from '@gluestack-ui/themed';
type WhosInProps = {
  bookings: Booking[];
  userData: ReducedUserData;
};

const WhosIn = ({bookings, userData}: WhosInProps) => {
  const [andiAndvisitorNumbers, setAndiAndVisitorNumbers] = useState<number[]>([
    0, 0,
  ]);
  const [andiCount, visitorCount] = andiAndvisitorNumbers;

  const [rows, setRows] = useState<ReactNode[]>([]);
  const {
    selectedDayOptions: {selectedSpaceType},
    user: {user},
  } = useAppSelector(state => state);

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
      let numberOfAndis = allVisitors.length - totalVisitorCount;
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
      let bookingUserData = userData[booking.userId] ?? {
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
          timeSlot={TimeSlotUtils.toString(booking.timeSlot)}
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
    <VStack
      marginBottom="$3"
      alignItems="center"
      marginHorizontal="$1"
      testID="WhosIn">
      <HStack
        justifyContent="space-between"
        alignItems="center"
        marginBottom="$1.5"
        width="$full">
        <Text
          color="$brandCharcoal"
          fontFamily="$body"
          fontWeight="$normal"
          size="md">
          {constructWhoIsInString()}
        </Text>
        <Box
          backgroundColor="$otherLightGrey"
          borderRadius={25}
          paddingHorizontal="$1"
          paddingVertical="$0.5"
          flexShrink={1}>
          <Text
            color="$brandCharcoal"
            fontFamily="$body"
            fontWeight="$medium"
            padding="$1"
            size="md">
            {constructWhoIsInCountString()}
          </Text>
        </Box>
      </HStack>
      {rows.length === 0 ? (
        <Text
          color="$otherGreyMid"
          fontFamily="$body"
          fontWeight="$normal"
          size="md">
          {constructBeTheFirstString()}
        </Text>
      ) : (
        <Card
          hardShadow="3"
          shadowRadius={'$0.5'}
          backgroundColor="white"
          borderRadius={20}
          padding="$1" // Padding required corners not to be intersected by background of the rows
          width="$full"
          overflow={Platform.OS === 'android' ? 'hidden' : 'visible'}>
          {rows}
        </Card>
      )}
    </VStack>
  );
};
export default WhosIn;
