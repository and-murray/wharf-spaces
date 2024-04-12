import React from 'react';
import {ProfilePicture} from '@atoms';
import {SpaceType} from '@customTypes/booking';
import {HStack, Text, VStack} from '@gluestack-ui/themed';

type WhosInRowProps = {
  name: string;
  profilePictureURI?: string;
  timeSlot: string;
  isCurrentUser: boolean;
  isReserveSpace: boolean;
  spaceType: SpaceType;
  reserveListPosition?: number;
};

const WhosInRow = ({
  name,
  profilePictureURI,
  timeSlot,
  isCurrentUser,
  isReserveSpace,
  spaceType,
  reserveListPosition,
}: WhosInRowProps) => {
  const constructReserveListString = () => {
    if (spaceType === SpaceType.desk) {
      return 'Communal Space';
    } else if (spaceType === SpaceType.car) {
      return `Waiting list position: ${reserveListPosition}`;
    }
    return '';
  };
  return (
    <HStack
      borderRadius={25}
      alignItems="center"
      justifyContent="space-between"
      paddingHorizontal="$4"
      paddingVertical="$3"
      backgroundColor={isReserveSpace ? '$otherLightGrey' : '$brandWhite'}
      testID="testWhosInContainer"
      space="sm">
      <ProfilePicture uri={profilePictureURI} showBorder={isCurrentUser} />
      <VStack flex={1}>
        <Text
          color="$brandCharcoal"
          fontFamily="$body"
          fontWeight="$medium"
          size="sm"
          ellipsizeMode="middle"
          numberOfLines={2}>
          {name}
        </Text>
        {isReserveSpace && (
          <Text
            color="$brandCharcoal"
            fontFamily="$body"
            fontWeight="$normal"
            size="xs"
            testID="testCommunalSpace">
            {constructReserveListString()}
          </Text>
        )}
      </VStack>
      <Text
        color="$otherGreyMid"
        fontFamily="$body"
        fontWeight="$normal"
        size="sm">
        {timeSlot}
      </Text>
    </HStack>
  );
};

export default WhosInRow;
