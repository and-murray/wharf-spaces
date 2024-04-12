import React, {useEffect, useState} from 'react';
import AlertMessage from '@atoms/AlertMessage/AlertMessage';
import uuid from 'react-native-uuid';
import {createNote} from '@firebase/firestore/createNote';
import {Cross} from '@root/src/res/images/Cross';
import {deleteNote} from '@firebase/firestore/deleteNote';
import {isEqual} from 'lodash';
import {LongButton, Warning} from '@atoms';
import {Pencil} from '@root/src/res/images/Pencil';
import {styles} from './EventModal.styles';
import {updateNote} from '@firebase/firestore/updateNote';
import {
  Modal,
  ModalBackdrop,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  Text,
  View,
  VStack,
  Input,
  InputField,
  InputSlot,
  InputIcon,
} from '@gluestack-ui/themed';

type EventModalProps = {
  hasEvent: boolean;
  showEventModal: boolean;
  setShowEventModal: React.Dispatch<React.SetStateAction<boolean>>;
  modalHeader: string;
  currentEvent: string;
  selectedDate: string;
  warningMessage: string;
  eventDocumentId: string;
};

const EventModal = ({
  hasEvent,
  showEventModal,
  setShowEventModal,
  modalHeader,
  currentEvent,
  selectedDate,
  warningMessage,
  eventDocumentId,
}: EventModalProps) => {
  const [inputFieldText, setInputFieldText] = useState<string>('');

  const [isAlertOpen, setIsAlertOpen] = React.useState(false);
  const onClose = () => setIsAlertOpen(false);

  const uniqueId = uuid.v4().toString();

  useEffect(() => {
    if (hasEvent) {
      setInputFieldText(currentEvent);
      if (!isEqual(currentEvent, inputFieldText) && showEventModal) {
        setIsAlertOpen(true);
      }
    } else {
      setInputFieldText('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentEvent]);

  async function onPress(): Promise<void> {
    if (hasEvent) {
      if (inputFieldText === '') {
        await deleteNote(eventDocumentId);
      } else {
        await updateNote(eventDocumentId, inputFieldText);
      }
    } else {
      await createNote(inputFieldText, selectedDate, uniqueId);
    }
    setShowEventModal(false);
  }

  return (
    <Modal
      // TODO the accessibility attributes below might not do anything on iOS to stop screenreader focusing on elements behind this modal but test on real device
      accessibilityLabel={`${modalHeader} popup`}
      accessibilityViewIsModal={true}
      aria-modal={true}
      isOpen={showEventModal}
      justifyContent="flex-end"
      onClose={() => setShowEventModal(false)}
      testID="events-modal">
      <ModalBackdrop height="$full" />
      <ModalContent
        backgroundColor="$brandWhite"
        flex={1}
        maxHeight="$5/6"
        width="$full">
        <ModalHeader alignItems="center" backgroundColor="$otherLightGrey">
          <Text>{modalHeader}</Text>
          <ModalCloseButton as={Cross} testID="close-button" />
        </ModalHeader>
        <ModalBody
          contentContainerStyle={styles.modalContent}
          scrollEnabled={false}>
          <View
            height="$full"
            justifyContent="space-between"
            paddingBottom="$5"
            paddingTop="$3">
            <VStack space="md">
              <Text size="md">Events</Text>
              <Input>
                <InputField
                  onChangeText={text => setInputFieldText(text)}
                  testID="event-input-field"
                  value={inputFieldText}
                />
                <InputSlot paddingRight="$3">
                  <InputIcon as={Pencil} color="$otherGreyMid" />
                </InputSlot>
              </Input>
              <Warning
                backgroundColor="$error50"
                borderColor="$brandRed"
                symbolToUse="infoCircle"
                warningMessage={warningMessage}
              />
            </VStack>
            <View
              borderColor="$brandWhite"
              borderWidth={5}
              testID="save-button">
              <LongButton
                buttonText="Save"
                isDisabled={false}
                onPress={() => onPress()}
              />
              <AlertMessage
                isOpen={isAlertOpen}
                onClose={onClose}
                title="Event updated"
                message="Sorry, someone else has updated this event. Please review
              before making any further changes."
                alertConfig={{
                  button1: {
                    onPress: onClose,
                    colorScheme: 'warmGray',
                    text: 'Ok',
                  },
                }}
              />
            </View>
          </View>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default EventModal;
