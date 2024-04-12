import {render, fireEvent} from '@testing-library/react-native';
import React from 'react';
import DayTimeSelector from '@atoms/DayTimeSelector/DayTimeSelector';
import {TestWrapper} from '@components/TestWrapper';
import {TimeSlot} from '@customTypes/booking';

const mockFn = jest.fn();
const itemId = 100;
describe('When DayTimeSelector is on the screen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    const {getByText} = render(
      <TestWrapper>
        <DayTimeSelector
          heading={'This is a test'}
          update={mockFn}
          capacity={36}
          id={0}
          isSelected={false}
          timeSlot={TimeSlot.am}
          isBooked={false}
        />
      </TestWrapper>,
    );

    expect(getByText('This is a test')).toBeTruthy();
  });

  it('will show CheckDisplayAsFull element when not a booked day', () => {
    const {getByTestId} = render(
      <TestWrapper>
        <DayTimeSelector
          heading={'This is a test'}
          update={mockFn}
          id={itemId}
          isSelected={true}
          capacity={36}
          spaceLeft={0}
          timeSlot={TimeSlot.am}
          isBooked={false}
        />
      </TestWrapper>,
    );
    expect(getByTestId('DayTimeSelectorSubheading-100')).toBeTruthy();
  });

  it('will have a green colouration when the user has booked the day and a check icon', () => {
    const {getByTestId} = render(
      <TestWrapper>
        <DayTimeSelector
          heading={'This is a test'}
          update={mockFn}
          id={itemId}
          isSelected={true}
          capacity={36}
          spaceLeft={0}
          timeSlot={TimeSlot.am}
          isBooked={true}
        />
      </TestWrapper>,
    );
    expect(getByTestId('DayTimeSelectorHeading-100').props.style.color).toBe(
      '#43A813',
    );
    expect(
      getByTestId('DayTimeSelectorPressable-100').props.style.borderWidth,
    ).toBe(2);
  });

  describe('When not selected', () => {
    it('should set the correct styling', () => {
      const {getByText} = render(
        <TestWrapper>
          <DayTimeSelector
            update={mockFn}
            capacity={0}
            id={itemId}
            heading={'This is a test'}
            timeSlot={TimeSlot.am}
            isSelected={false}
            isBooked={false}
          />
        </TestWrapper>,
      );
      fireEvent.press(getByText('This is a test'));
      expect(mockFn).toBeCalled();
      expect(mockFn).toBeCalledWith(itemId);
      expect(mockFn).toBeCalledTimes(1);
    });
  });

  describe('When selected', () => {
    it('handles on press correctly', () => {
      const {getByText} = render(
        <TestWrapper>
          <DayTimeSelector
            heading={'This is a test'}
            update={mockFn}
            capacity={36}
            id={itemId}
            isSelected={false}
            timeSlot={TimeSlot.am}
            isBooked={false}
          />
        </TestWrapper>,
      );
      fireEvent.press(getByText('This is a test'));
      expect(mockFn).toBeCalled();
      expect(mockFn).toBeCalledWith(itemId);
      expect(mockFn).toBeCalledTimes(1);
    });
    it('will show CheckDisplayAsFull element when not a booked day', () => {
      const {getByTestId} = render(
        <TestWrapper>
          <DayTimeSelector
            heading={'This is a test'}
            update={mockFn}
            id={itemId}
            isSelected={true}
            capacity={36}
            spaceLeft={0}
            timeSlot={TimeSlot.am}
            isBooked={false}
          />
        </TestWrapper>,
      );
      expect(getByTestId('DayTimeSelectorSubheading-100')).toBeTruthy();
    });

    it('will have a green colouration when the user has booked the day and a check icon', () => {
      const {getByTestId} = render(
        <TestWrapper>
          <DayTimeSelector
            heading={'This is a test'}
            update={mockFn}
            id={itemId}
            isSelected={true}
            capacity={36}
            spaceLeft={0}
            timeSlot={TimeSlot.am}
            isBooked={true}
          />
        </TestWrapper>,
      );
      expect(getByTestId('DayTimeSelectorHeading-100').props.style.color).toBe(
        '#43A813',
      );
      expect(
        getByTestId('DayTimeSelectorPressable-100').props.style.borderColor,
      ).toBe('#43A813');
      expect(getByTestId('SelectableDateTick')).toBeTruthy();
    });

    it('should set the correct styling', () => {
      const {getByTestId} = render(
        <TestWrapper>
          <DayTimeSelector
            update={() => {}}
            capacity={0}
            id={1}
            heading={''}
            timeSlot={TimeSlot.am}
            isSelected={true}
            isBooked={false}
          />
        </TestWrapper>,
      );
      expect(
        getByTestId('DayTimeSelectorPressable-1').props.style.borderWidth,
      ).toBe(2);
    });
  });
});
