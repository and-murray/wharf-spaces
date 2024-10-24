import {FirebaseFirestoreTypes} from '@react-native-firebase/firestore';

type User = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  profilePicUrl: string;
  role: Role;
  businessUnit: BusinessUnit;
  createdAt:
    | FirebaseFirestoreTypes.Timestamp
    | FirebaseFirestoreTypes.FieldValue;
  updatedAt:
    | FirebaseFirestoreTypes.Timestamp
    | FirebaseFirestoreTypes.FieldValue;
};

export enum Role {
  user = 'user',
  admin = 'admin',
  demo = 'demo',
}

export enum BusinessUnit {
  murray = 'murray',
  tenzing = 'tenzing',
  adams = 'adams',
  unknown = 'unknown',
}

export default User;
