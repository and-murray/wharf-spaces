import React from 'react';
import * as hooks from '@state/utils/hooks';
import LoadingContainer from './LoadingContainer';
import {render} from '@testing-library/react-native';
import {TestWrapper} from '@components/TestWrapper';
import {Text} from '@gluestack-ui/themed';

describe('When LoadingContainer is rendered on screen', () => {
  let SomeChild: () => React.JSX.Element;
  beforeEach(() => {
    SomeChild = () => <Text testID="this is a child">text</Text>;
    jest.clearAllMocks();
  });

  it('renders correctly with child when loading is false', () => {
    jest.spyOn(hooks, 'useAppSelector').mockReturnValue({isLoading: false});

    const {queryByTestId, getByTestId} = render(
      <TestWrapper>
        <LoadingContainer>
          <SomeChild />
        </LoadingContainer>
      </TestWrapper>,
    );
    expect(getByTestId('this is a child')).toBeTruthy();
    expect(queryByTestId('loadingSpinner')).toBeNull();
  });

  it('renders spinner with child when loading is true', () => {
    jest.spyOn(hooks, 'useAppSelector').mockReturnValue({isLoading: true});

    const {getByTestId} = render(
      <TestWrapper>
        <LoadingContainer>
          <SomeChild />
        </LoadingContainer>
      </TestWrapper>,
    );
    expect(getByTestId('this is a child')).toBeTruthy();
    expect(getByTestId('loadingSpinner')).toBeTruthy();
  });
});
