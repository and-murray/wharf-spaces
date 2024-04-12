import React from 'react';
import {ZStack, Avatar} from 'native-base';
import {SilhouetteProfilePicture} from '@res/images/SilhouetteProfilePicture';

type ProfilePictureProps = {
  uri: string | undefined;
  showBorder: boolean;
};

const ProfilePicture = ({uri, showBorder}: ProfilePictureProps) => {
  return (
    <ZStack
      width={12}
      height={12}
      justifyContent={'center'}
      alignItems={'center'}
      borderColor="brand.green"
      borderWidth={showBorder ? 2 : 0}
      borderRadius={24}
      accessibilityLabel="User avatar"
      accessibilityRole="image"
      accessible
      testID="ProfilePicture">
      <Avatar
        source={{uri: uri !== '' ? uri : undefined}}
        width={'100%'}
        height={'100%'}
        backgroundColor="transparent"
        accessible={false}
        importantForAccessibility="no-hide-descendants">
        <SilhouetteProfilePicture />
      </Avatar>
    </ZStack>
  );
};

export default ProfilePicture;
