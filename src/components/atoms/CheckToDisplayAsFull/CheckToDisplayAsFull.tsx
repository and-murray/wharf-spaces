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
  const subheadingText = useMemo(() => {
    if (spaceLeft === undefined) {
      return ' ';
    }
    if (spaceLeft > 0) {
      return `${spaceLeft}/${capacity}`;
    }
    return 'Full';
  }, [spaceLeft, capacity]);

  const noRemainingSpaces = spaceLeft === 0;

  return (
    <View justifyContent={'space-between'} flexDirection={'row'}>
      <Text
        fontFamily={'body'}
        fontWeight={noRemainingSpaces ? '500' : '400'}
        fontSize={14}
        color={
          noRemainingSpaces ? subheadingTextColorFull : subheadingTextColor
        }
        testID={`DayTimeSelectorSubheading-${id}`}>
        {noRemainingSpaces ? 'Full' : subheadingText}
      </Text>
      {reservedSpaces !== 0 && <ReservedCount count={reservedSpaces} />}
    </View>
  );
};
export default CheckToDisplayAsFull;
