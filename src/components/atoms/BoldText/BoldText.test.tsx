import React from 'react';
import {render} from '@testing-library/react-native';
import {TestWrapper} from '@components/TestWrapper';
import BoldText from './BoldText';
import {isArray} from 'lodash';

describe('BoldText boldness', () => {
  it('should render correctly', () => {
    const {getByText} = render(
      <TestWrapper>
        <BoldText>This is bold text</BoldText>
      </TestWrapper>,
    );
    const boldTextNode = getByText('This is bold text');
    const mergedStyle = mergeStyles(boldTextNode.props.style);
    expect(mergedStyle.fontWeight).toBe('bold');
  });
});

type BoldFontType = {
  fontWeight: string | undefined;
};
const mergeStyles = (styles: unknown): BoldFontType => {
  if (!isArray(styles)) {
    return styles as BoldFontType;
  }

  let merged = {} as BoldFontType;
  if (styles.length > 0) {
    styles.forEach(style => {
      merged = {...merged, ...style};
    });
  }
  return merged;
};
