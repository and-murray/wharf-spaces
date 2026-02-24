import React, {ReactNode} from 'react';
import {useAppSelector} from '@state/utils/hooks';
import {Spinner, Center} from '@gluestack-ui/themed-native-base';
import {Dimensions} from 'react-native';

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
          bg={'other.lightGrey'}
          opacity={0.5}
          position="absolute"
          h={height}
          w={width}>
          <Spinner
            accessibilityLabel="Loading screen"
            size="lg"
            color="brand.charcoal"
            testID="loadingSpinner"
          />
        </Center>
      )}
    </>
  );
};

export default LoadingContainer;
