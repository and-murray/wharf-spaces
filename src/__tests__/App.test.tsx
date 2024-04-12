import 'react-native';
import React from 'react';
import App from '@root/App';
import {render} from '@testing-library/react-native';
import * as checkAppIntegrity from '../util/FirebaseUtils/FirebaseUtils';

jest.mock('react-native-bootsplash', () => {});
const checkAppIntegritySpy = jest.spyOn(checkAppIntegrity, 'checkAppIntegrity');

describe('App Test', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    checkAppIntegritySpy.mockImplementation(jest.fn());
  });
  it('renders correctly', () => {
    render(<App />);
  });
});
