import React from 'react';
import {Button, ScrollView, Text, VStack, View} from 'native-base';
import {useAppSelector} from '@state/utils/hooks';
import {signOut} from '@firebase/authentication/FirebaseGoogleAuthentication';
import UserProfileSectionHome from '../components/molecules/UserProfileSection/UserProfileSectionHome';

export default function HomeScreen() {
  const {user} = useAppSelector(state => state.user);

  return (
    <ScrollView keyboardShouldPersistTaps="handled">
      <VStack>
        <UserProfileSectionHome />
        <View flex={1} justifyContent={'center'} alignItems={'center'}>
          <Text>{user?.email}</Text>
          <Text>{user?.id}</Text>
          <Text>{user?.profilePicUrl}</Text>
          <Button onPress={signOut}>
            <Text fontSize={30} color={'brand.white'}>
              Sign out
            </Text>
          </Button>
        </View>
      </VStack>
    </ScrollView>
  );
}
