import {
  AlertDialog,
  Button,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogBody,
  ButtonText,
  AlertDialogHeader,
  Text,
  AlertDialogBackdrop,
} from '@gluestack-ui/themed';
import React, {useRef} from 'react';

interface ButtonConfig {
  text?: string;
  colorScheme?: string;
  onPress: () => void;
}

interface AlertMessageConfig {
  button1: ButtonConfig;
  button2?: ButtonConfig;
}

interface AlertMessageProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message: string;
  alertConfig: AlertMessageConfig;
}

const AlertMessage: React.FC<AlertMessageProps> = ({
  isOpen,
  onClose,
  title,
  message,
  alertConfig,
}) => {
  const dismissRef = useRef(null);
  return (
    <AlertDialog
      isOpen={isOpen}
      onClose={onClose}
      testID="alertPromptTestID"
      leastDestructiveRef={dismissRef}>
      <AlertDialogBackdrop />
      <AlertDialogContent bgColor="$brandWhite">
        {title && (
          <AlertDialogHeader>
            <Text>{title}</Text>
          </AlertDialogHeader>
        )}
        <AlertDialogBody>
          <Text>{message}</Text>
        </AlertDialogBody>
        <AlertDialogFooter justifyContent="space-around" width="$full">
          <Button
            size="md"
            onPress={alertConfig.button1.onPress}
            bgColor={alertConfig.button1.colorScheme || '$otherPrimaryRed'}
            testID="AlertDialogButton1TestId"
            ref={alertConfig.button2 ? undefined : dismissRef}>
            <ButtonText>{alertConfig.button1.text || 'Confirm'}</ButtonText>
          </Button>
          {alertConfig.button2 && (
            <Button
              size="md"
              onPress={alertConfig.button2.onPress}
              bgColor={alertConfig.button2.colorScheme || '$otherGreyMid'}
              testID="AlertDialogButton2TestId"
              ref={dismissRef}>
              <ButtonText>{alertConfig.button2.text || 'Dismiss'}</ButtonText>
            </Button>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default AlertMessage;
