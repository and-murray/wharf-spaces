import React, {useState, useEffect} from 'react';
import {EventList, EventModal} from '@molecules';
import {useAppSelector} from '@state/utils/hooks';
import {Pencil} from '@root/src/res/images/Pencil';
import {Box, Pressable, View} from '@gluestack-ui/themed';

const EventViewer = () => {
  const {selectedDay} = useAppSelector(state => state.selectedDayOptions);
  const {notes} = useAppSelector(state => state.note);

  const [currentEventText, setCurrentEventText] = useState<string>('');
  const [eventID, setEventID] = useState<string>('');
  const [hasEvent, setHasEvent] = useState<boolean>(false);
  const [showEventModal, setShowEventModal] = useState(false);
  let buttonText = hasEvent ? 'Edit Event(s)' : 'Add Event';
  useEffect(() => {
    if (notes) {
      if (notes.length === 0) {
        setHasEvent(false);
        setCurrentEventText('');
        setEventID('');
      } else {
        setHasEvent(true);
        setCurrentEventText(notes[0].text);
        setEventID(notes[0].uuid);
      }
    }
  }, [notes]);

  return (
    <>
      {selectedDay && (
        <Pressable
          onPress={() => {
            setShowEventModal(true);
          }}>
          <Box
            flexGrow={1}
            paddingHorizontal={4}
            paddingVertical={2}
            marginHorizontal={4}
            rounded={8}
            borderWidth={1}
            flexDirection="row"
            justifyContent="space-between"
            borderColor="$otherGrey"
            testID="EventViewerTestID">
            <EventList currentEvent={currentEventText} hasEvent={hasEvent} />
            <View
              flexDirection="row"
              alignItems="center"
              accessibilityLabel={buttonText}
              accessibilityRole="button">
              <Pencil />
            </View>
            <EventModal
              hasEvent={hasEvent}
              showEventModal={showEventModal}
              setShowEventModal={setShowEventModal}
              modalHeader={buttonText}
              currentEvent={currentEventText}
              selectedDate={selectedDay}
              eventDocumentId={eventID}
              warningMessage={
                'Please be careful not to replace or edit events that have been previously entered in the field above. Once you’ve pressed save, your changes cannot be undone.'
              }
            />
          </Box>
        </Pressable>
      )}
    </>
  );
};
export default EventViewer;
