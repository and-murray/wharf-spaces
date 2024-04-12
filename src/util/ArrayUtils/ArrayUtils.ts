export function chunk<M>(array: Array<M>, chunkSize: number) {
  const chunkedArray: Array<Array<M>> = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunkedArray[Math.floor(i / chunkSize)] = array.slice(i, i + chunkSize);
  }
  return chunkedArray;
}
