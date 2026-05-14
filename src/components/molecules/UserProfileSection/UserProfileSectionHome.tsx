import React from 'react';
import {HStack, VStack} from 'native-base';
import { Text } from '@components/ui';
import {ProfilePicture} from '@atoms';
import {useAppSelector} from '@state/utils/hooks';
import {DateFormat, formatDate} from '@utils/DateTimeUtils/DateTimeUtils';

const UserProfileSectionHome = () => {
  const {user} = useAppSelector(state => state.user);

  return (
    <VStack margin={'4'} testID={'users-profile-section'}>
      <HStack alignItems={'center'}>
        <ProfilePicture uri={user && user.profilePicUrl} showBorder={false} />
        <Text marginLeft={'4'} fontWeight={'500'} size="xl">
          {user ? `EY UP ${user.firstName}` : 'Current User'}
        </Text>
      </HStack>
      <Text marginTop={'2'} fontWeight={'500'}>
        {formatDate(DateFormat.dddd_DD_MMMM)}
      </Text>
    </VStack>
  );
};

export default UserProfileSectionHome;
