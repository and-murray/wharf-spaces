import React from 'react';
import {fireEvent, render} from '@testing-library/react-native';
import BookButton from './BookButton';
import {TestWrapper} from '@components/TestWrapper';

import {DeskIcon, CarIcon} from '@res/images';
import {SpaceType} from '@customTypes/booking';

jest.mock('@res/images', () => ({
  DeskIcon: jest.fn(),
  CarIcon: jest.fn(),
}));

describe('When the book button is rendered', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe("and it's booking a desk space", () => {
    it('should have a desk booking icon and is pressable', () => {
      const onPress = jest.fn();
      const {getByTestId} = render(
        <TestWrapper>
          <BookButton
            onPress={onPress}
            isDisabled={false}
            hasBooked={false}
            spaceType={SpaceType.desk}
          />
        </TestWrapper>,
      );
      expect(DeskIcon).toHaveBeenCalledTimes(1);
      fireEvent.press(getByTestId('BookButton'));
      expect(onPress).toHaveBeenCalledTimes(1);
    });
  });

  describe("and it's booking a car space", () => {
    it('should have a car booking icon and is pressable', () => {
      const onPress = jest.fn();
      const {getByTestId} = render(
        <TestWrapper>
          <BookButton
            onPress={onPress}
            isDisabled={false}
            hasBooked={false}
            spaceType={SpaceType.car}
          />
        </TestWrapper>,
      );
      expect(CarIcon).toHaveBeenCalledTimes(1);
      fireEvent.press(getByTestId('BookButton'));
      expect(onPress).toHaveBeenCalledTimes(1);
    });
  });
});
