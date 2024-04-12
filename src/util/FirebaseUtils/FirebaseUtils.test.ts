import {FirebaseFirestoreTypes} from '@react-native-firebase/firestore';
import {calculateNewUserIds, chunkQuery} from './FirebaseUtils';
import {chunk} from '../ArrayUtils/ArrayUtils';
import Booking, {BookingType, SpaceType, TimeSlot} from '@customTypes/booking';

jest.mock('../ArrayUtils/ArrayUtils', () => ({
  chunk: jest.fn(),
}));

describe('FirebaseUtils tests', () => {
  describe('chunkQuery tests', () => {
    const mockWhere = jest.fn().mockReturnThis();
    const mockGet = jest.fn();

    const mockDocRef = {
      where: mockWhere,
      get: mockGet,
    } as Partial<FirebaseFirestoreTypes.CollectionReference> as FirebaseFirestoreTypes.CollectionReference;

    const mockQuerySection = {
      docs: [],
    } as Partial<FirebaseFirestoreTypes.QuerySnapshot> as FirebaseFirestoreTypes.QuerySnapshot;

    const mockDocumentData = {
      data: jest.fn().mockReturnValue('DocumentData'),
    } as Partial<
      FirebaseFirestoreTypes.QueryDocumentSnapshot<FirebaseFirestoreTypes.DocumentData>
    > as FirebaseFirestoreTypes.QueryDocumentSnapshot<FirebaseFirestoreTypes.DocumentData>;

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should chunk the values and call where().get() for each chunk', async () => {
      const mockValues = ['value1', 'value2', 'value3', 'value4'];
      const mockChunkedArray1 = mockValues.slice(0, 2);
      const mockChunkedArray2 = mockValues.slice(2, 4);
      const mockQuerySection1 = {
        ...mockQuerySection,
        docs: [mockDocumentData],
      } as FirebaseFirestoreTypes.QuerySnapshot;
      const mockQuerySection2 = {
        ...mockQuerySection,
        docs: [mockDocumentData],
      } as FirebaseFirestoreTypes.QuerySnapshot;

      (chunk as jest.Mock).mockReturnValueOnce([
        mockChunkedArray1,
        mockChunkedArray2,
      ]);
      mockGet
        .mockResolvedValueOnce(mockQuerySection1)
        .mockResolvedValueOnce(mockQuerySection2);

      await chunkQuery(mockDocRef, 'field', mockValues);

      expect(chunk).toHaveBeenCalledWith(mockValues, 10);
      expect(mockWhere).toHaveBeenNthCalledWith(
        1,
        'field',
        'in',
        mockChunkedArray1,
      );
      expect(mockWhere).toHaveBeenNthCalledWith(
        2,
        'field',
        'in',
        mockChunkedArray2,
      );
      expect(mockWhere).toHaveBeenCalledTimes(2);
      expect(mockGet).toHaveBeenCalledTimes(2);
    });

    it('should return an empty array if no documents are found', async () => {
      const mockValues = ['value1', 'value2'];
      const mockChunkedArray = ['value1', 'value2'];

      (chunk as jest.Mock).mockReturnValueOnce([mockChunkedArray]);
      mockGet.mockResolvedValueOnce(mockQuerySection);

      const result = await chunkQuery(mockDocRef, 'field', mockValues);

      expect(result).toEqual([]);
    });

    it('should return an array of document data', async () => {
      const mockValues = ['value1', 'value2'];
      const mockChunkedArray = ['value1', 'value2'];
      const mockQuerySection1 = {
        ...mockQuerySection,
        docs: [mockDocumentData, mockDocumentData],
      } as FirebaseFirestoreTypes.QuerySnapshot;

      (chunk as jest.Mock).mockReturnValueOnce([mockChunkedArray]);
      mockGet.mockResolvedValueOnce(mockQuerySection1);

      const result = await chunkQuery(mockDocRef, 'field', mockValues);

      expect(result).toEqual(['DocumentData', 'DocumentData']);
      expect(mockDocumentData.data).toHaveBeenCalledTimes(2);
    });
  });

  describe('calculateNewUserIds tests', () => {
    const mockBookings: Booking[] = [
      {
        date: Date(),
        timeSlot: TimeSlot.allDay,
        bookingType: BookingType.personal,
        spaceType: SpaceType.desk,
        isReserveSpace: false,
        userId: 'testUserId1',
        createdAt: 0,
        updatedAt: 0,
        id: 'testId1',
      },
      {
        date: Date(),
        timeSlot: TimeSlot.allDay,
        bookingType: BookingType.personal,
        spaceType: SpaceType.desk,
        isReserveSpace: false,
        userId: 'testUserId2',
        createdAt: 0,
        updatedAt: 0,
        id: 'testId2',
      },
      {
        date: Date(),
        timeSlot: TimeSlot.allDay,
        bookingType: BookingType.personal,
        spaceType: SpaceType.desk,
        isReserveSpace: false,
        userId: 'testUserId3',
        createdAt: 0,
        updatedAt: 0,
        id: 'testId3',
      },
    ];

    const mockUserData = {
      ['testUserId1']: {
        name: 'TestUser1',
        profilePictureURI: 'TestImage1',
        businessUnit: 'murray',
      },
      ['testUserId2']: {
        name: 'TestUser2',
        profilePictureURI: 'TestImage2',
        businessUnit: 'tenzing',
      },
    };
    it('should return an empty array if no bookings provided', () => {
      const result = calculateNewUserIds([], mockUserData);
      expect(result).toEqual([]);
    });

    it('should return an empty array if all booking userIds are already in mockUserData', () => {
      const result = calculateNewUserIds(
        mockBookings.slice(0, 1),
        mockUserData,
      );
      expect(result).toEqual([]);
    });

    it('should return an array with new userIds not present in mockUserData', () => {
      const result = calculateNewUserIds(mockBookings, mockUserData);
      expect(result).toEqual(['testUserId3']);
    });
  });
});
