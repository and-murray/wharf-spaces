import {AlertDialog, Button, Box} from 'native-base';
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
  const dismissRef = useRef();
  return (
    <AlertDialog
      isOpen={isOpen}
      onClose={onClose}
      testID={'alertPromptTestID'}
      leastDestructiveRef={dismissRef}>
      <AlertDialog.Content>
        {title && <AlertDialog.Header>{title}</AlertDialog.Header>}
        <AlertDialog.Body>{message}</AlertDialog.Body>
        <AlertDialog.Footer>
          <Box flex={1} alignItems="center">
            <Button.Group space={2}>
              <Button
                size="md"
                onPress={alertConfig.button1.onPress}
                colorScheme={alertConfig.button1.colorScheme || 'danger'}
                testID={'AlertDialogButton1TestId'}
                ref={alertConfig.button2 ? undefined : dismissRef}>
                {alertConfig.button1.text || 'Confirm'}
              </Button>
              {alertConfig.button2 ? (
                <Button
                  size="md"
                  onPress={alertConfig.button2.onPress}
                  colorScheme={alertConfig.button2.colorScheme || 'warmGray'}
                  testID={'AlertDialogButton2TestId'}
                  ref={dismissRef}>
                  {alertConfig.button2.text || 'Dismiss'}
                </Button>
              ) : (
                <></>
              )}
            </Button.Group>
          </Box>
        </AlertDialog.Footer>
      </AlertDialog.Content>
    </AlertDialog>
  );
};

export default AlertMessage;
