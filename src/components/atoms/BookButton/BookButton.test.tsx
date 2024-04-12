import React from 'react';
import {fireEvent, render} from '@testing-library/react-native';
import BookButton from './BookButton';
import {TestWrapper} from '@components/TestWrapper';

import * as DeskIcon from '@res/images/DeskIcon';
import * as CarIcon from '@res/images/CarIcon';
import {SpaceType} from '@customTypes/booking';

const deskIconSpy = jest.spyOn(DeskIcon, 'DeskIcon');
const carIcon = jest.spyOn(CarIcon, 'CarIcon');

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
      expect(deskIconSpy).toBeCalledTimes(1);
      fireEvent.press(getByTestId('BookButton'));
      expect(onPress).toBeCalledTimes(1);
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
      expect(carIcon).toBeCalledTimes(1);
      fireEvent.press(getByTestId('BookButton'));
      expect(onPress).toBeCalledTimes(1);
    });
  });
});
