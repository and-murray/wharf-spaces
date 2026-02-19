import {db} from './Database';
import {CollectionName} from './CollectionName';
import {User} from '@customTypes';
import {chunkQuery} from '@utils/FirebaseUtils/FirebaseUtils';
import {ReducedUserData} from '@customTypes/ReducedUserData';

export const getUsers = async (userIds: string[]): Promise<ReducedUserData> => {
  const uniqueUserIds = [...new Set(userIds)];
  const collectionReference = db.collection(CollectionName.users);
  const userData = await chunkQuery<User>(
    collectionReference,
    'id',
    uniqueUserIds,
  );

  const reducedUserData: ReducedUserData = userData.reduce(
    (accumulator, currentValue) => {
      return {
        ...accumulator,
        [currentValue.id]: {
          name: [currentValue.firstName, currentValue.lastName].join(' '),
          profilePictureURI: currentValue.profilePicUrl,
          businessUnit: currentValue.businessUnit,
        },
      };
    },
    {},
  );
  return reducedUserData;
};
