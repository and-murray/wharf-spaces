import React, {ReactNode} from 'react';
import {useAppDispatch, useAppSelector} from '@state/utils/hooks';
import {setShowError} from '@state/reducers/ErrorSlice';
import {Alert, Center, Pressable, Text} from '@gluestack-ui/themed';

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
          height="$full"
          width="$full"
          backgroundColor="$otherBlackTransparent">
          <Alert width="70%" action="error" borderRadius={10}>
            <Text fontFamily="$body" fontWeight="$medium" size="md">
              Something went wrong
            </Text>
            <Text fontFamily="$body" fontWeight="$medium" size="md">
              Please try again
            </Text>
            <Pressable
              onPress={() => {
                dispatch(setShowError(false));
              }}
              marginTop={4}
              padding={2}
              borderRadius={4}
              backgroundColor="$otherGreyDark">
              <Text
                fontFamily="$body"
                fontWeight="$medium"
                size="md"
                color="$brandWhite">
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
