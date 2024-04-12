import 'react-native';
import React from 'react';
import EventViewer from './EventViewer';
import {render} from '@testing-library/react-native';
import {TestWrapper} from '@components/TestWrapper';
import * as hooks from '@state/utils/hooks';
import * as eventList from '@molecules/EventList/EventList';
import {mockFirestoreCollection} from '@root/setup-jest';
import subscribeToNotesCollection from '@firebase/firestore/subscribeToNotesCollection';

describe('WHEN a day is selected and event viewer is on the screen', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  let eventListMock = jest.spyOn(eventList, 'default').mockReturnValue(<></>);

  const mockOnSnapshot = jest.fn();
  const mockDispatch = jest.fn();

  mockFirestoreCollection.mockImplementation(() => ({
    where: jest.fn().mockReturnValue({
      onSnapshot: mockOnSnapshot,
    }),
  }));

  it('it SHOULD fetch the notes collection ', () => {
    expect(mockFirestoreCollection).toHaveBeenCalledTimes(0);
    subscribeToNotesCollection('2023-01-01', mockDispatch);
    expect(mockFirestoreCollection).toHaveBeenCalledTimes(1);
  });

  it('SHOULD request notes collection and triggers callback on success', () => {
    const notesData = {
      createdAt: {_nanoseconds: 0, _seconds: 0},
      updatedAt: {_nanoseconds: 0, _seconds: 0},
      date: '2023-01-01',
      isClubhouseClosed: false,
      text: 'Test note',
      uuid: '123456',
    };
    const mockedSnapshot = {
      docs: [{data: () => notesData}],
    };
    mockOnSnapshot.mockImplementationOnce(callback => callback(mockedSnapshot));

    subscribeToNotesCollection('2023-05-07', mockDispatch);

    expect(mockFirestoreCollection).toHaveBeenCalledTimes(1);
  });

  it('SHOULD render EventViewer organism WHEN day in store is set', () => {
    jest.spyOn(hooks, 'useAppSelector').mockReturnValue({
      selectedDay: '2023-01-01',
      notes: [
        {
          createdAt: {_nanoseconds: 212000000, _seconds: 1683735476},
          date: '2023-01-01',
          isClubhouseClosed: false,
          text: 'Test event',
          updatedAt: {_nanoseconds: 604000000, _seconds: 1683737545},
          uuid: 'b0b6646f-0c69-479b-8ba4-b6bacf90e66d',
        },
      ],
    });

    const {getByTestId} = render(
      <TestWrapper>
        <EventViewer />
      </TestWrapper>,
    );

    expect(getByTestId('EventViewerTestID')).toBeTruthy();
    expect(eventListMock).toHaveBeenCalled();
  });

  it('SHOULD render partial EventViewer organism WHEN day in store is not set', () => {
    jest.spyOn(hooks, 'useAppSelector').mockReturnValue({
      selectedDay: null,
      notes: [
        {
          createdAt: {_nanoseconds: 212000000, _seconds: 1683735476},
          date: '2023-01-01',
          isClubhouseClosed: false,
          text: 'Test event fri edit 3',
          updatedAt: {_nanoseconds: 604000000, _seconds: 1683737545},
          uuid: 'b0b6646f-0c69-479b-8ba4-b6bacf90e66d',
        },
      ],
    });
    const {queryByTestId} = render(
      <TestWrapper>
        <EventViewer />
      </TestWrapper>,
    );
    expect(queryByTestId('EventViewerTestID')).not.toBeTruthy();
  });

  it('SHOULD get the current event WHEN a day in store is selected and there is events on that day', () => {
    jest.spyOn(hooks, 'useAppSelector').mockReturnValue({
      selectedDay: '2023-01-01',
      notes: [
        {
          createdAt: {_nanoseconds: 212000000, _seconds: 1683735476},
          date: '2023-01-01',
          isClubhouseClosed: false,
          text: 'Test event fri edit 3',
          updatedAt: {_nanoseconds: 604000000, _seconds: 1683737545},
          uuid: 'b0b6646f-0c69-479b-8ba4-b6bacf90e66d',
        },
      ],
    });
    const {getByTestId} = render(
      <TestWrapper>
        <EventViewer />
      </TestWrapper>,
    );
    expect(getByTestId('event-input-field')).toBeTruthy();
    const inputField = getByTestId('event-input-field');
    expect(inputField.props.defaultValue).toEqual('Test event fri edit 3');
  });

  it('renders EventViewControl organism when passed expected props', () => {
    jest.spyOn(hooks, 'useAppSelector').mockReturnValue({
      selectedDay: '2023-01-01',
      notes: [],
    });
    const {getAllByText} = render(
      <TestWrapper>
        <EventViewer />
      </TestWrapper>,
    );
    expect(getAllByText('Add Event')).toBeTruthy();
  });

  it('contains Add Events text when passed hasEvents is true', () => {
    jest.spyOn(hooks, 'useAppSelector').mockReturnValue({
      selectedDay: '2023-01-01',
      notes: [
        {
          createdAt: {_nanoseconds: 212000000, _seconds: 1683735476},
          date: '2023-01-01',
          isClubhouseClosed: false,
          text: 'Test event fri edit 3',
          updatedAt: {_nanoseconds: 604000000, _seconds: 1683737545},
          uuid: 'b0b6646f-0c69-479b-8ba4-b6bacf90e66d',
        },
      ],
    });
    const {getAllByText} = render(
      <TestWrapper>
        <EventViewer />
      </TestWrapper>,
    );
    expect(getAllByText('Edit Event(s)')).toBeTruthy();
  });
});
