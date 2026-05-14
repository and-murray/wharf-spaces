import React from 'react';
import {HStack, VStack} from 'native-base';
import { Text } from '@components/ui';
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
          size="sm"
          ellipsizeMode="middle"
          numberOfLines={2}>
          {name}
        </Text>
        {isReserveSpace && (
          <Text
            color="brand.charcoal"
            fontFamily="body"
            fontWeight={400}
            size="xs"
            testID="testCommunalSpace">
            {constructReserveListString()}
          </Text>
        )}
      </VStack>
      <Text
        color="other.greyMid"
        fontFamily={'body'}
        fontWeight={400}
        size="sm">
        {timeSlot}
      </Text>
    </HStack>
  );
};

export default WhosInRow;
