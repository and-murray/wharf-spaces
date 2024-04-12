import 'react-native';
import React from 'react';
import EventList from './EventList';
import {render} from '@testing-library/react-native';
import {TestWrapper} from '@components/TestWrapper';

it('renders EventList organism in correct manner with no currentEvents passed', () => {
  const {getByText} = render(
    <TestWrapper>
      <EventList currentEvent="" hasEvent={false} />
    </TestWrapper>,
  );
  expect(getByText('Events in the clubhouse')).toBeTruthy();
});

it('renders EventList with full list of events list passed in if passed Current Events', () => {
  const expectedEvents = {
    createdAt: {_nanoseconds: 883000000, _seconds: 1683914053},
    date: '2023-05-17',
    isClubhouseClosed: false,
    text: 'Test event',
    updatedAt: {_nanoseconds: 940000000, _seconds: 1684157087},
    uuid: '1c140fe7-35dd-4d01-aa77-81d251c732a0',
  };
  const {getByText} = render(
    <TestWrapper>
      <EventList currentEvent={expectedEvents.text} hasEvent={true} />
    </TestWrapper>,
  );
  expect(getByText(expectedEvents.text)).toBeTruthy();
});
