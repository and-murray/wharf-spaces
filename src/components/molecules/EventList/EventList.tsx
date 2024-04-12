import {Text, View} from '@gluestack-ui/themed';
import React from 'react';

type EventListProps = {
  currentEvent: string;
  hasEvent: boolean;
};

const EventList = ({currentEvent, hasEvent}: EventListProps) => {
  let headerText = hasEvent ? 'Event(s)' : 'Events in the clubhouse';

  return (
    <View flex={1}>
      <Text
        fontFamily="$body"
        fontWeight="$normal"
        size="md"
        color="$otherGreyMid"
        accessibilityLabel={headerText}>
        {headerText}
      </Text>
      {hasEvent && (
        <Text
          fontFamily="$body"
          fontWeight="$normal"
          size="md"
          color="$brandCharcoal"
          accessibilityLabel={currentEvent}>
          {currentEvent}
        </Text>
      )}
    </View>
  );
};
export default EventList;
