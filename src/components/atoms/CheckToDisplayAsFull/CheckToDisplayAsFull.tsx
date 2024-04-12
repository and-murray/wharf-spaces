import React, {useMemo} from 'react';
import ReservedCount from '@atoms/ReservedCount/ReservedCount';
import {Text, View} from '@gluestack-ui/themed';

type CheckToDisplayAsFullProps = {
  spaceLeft: number | undefined;
  capacity: number;
  subheadingTextColor: string;
  subheadingTextColorFull: string;
  id: number;
};

const CheckToDisplayAsFull = ({
  spaceLeft,
  capacity,
  subheadingTextColor,
  subheadingTextColorFull,
  id,
}: CheckToDisplayAsFullProps) => {
  let subheadingText = useMemo(() => {
    if (spaceLeft === undefined) {
      return ' ';
    }
    if (spaceLeft > 0) {
      return `${spaceLeft}/${capacity}`;
    }
    return 'Full';
  }, [spaceLeft, capacity]);

  const spaceAvailable = spaceLeft && spaceLeft < 0;

  return (
    <>
      {spaceAvailable ? (
        <View justifyContent="space-between" flexDirection="row">
          <Text
            fontFamily="$body"
            fontWeight="$normal"
            size="md"
            color={subheadingTextColorFull}>
            Full
          </Text>
          <ReservedCount count={`${-spaceLeft}`} />
        </View>
      ) : (
        <Text
          fontFamily="$body"
          fontWeight="$normal"
          size="md"
          color={
            spaceLeft === 0 ? subheadingTextColorFull : subheadingTextColor
          }
          testID={`DayTimeSelectorSubheading-${id}`}>
          {subheadingText}
        </Text>
      )}
    </>
  );
};
export default CheckToDisplayAsFull;
