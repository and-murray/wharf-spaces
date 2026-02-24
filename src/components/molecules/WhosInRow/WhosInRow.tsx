import React from 'react';
import {HStack, Text, VStack} from '@gluestack-ui/themed-native-base';
import {ProfilePicture} from '@atoms';
import {SpaceType} from '@customTypes/booking';

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
  const shouldHighlight = () => {
    if (isReserveSpace && spaceType === SpaceType.car) {
      return false;
    }
    return isReserveSpace;
  };
  return (
    <HStack
      alignItems={'center'}
      justifyContent={'space-between'}
      paddingX={4}
      paddingY={3}
      backgroundColor={shouldHighlight() ? 'other.lightGrey' : 'brand.white'}
      testID="testWhosInContainer"
      space={4}>
      <ProfilePicture uri={profilePictureURI} showBorder={isCurrentUser} />
      <VStack flex={1}>
        <Text
          color="brand.charcoal"
          fontFamily={'body'}
          fontWeight={500}
          fontSize={14}
          ellipsizeMode="middle"
          numberOfLines={2}>
          {name}
        </Text>
        {isReserveSpace && (
          <Text
            color="brand.charcoal"
            fontFamily="body"
            fontWeight={400}
            fontSize={12}
            testID="testCommunalSpace">
            {constructReserveListString()}
          </Text>
        )}
      </VStack>
      <Text
        color="other.greyMid"
        fontFamily={'body'}
        fontWeight={400}
        fontSize={14}>
        {timeSlot}
      </Text>
    </HStack>
  );
};

export default WhosInRow;
