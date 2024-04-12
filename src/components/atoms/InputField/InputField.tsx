import {Input, Box, ScrollView} from 'native-base';
import React from 'react';

type inputFieldProps = {
  text: string;
  setText: React.Dispatch<React.SetStateAction<string>>;
  testID: string;
};

const InputField = ({text, setText, testID}: inputFieldProps) => {
  return (
    <Box
      borderRadius="xl"
      borderWidth={'1px'}
      overflow={'hidden'}
      height={text.length < 50 ? '50px' : text.length < 200 ? '100px' : '150px'}
      borderColor={'other.grey'}
      backgroundColor={'other.lightGrey'}
      justifyContent={'center'}>
      <ScrollView keyboardShouldPersistTaps="handled">
        <Input
          fontSize={15}
          defaultValue={text}
          numberOfLines={text.length < 50 ? 1 : text.length < 200 ? 4 : 8}
          size={'sm'}
          multiline={true}
          onChangeText={newText => setText(newText)}
          variant={'unstyled'}
          selectionColor={'brand.red'}
          testID={testID}
        />
      </ScrollView>
    </Box>
  );
};

export default InputField;
