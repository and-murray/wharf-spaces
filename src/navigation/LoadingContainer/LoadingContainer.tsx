import React, {ReactNode} from 'react';
import {useAppSelector} from '@state/utils/hooks';
import {Dimensions} from 'react-native';
import {Center, Spinner} from '@gluestack-ui/themed';

type CustomComponentProps = {
  children: ReactNode;
};

const LoadingContainer = ({children}: CustomComponentProps) => {
  const {isLoading} = useAppSelector(state => state.loading);
  const {width, height} = Dimensions.get('window');

  return (
    <>
      {children}
      {isLoading && (
        <Center
          bg="$otherLightGrey"
          opacity={0.5}
          position="absolute"
          height={height}
          width={width}>
          <Spinner
            accessibilityLabel="Loading screen"
            size="large"
            color="$brandCharcoal"
            testID="loadingSpinner"
          />
        </Center>
      )}
    </>
  );
};

export default LoadingContainer;
