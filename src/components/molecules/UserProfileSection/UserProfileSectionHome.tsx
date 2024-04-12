import React from 'react';
import {ProfilePicture} from '@atoms';
import {useAppSelector} from '@state/utils/hooks';
import {DateFormat, formatDate} from '@utils/DateTimeUtils/DateTimeUtils';
import {HStack, Text, VStack} from '@gluestack-ui/themed';

const UserProfileSectionHome = () => {
  const {user} = useAppSelector(state => state.user);

  return (
    <VStack margin="$1" testID="users-profile-section">
      <HStack alignItems="center">
        <ProfilePicture uri={user && user.profilePicUrl} showBorder={false} />
        <Text marginLeft="$1" fontWeight="$normal" size="xl">
          {user ? `EY UP ${user.firstName}` : 'Current User'}
        </Text>
      </HStack>
      <Text marginTop="$0.5" fontWeight="$normal">
        {formatDate(DateFormat.dddd_DD_MMMM)}
      </Text>
    </VStack>
  );
};

export default UserProfileSectionHome;
