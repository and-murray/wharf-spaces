import React from 'react';
import {fireEvent, render} from '@testing-library/react-native';
import EventModal from './EventModal';
import {TestWrapper} from '@components/TestWrapper';
import * as Warning from '@atoms/Warning/Warning';

const warningSpy = jest.spyOn(Warning, 'default');
const setEventModal = jest.fn();
describe('When the event modal is on the screen', () => {
  beforeEach(() => {
    warningSpy.mockReturnValue(<></>);
  });

  it('SHOULD render the UI correctly', () => {
    const {getByTestId} = render(
      <TestWrapper>
        <EventModal
          showEventModal={true}
          setShowEventModal={setEventModal}
          modalHeader={'Add Event'}
          currentEvent={'Test event'}
          hasEvent={true}
          selectedDate={''}
          warningMessage={'WarningMessage'}
          eventDocumentId={''}
        />
      </TestWrapper>,
    );

    expect(getByTestId('close-button')).toBeTruthy();
    expect(getByTestId('save-button')).toBeTruthy();
    expect(warningSpy).toBeCalledWith(
      expect.objectContaining({
        warningMessage: 'WarningMessage',
      }),
      {},
    );
  });
  it('SHOULD exit the modal WHEN the close button is pressed', () => {
    const {getByTestId} = render(
      <TestWrapper>
        <EventModal
          showEventModal={true}
          setShowEventModal={setEventModal}
          modalHeader={'Add Event'}
          currentEvent={'Test event'}
          hasEvent={false}
          selectedDate={''}
          warningMessage={''}
          eventDocumentId={''}
        />
      </TestWrapper>,
    );

    const closeButton = getByTestId('close-button');
    fireEvent.press(closeButton);
    expect(setEventModal).toHaveBeenCalled();
  });

  it('SHOULD display event text in input field if event exists', () => {
    const {getByTestId} = render(
      <TestWrapper>
        <EventModal
          showEventModal={true}
          setShowEventModal={setEventModal}
          modalHeader={'Add Event'}
          currentEvent={'Test event'}
          hasEvent={true}
          selectedDate={''}
          warningMessage={''}
          eventDocumentId={''}
        />
      </TestWrapper>,
    );

    const inputField = getByTestId('event-input-field');
    expect(inputField.props.defaultValue).toEqual('Test event');
  });
});
