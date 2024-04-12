import React from 'react';
import {useAppSelector} from '@state/utils/hooks';
import {signOut} from '@firebase/authentication/FirebaseGoogleAuthentication';
import UserProfileSectionHome from '../components/molecules/UserProfileSection/UserProfileSectionHome';
import {Button, ScrollView, Text, VStack, View} from '@gluestack-ui/themed';

export default function HomeScreen() {
  const {user} = useAppSelector(state => state.user);

  return (
    <ScrollView keyboardShouldPersistTaps="handled">
      <VStack>
        <UserProfileSectionHome />
        <View flex={1} justifyContent="center" alignItems="center">
          <Text>{user?.email}</Text>
          <Text>{user?.id}</Text>
          <Text>{user?.profilePicUrl}</Text>
          <Button onPress={signOut}>
            <Button.Text size="3xl" color="$brandWhite">
              Sign out
            </Button.Text>
          </Button>
        </View>
      </VStack>
    </ScrollView>
  );
}
