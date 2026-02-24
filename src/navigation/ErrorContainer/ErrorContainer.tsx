import React, {ReactNode} from 'react';
import {Alert, Center, Pressable, Text} from '@gluestack-ui/themed-native-base';
import {useAppDispatch, useAppSelector} from '@state/utils/hooks';
import {setShowError} from '@state/reducers/ErrorSlice';

type CustomComponentProps = {
  children: ReactNode;
};

const ErrorContainer = ({children}: CustomComponentProps) => {
  const {showError} = useAppSelector(state => state.error);
  const dispatch = useAppDispatch();

  return (
    <>
      {children}
      {showError && (
        <Center
          position="absolute"
          h="100%"
          w="100%"
          backgroundColor={'other.blackTransparent'}>
          <Alert width="70%" status="error" borderRadius={10}>
            <Text
              fontFamily={'body'}
              fontWeight={500}
              fontStyle={'normal'}
              fontSize={16}>
              Something went wrong
            </Text>
            <Text
              fontFamily={'body'}
              fontWeight={500}
              fontStyle={'normal'}
              fontSize={16}>
              Please try again
            </Text>
            <Pressable
              onPress={() => {
                dispatch(setShowError(false));
              }}
              marginTop={4}
              padding={2}
              borderRadius={4}
              backgroundColor="other.greyDark">
              <Text
                fontFamily={'body'}
                fontWeight={500}
                fontStyle={'normal'}
                fontSize={16}
                color="brand.white">
                Okay
              </Text>
            </Pressable>
          </Alert>
        </Center>
      )}
    </>
  );
};

export default ErrorContainer;
