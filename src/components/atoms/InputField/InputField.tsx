import {
  Box,
  Input,
  ScrollView,
  InputField as InputFieldGS,
} from '@gluestack-ui/themed';
import React from 'react';

type inputFieldProps = {
  text: string;
  setText: React.Dispatch<React.SetStateAction<string>>;
  testID: string;
};

const InputField = ({text, setText, testID}: inputFieldProps) => {
  return (
    <Box
      borderRadius="$xl"
      borderWidth="$1"
      overflow="hidden"
      height={text.length < 50 ? 50 : text.length < 200 ? 100 : 150}
      borderColor="$otherGrey"
      backgroundColor="$otherLightGrey"
      justifyContent="center">
      <ScrollView keyboardShouldPersistTaps="handled">
        <Input size="sm" testID={testID}>
          <InputFieldGS
            defaultValue={text}
            multiline={true}
            numberOfLines={text.length < 50 ? 1 : text.length < 200 ? 4 : 8}
            onChangeText={newText => setText(newText)}
            selectionColor="$brandRed"
          />
        </Input>
      </ScrollView>
    </Box>
  );
};

export default InputField;
