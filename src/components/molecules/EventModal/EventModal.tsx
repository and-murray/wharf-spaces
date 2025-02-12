import React, {useState, useEffect} from 'react';
import {Dimensions} from 'react-native';
import {
  Text,
  Modal,
  KeyboardAvoidingView,
  View,
  ScrollView,
} from '@gluestack-ui/themed-native-base';
import {InputField, Warning, LongButton} from '@atoms';
import uuid from 'react-native-uuid';
import {isEqual} from 'lodash';
import {updateNote} from '@firebase/firestore/updateNote';
import {deleteNote} from '@firebase/firestore/deleteNote';
import {createNote} from '@firebase/firestore/createNote';
import AlertMessage from '@atoms/AlertMessage/AlertMessage';
import {WarningSymbolIcon} from '@atoms/Warning/WarningSymbol/WarningSymbol';
import {useAppSelector} from '@root/src/state/utils/hooks';
import {Note} from '@root/src/types/notes';

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
  const {notes} = useAppSelector(state => state.note);

  const [inputFieldText, setInputFieldText] = useState<string>('');
  const windowHeight: number = Dimensions.get('window').height;

  const [isAlertOpen, setIsAlertOpen] = React.useState(false);
  const onClose = () => setIsAlertOpen(false);

  const uniqueId = uuid.v4().toString();

  function resetFieldTextOnEventlessDay(updatedNotes: Note[]) {
    if (updatedNotes?.length === 0) {
      setInputFieldText('');
    }
  }

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

  useEffect(() => {
    resetFieldTextOnEventlessDay(notes);
  }, [notes]);

  async function onSavePress(): Promise<void> {
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
      isOpen={showEventModal}
      onClose={() => setShowEventModal(false)}
      animationPreset={'slide'}
      justifyContent={'flex-end'}
      size={'full'}
      testID={'events-modal'}
      // TODO the accessibility attributes below might not do anything on iOS to stop screenreader focusing on elements behind this modal but test on real device
      aria-modal={true}
      accessibilityLabel={`${modalHeader} popup`}
      accessibilityViewIsModal={true}>
      <Modal.Content
        backgroundColor={'brand.white'}
        maxHeight={`${windowHeight - 50}`}
        flex={1}>
        <Modal.CloseButton
          testID="close-button"
          accessibilityLabel={`Close ${modalHeader}`}
        />
        <Modal.Header alignItems={'center'}>{modalHeader}</Modal.Header>
        <KeyboardAvoidingView
          keyboardVerticalOffset={windowHeight * 0.05}
          behavior={'padding'}
          flex={1}>
          <ScrollView keyboardShouldPersistTaps="handled">
            <Modal.Body>
              <Text fontSize={16} marginTop={'2%'}>
                Events
              </Text>
              <View marginTop={'2%'} marginBottom={'6%'}>
                <InputField
                  testID={'event-input-field'}
                  text={inputFieldText}
                  setText={setInputFieldText}
                />
              </View>
              <View marginBottom={'2%'}>
                <Warning
                  warningMessage={warningMessage}
                  backgroundColor="red.50"
                  symbolToUse={WarningSymbolIcon.infoCircle}
                  borderColor="#D82036"
                />
              </View>
            </Modal.Body>
          </ScrollView>
          <View
            testID={'save-button'}
            paddingBottom={'10%'}
            paddingX={'4%'}
            borderWidth={5}
            borderColor={'brand.white'}>
            <LongButton
              buttonText="Save"
              onPress={() => onSavePress()}
              isDisabled={false}
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
        </KeyboardAvoidingView>
      </Modal.Content>
    </Modal>
  );
};

export default EventModal;
