import {Timestamp} from 'firebase-admin/firestore';
import {BusinessUnit, Role} from '../types/user';

export const userStub = {
  id: '001',
  firstName: 'Captain',
  lastName: 'Jest',
  email: 'captain.jest@test.com',
  profilePicUrl: 'pic.png',
  role: Role.user,
  businessUnit: BusinessUnit.murray,
  createdAt: Timestamp.now(),
  updatedAt: Timestamp.now(),
};

export const userStateStub = {
  user: userStub,
  activeBookingDates: [],
};

export const utilsStateStub = {
  londonServerTimestamp: '2024-07-05T00:00:00',
  storedDeviceTimestamp: '2024-07-05T00:00:00',
};

export const firebaseRemoteConfigStub = {
  deskCapacity: 10,
  parkingCapacity: {murray: 20, tenzing: 5, adams: 5, unknown: 0},
  isDemoLoginEnabled: false,
  featureFlags: undefined,
};
