import React, {useMemo} from 'react';
import {View, Text} from 'native-base';
import ReservedCount from '@atoms/ReservedCount/ReservedCount';

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
        <View justifyContent={'space-between'} flexDirection={'row'}>
          <Text
            fontFamily={'body'}
            fontWeight="500"
            fontSize={14}
            color={subheadingTextColorFull}>
            Full
          </Text>
          <ReservedCount count={`${-spaceLeft}`} />
        </View>
      ) : (
        <Text
          fontFamily={'body'}
          fontWeight="400"
          fontSize={14}
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
