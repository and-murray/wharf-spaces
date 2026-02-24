import React from 'react';
import {Text, HStack} from '@gluestack-ui/themed-native-base';
import {ProfilePicture} from '@atoms';
import {useAppSelector} from '@state/utils/hooks';

const UserProfileSection = () => {
  const {user} = useAppSelector(state => state.user);

  return (
    <HStack alignItems={'center'} flex={1} testID={'users-profile-section'}>
      <ProfilePicture uri={user && user.profilePicUrl} showBorder={false} />
      <Text
        color="brand.charcoal"
        fontFamily={'body'}
        fontWeight={500}
        marginLeft={'7%'}
        fontSize={15}
        flex={1}
        numberOfLines={2}>
        {user ? `${user.firstName} ${user.lastName}` : 'Current User'}
      </Text>
    </HStack>
  );
};

export default UserProfileSection;
