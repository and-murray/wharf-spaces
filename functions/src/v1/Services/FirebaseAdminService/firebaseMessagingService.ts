import admin from 'firebase-admin';
import {CollectionName} from '../CollectionName';
import {User} from '../../Models/booking.model';
import {arrayRemove} from '../../utils/ArrayUtils/ArrayUtils';

type HandleNotificationProps = {
  message: {notification: {title: string; body: string}; tokens: string[]};
  userRef: admin.firestore.DocumentReference<admin.firestore.DocumentData>;
};

type MessageBody = {notification: {title: string; body: string}};

const sendNotifications = async (
  getMessageBody: () => MessageBody,
  userIds: string[],
) => {
  if (userIds.length < 1) {
    return Promise.reject();
  }
  const {notification} = getMessageBody();
  if (!notification.body) {
    return Promise.reject();
  }

  const uniqueUserIds = [...new Set(userIds)];
  const db = admin.firestore();
  return Promise.all(
    uniqueUserIds.map(async userId => {
      const userDoc = await db
        .collection(CollectionName.users)
        .doc(userId)
        .get();
      const userData = userDoc.data() as User;
      if (userData.tokens && userDoc.ref) {
        const message = {
          notification,
          tokens: userData.tokens,
        };
        handleNotification({message, userRef: userDoc.ref});
      }
    }),
  );
};

const handleNotification = async ({
  message,
  userRef,
}: HandleNotificationProps) => {
  const {tokens} = message;
  const result = await admin
    .messaging()
    .sendEachForMulticast({...message, android: {priority: 'high'}});

  if (result.failureCount > 0) {
    const db = admin.firestore();
    const batch = db.batch();
    result.responses.forEach((response, index) => {
      switch (response.error?.code) {
        case 'messaging/invalid-argument':
        case 'messaging/registration-token-not-registered':
        case 'messaging/invalid-recipient':
          batch.update(userRef, {
            tokens: arrayRemove(tokens[index]),
          });
          break;
        default:
          break;
      }
    });
    batch.commit();
  }
};

export default sendNotifications;
