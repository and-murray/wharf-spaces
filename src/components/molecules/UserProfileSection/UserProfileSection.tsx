import React from 'react';
import {ProfilePicture} from '@atoms';
import {useAppSelector} from '@state/utils/hooks';
import {HStack, Text} from '@gluestack-ui/themed';

const UserProfileSection = () => {
  const {user} = useAppSelector(state => state.user);

  return (
    <HStack alignItems="center" flex={1} testID="users-profile-section">
      <ProfilePicture uri={user && user.profilePicUrl} showBorder={false} />
      <Text
        color="$brandCharcoal"
        fontFamily="$body"
        fontWeight="$medium"
        marginLeft="7%"
        size="sm"
        flex={1}
        numberOfLines={2}>
        {user ? `${user.firstName} ${user.lastName}` : 'Current User'}
      </Text>
    </HStack>
  );
};

export default UserProfileSection;
