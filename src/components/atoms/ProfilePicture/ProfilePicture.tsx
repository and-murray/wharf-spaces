import React from 'react';
import {SilhouetteProfilePicture} from '@res/images/SilhouetteProfilePicture';
import {Avatar, AvatarImage, Box} from '@gluestack-ui/themed';

type ProfilePictureProps = {
  uri: string | undefined;
  showBorder: boolean;
};

const ProfilePicture = ({uri, showBorder}: ProfilePictureProps) => {
  return (
    <Box
      width="$10"
      height="$10"
      justifyContent="center"
      alignItems="center"
      borderColor="$brandGreen"
      borderWidth={showBorder ? 2 : 0}
      borderRadius={25}
      accessibilityLabel="User avatar"
      accessibilityRole="image"
      accessible
      testID="ProfilePicture">
      <Avatar
        width="$full"
        height="$full"
        backgroundColor="transparent"
        accessible={false}
        importantForAccessibility="no-hide-descendants">
        {uri ? (
          <AvatarImage alt={uri} source={uri} />
        ) : (
          <SilhouetteProfilePicture size={undefined} />
        )}
      </Avatar>
    </Box>
  );
};

export default ProfilePicture;
