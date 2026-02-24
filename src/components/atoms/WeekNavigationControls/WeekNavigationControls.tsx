import React from 'react';
import {Text, Pressable, HStack} from 'native-base';
import {ChevronLeft} from '@res/images/ChevronLeft';
import {ChevronRight} from '@res/images/ChevronRight';

type WeekNavigationControlsProps = {
  weekOffset: number;
  onPress: () => void;
};

const WeekNavigationControls = ({
  weekOffset,
  onPress,
}: WeekNavigationControlsProps) => {
  let weekText = 'Next Week';
  if (weekOffset === 1) {
    weekText = 'Previous Week';
  }

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      testID="WeekNavigationControls">
      <HStack alignItems={'center'}>
        {weekOffset === 1 && <ChevronLeft />}
        <Text
          fontFamily={'body'}
          fontWeight={'500'}
          fontStyle={'normal'}
          fontSize={16}
          paddingX={2}>
          {weekText}
        </Text>
        {weekOffset === 0 && <ChevronRight />}
      </HStack>
    </Pressable>
  );
};

export default WeekNavigationControls;
