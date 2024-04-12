import admin from 'firebase-admin';

export const distinctFieldValues = <T, V>(
  array: T[],
  theValue: (item: T) => V,
) => {
  const uniqueValues: V[] = [];
  array.forEach(item => {
    const v = theValue(item);
    if (!uniqueValues.includes(v)) {
      uniqueValues.push(v);
    }
  });
  return uniqueValues;
};

export function chunk<M>(array: Array<M>, chunkSize: number) {
  const chunkedArray: Array<Array<M>> = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunkedArray[Math.floor(i / chunkSize)] = array.slice(i, i + chunkSize);
  }
  return chunkedArray;
}

export const arrayRemove = <T>(item: T) =>
  admin.firestore.FieldValue.arrayRemove(item);
