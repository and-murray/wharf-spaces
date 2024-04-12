import React, {useState, ReactElement} from 'react';
import auth from '@react-native-firebase/auth';
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogCloseButton,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  Box,
  Button,
  ButtonGroup,
  ButtonText,
  Input,
  InputField,
} from '@gluestack-ui/themed';

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
        onPress={() => {
          setIsLoginAlertOpen(true);
        }}
        testID="DemoLoginButton">
        <ButtonText color="white">Demo login</ButtonText>
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
        <AlertDialogContent>
          <AlertDialogCloseButton />
          <AlertDialogHeader>Login with password</AlertDialogHeader>
          <AlertDialogBody>
            <Input width="$full" paddingVertical={0}>
              <InputField
                type="text"
                placeholder="Email address"
                onChangeText={textInput => setUsername(textInput)}
                value={usernameState}
              />
            </Input>
            <Input width="$full" paddingVertical={0}>
              <InputField
                type="password"
                placeholder="Password"
                onChangeText={textInput => setPassword(textInput)}
                value={passwordState}
              />
            </Input>
          </AlertDialogBody>
          <AlertDialogFooter>
            <ButtonGroup space="sm">
              <Button
                bgColor="coolGray"
                ref={loginAlertCancelRef}
                onPress={handleAlertClose}>
                <ButtonText>Cancel</ButtonText>
              </Button>
              <Button
                bgColor="blue"
                onPress={() => authWithPassword(usernameState, passwordState)}>
                <ButtonText>Login</ButtonText>
              </Button>
            </ButtonGroup>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }
};

export default EmailPasswordLoginModal;
