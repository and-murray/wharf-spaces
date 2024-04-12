import React from 'react';
import {Chevron} from '@res/images';
import {HStack, Pressable, Text} from '@gluestack-ui/themed';

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
      <HStack alignItems="center">
        {weekOffset === 1 && (
          <Chevron style={{transform: [{rotateY: '180deg'}]}} />
        )}
        <Text
          fontFamily="$body"
          fontWeight="$medium"
          size="md"
          paddingHorizontal={2}>
          {weekText}
        </Text>
        {weekOffset === 0 && <Chevron />}
      </HStack>
    </Pressable>
  );
};

export default WeekNavigationControls;
