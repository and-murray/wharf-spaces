import {CollectionReference} from 'firebase-admin/firestore';
import {chunk} from '../ArrayUtils/ArrayUtils';

export async function chunkQuery<M>(
  docRef: CollectionReference,
  field: string | FirebaseFirestore.FieldPath,
  values: Array<string>,
) {
  const querySections = await Promise.all(
    chunk(values, 10).map(chunkedArray => {
      return docRef.where(field, 'in', chunkedArray).get();
    }),
  );
  return querySections
    .flatMap(querySection => querySection.docs)
    .map(documentData => ({
      docRef: documentData.ref,
      data: documentData.data() as M,
    }));
}
