import {mockFirestoreCollection} from '@root/setup-jest';
import {getBookingsOnTheDate} from '@firebase/firestore';
import {SpaceType} from '@customTypes/booking';

describe('getBookingsCollection request calls', () => {
  const mockOnSnapshot = jest.fn();

  mockFirestoreCollection.mockImplementation(() => ({
    where: jest.fn().mockReturnValue({
      where: jest.fn().mockReturnThis(),
      onSnapshot: mockOnSnapshot,
    }),
  }));

  it('gets desk booking collection', () => {
    expect(mockFirestoreCollection).toHaveBeenCalledTimes(0);
    getBookingsOnTheDate('', _bookings => {});
    expect(mockFirestoreCollection).toHaveBeenCalledTimes(1);
  });

  it('request desk bookings and on success, callback gets triggered and returns bookings ', () => {
    const firestoreTime = {seconds: 0};
    const bookingData = {
      date: '2023-05-07',
      spaceType: SpaceType.desk,
      updatedAt: {...firestoreTime},
      createdAt: {...firestoreTime},
    };
    const mockedBookings = {docs: [{data: () => bookingData}]};
    mockOnSnapshot.mockImplementationOnce(onNext => onNext(mockedBookings));
    getBookingsOnTheDate('', bookings => {
      expect(bookings.length).toBe(1);
      expect(bookings[0].date).toBe('2023-05-07');
    });
    expect(mockFirestoreCollection).toHaveBeenCalledTimes(1);
  });
});
