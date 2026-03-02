import {Timestamp} from 'firebase-admin/firestore';
import {getFirestoreUser} from './getFirestoreUser';

let mockDoc = jest.fn();
let mockGet = jest.fn();
const mockWhere = jest.fn(() => ({
  get: mockGet,
}));
const mockCollection = jest.fn(() => ({
  doc: mockDoc,
  where: mockWhere,
}));
jest.mock('firebase-admin', () => ({
  initializeApp: jest.fn(),
  firestore: () => ({
    collection: mockCollection,
  }),
}));

describe('getFirestoreUser is called', () => {
    describe('with a user id that exists', () => {
        beforeEach(() => {
            mockGet = jest.fn(() => ({
                exists: true,
                data: jest.fn().mockReturnValue({
                id: 'testUid',
                firstName: 'Test',
                lastName: 'User',
                email: 'test@example.com',
                profilePicUrl: 'https://example.com/test-photo.jpg',
                role: 'user',
                businessUnit: 'murray',
                updatedAt: new Timestamp(0, 0),
                createdAt: new Timestamp(0, 0),
                }),
            }));
            mockDoc = jest.fn(() => ({
                get: mockGet,
            }));
        });
        it('returns the user data', async () => {
        let response = await getFirestoreUser('testUid');
        expect(response).toEqual({
            id: 'testUid',
            firstName: 'Test',
            lastName: 'User',
            email: 'test@example.com',
            profilePicUrl: 'https://example.com/test-photo.jpg',
            role: 'user',
            businessUnit: 'murray',
            updatedAt: new Timestamp(0, 0),
            createdAt: new Timestamp(0, 0),
        });
        });
    });
    describe('with a user id that does not exist', () => {
        beforeEach(() => {
            mockGet = jest.fn(() => ({
                exists: false,
                data: jest.fn(),
            }));
            mockDoc = jest.fn(() => ({
                get: mockGet,
            }));
        });
        it('returns undefined', async () => {
            try {
                await getFirestoreUser('testUid');
            } catch (error) {
                const expected = new Error('User does not exist');
                expect(error).toStrictEqual(expected);
            }
        });
    });
});
