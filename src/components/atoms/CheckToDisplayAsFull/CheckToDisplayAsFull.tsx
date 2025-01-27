import React, {useMemo} from 'react';
import {View, Text} from 'native-base';
import ReservedCount from '@atoms/ReservedCount/ReservedCount';

type CheckToDisplayAsFullProps = {
  spaceLeft: number | undefined;
  reservedSpaces: number | undefined;
  capacity: number;
  subheadingTextColor: string;
  subheadingTextColorFull: string;
  id: number;
};

const CheckToDisplayAsFull = ({
  spaceLeft,
  reservedSpaces,
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

  const spaceAvailable = spaceLeft === 0;

  return (
    <View justifyContent={'space-between'} flexDirection={'row'}>
      <Text
        fontFamily={'body'}
        fontWeight={spaceAvailable ? '500' : '400'}
        fontSize={14}
        color={spaceLeft === 0 ? subheadingTextColorFull : subheadingTextColor}
        testID={`DayTimeSelectorSubheading-${id}`}>
        {spaceAvailable ? 'Full' : subheadingText}
      </Text>
      {reservedSpaces !== 0 && <ReservedCount count={reservedSpaces} />}
    </View>
  );
};
export default CheckToDisplayAsFull;
