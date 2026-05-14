import {View} from 'native-base';
import { Text } from '@components/ui';
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
        fontFamily={'body'}
        fontWeight={400}
        fontStyle={'normal'}
        size="md"
        color={'other.greyMid'}
        accessibilityLabel={headerText}>
        {headerText}
      </Text>
      {hasEvent && (
        <Text
          fontFamily={'body'}
          fontWeight={400}
          fontStyle={'normal'}
          size="md"
          color={'brand.charcoal'}
          accessibilityLabel={currentEvent}>
          {currentEvent}
        </Text>
      )}
    </View>
  );
};
export default EventList;
