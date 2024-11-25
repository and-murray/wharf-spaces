import React from 'react';
import {fireEvent, render} from '@testing-library/react-native';
import EventModal from './EventModal';
import {TestWrapper} from '@components/TestWrapper';
import * as Warning from '@atoms/Warning/Warning';
import * as hooks from '@state/utils/hooks';

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
    jest.spyOn(hooks, 'useAppSelector').mockReturnValue({
      selectedDay: '2023-01-01',
      notes: [
        {
          createdAt: {_nanoseconds: 212000000, _seconds: 1683735476},
          date: '2023-01-01',
          isClubhouseClosed: false,
          text: "This is a dummy note - EventModal just needs to know that a note exists for the day so it doesn't reset the text field value to an empty string",
          updatedAt: {_nanoseconds: 604000000, _seconds: 1683737545},
          uuid: 'b0b6646f-0c69-479b-8ba4-b6bacf90e66d',
        },
      ],
    });

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
