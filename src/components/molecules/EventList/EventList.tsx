import {View, Text} from '@gluestack-ui/themed-native-base';
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
        fontSize={16}
        color={'other.greyMid'}
        accessibilityLabel={headerText}>
        {headerText}
      </Text>
      {hasEvent && (
        <Text
          fontFamily={'body'}
          fontWeight={400}
          fontStyle={'normal'}
          fontSize={16}
          color={'brand.charcoal'}
          accessibilityLabel={currentEvent}>
          {currentEvent}
        </Text>
      )}
    </View>
  );
};
export default EventList;
