import React, {useState, ReactElement} from 'react';
import auth from '@react-native-firebase/auth';
import {
  AlertDialog,
  Box,
  Button,
  Input,
  Text,
} from '@gluestack-ui/themed-native-base';

const EmailPasswordLoginModal = (): React.JSX.Element => {
  const [isLoginAlertOpen, setIsLoginAlertOpen] = useState(false);

  const [usernameState, setUsername] = useState('');
  const [passwordState, setPassword] = useState('');

  const authWithPassword = (email: string, password: string) => {
    auth()
      .signInWithEmailAndPassword(email, password)
      .then(() => {
        console.log('Demo user account created & signed in!');
      });
  };

  const handleAlertClose = () => {
    setIsLoginAlertOpen(false);
  };

  const loginAlertCancelRef = React.useRef(null);

  return (
    <Box mx="auto">
      <Button
        variant="unstyled"
        onPress={() => {
          setIsLoginAlertOpen(true);
        }}
        testID="DemoLoginButton">
        <Text color="white">Demo login</Text>
      </Button>
      {demoLoginAlert()}
    </Box>
  );

  function demoLoginAlert(): ReactElement {
    return (
      <AlertDialog
        leastDestructiveRef={loginAlertCancelRef}
        isOpen={isLoginAlertOpen}
        onClose={handleAlertClose}>
        <AlertDialog.Content>
          <AlertDialog.CloseButton />
          <AlertDialog.Header>Login with password</AlertDialog.Header>
          <AlertDialog.Body>
            <Input
              type="text"
              w="100%"
              py="0"
              placeholder="Email address"
              onChangeText={(textInput: string) => setUsername(textInput)}
              value={usernameState}
            />
            <Input
              type="password"
              w="100%"
              py="0"
              placeholder="Password"
              onChangeText={(textInput: string) => setPassword(textInput)}
              value={passwordState}
            />
          </AlertDialog.Body>
          <AlertDialog.Footer>
            <Button.Group space={2}>
              <Button
                variant="unstyled"
                colorScheme="coolGray"
                ref={loginAlertCancelRef}
                onPress={handleAlertClose}>
                Cancel
              </Button>
              <Button
                colorScheme={'blue'}
                onPress={() => authWithPassword(usernameState, passwordState)}>
                Login
              </Button>
            </Button.Group>
          </AlertDialog.Footer>
        </AlertDialog.Content>
      </AlertDialog>
    );
  }
};

export default EmailPasswordLoginModal;
