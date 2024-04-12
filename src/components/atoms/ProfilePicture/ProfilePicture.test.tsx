import React from 'react';
import {TestWrapper} from '@components/TestWrapper';
import {render} from '@testing-library/react-native';
import ProfilePicture from './ProfilePicture';

describe('When ProfilePicture is on screen ', () => {
  it('Renders Correctly', () => {
    const {getByTestId} = render(
      <TestWrapper>
        <ProfilePicture uri="test" showBorder={false} />
      </TestWrapper>,
    );

    expect(getByTestId('ProfilePicture')).toBeTruthy();
  });

  it('Shows a green border when showBorder is true', () => {
    const {getByTestId} = render(
      <TestWrapper>
        <ProfilePicture uri="test" showBorder={true} />
      </TestWrapper>,
    );

    expect(getByTestId('ProfilePicture').props.style.borderWidth).toBe(2);
  });

  it('Does not show a green border when showBorder is false', () => {
    const {getByTestId} = render(
      <TestWrapper>
        <ProfilePicture uri="test" showBorder={false} />
      </TestWrapper>,
    );

    expect(getByTestId('ProfilePicture').props.style.borderWidth).toBe(0);
  });
});
