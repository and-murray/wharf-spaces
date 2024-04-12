import React from 'react';
import {TestWrapper} from '@components/TestWrapper';
import {render} from '@testing-library/react-native';
import ProfilePicture from './ProfilePicture';
import {parseGluestackComponentStyleProps} from '@root/src/util/GluestackUtils/GluestackUtils';

describe('When ProfilePicture is on screen ', () => {
  it('Renders Correctly', () => {
    const {findByTestId} = render(
      <TestWrapper>
        <ProfilePicture uri="test" showBorder={false} />
      </TestWrapper>,
    );

    findByTestId('ProfilePictures');
  });

  it('Shows a green border when showBorder is true', () => {
    const {getByTestId} = render(
      <TestWrapper>
        <ProfilePicture uri="test" showBorder={true} />
      </TestWrapper>,
    );

    const styleProps = parseGluestackComponentStyleProps(
      getByTestId('ProfilePicture').props.style,
    );

    expect(styleProps.borderWidth).toBe(2);
  });

  it('Does not show a green border when showBorder is false', () => {
    const {getByTestId} = render(
      <TestWrapper>
        <ProfilePicture uri="test" showBorder={false} />
      </TestWrapper>,
    );

    const styleProps = parseGluestackComponentStyleProps(
      getByTestId('ProfilePicture').props.style,
    );

    expect(styleProps.borderWidth).toBe(0);
  });
});
