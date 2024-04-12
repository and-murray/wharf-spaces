import {chunkQuery} from './FirebaseUtils';
import {chunk} from '../ArrayUtils/ArrayUtils';
import {
  CollectionReference,
  DocumentData,
  DocumentReference,
  QueryDocumentSnapshot,
  QuerySnapshot,
} from 'firebase-admin/firestore';

jest.mock('../ArrayUtils/ArrayUtils', () => ({
  chunk: jest.fn(),
}));
describe('chunkQuery', () => {
  const mockWhere = jest.fn().mockReturnThis();
  const mockGet = jest.fn();

  const mockCollectionRef = {
    where: mockWhere,
    get: mockGet,
  } as Partial<CollectionReference> as CollectionReference;

  const mockQuerySection = {
    docs: [],
  } as Partial<QuerySnapshot> as QuerySnapshot;

  const mockDocRef = 'DocRef' as Partial<
    DocumentReference<DocumentData>
  > as DocumentReference<DocumentData>;

  const mockDocumentData = {
    data: jest.fn().mockReturnValue('DocumentData'),
    ref: mockDocRef,
  } as Partial<
    QueryDocumentSnapshot<DocumentData>
  > as QueryDocumentSnapshot<DocumentData>;

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
    } as QuerySnapshot;
    const mockQuerySection2 = {
      ...mockQuerySection,
      docs: [mockDocumentData],
    } as QuerySnapshot;

    (chunk as jest.Mock).mockReturnValueOnce([
      mockChunkedArray1,
      mockChunkedArray2,
    ]);
    mockGet
      .mockResolvedValueOnce(mockQuerySection1)
      .mockResolvedValueOnce(mockQuerySection2);

    await chunkQuery(mockCollectionRef, 'field', mockValues);

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

    const result = await chunkQuery(mockCollectionRef, 'field', mockValues);

    expect(result).toEqual([]);
  });

  it('should return an array of document data', async () => {
    const mockValues = ['value1', 'value2'];
    const mockChunkedArray = ['value1', 'value2'];
    const mockQuerySection1 = {
      ...mockQuerySection,
      docs: [mockDocumentData, mockDocumentData],
    } as QuerySnapshot;

    (chunk as jest.Mock).mockReturnValueOnce([mockChunkedArray]);
    mockGet.mockResolvedValueOnce(mockQuerySection1);

    const result = await chunkQuery(mockCollectionRef, 'field', mockValues);

    expect(result).toEqual([
      {data: 'DocumentData', docRef: 'DocRef'},
      {data: 'DocumentData', docRef: 'DocRef'},
    ]);
    expect(mockDocumentData.data).toHaveBeenCalledTimes(2);
  });
});
