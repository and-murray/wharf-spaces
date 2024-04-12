import {chunk} from './ArrayUtils';

describe('chunk', () => {
  it('should return an empty array if the input array is empty', () => {
    const result = chunk([], 2);
    expect(result).toEqual([]);
  });

  it('should return the input array as a single chunk if the chunk size is greater than the array length', () => {
    const input = [1, 2, 3, 4, 5];
    const result = chunk(input, 10);
    expect(result).toEqual([input]);
  });

  it('should split the input array into chunks of the specified size', () => {
    const input = [1, 2, 3, 4, 5];
    const result = chunk(input, 2);
    expect(result).toEqual([[1, 2], [3, 4], [5]]);
  });

  it('should handle cases where the input array length is not divisible by the chunk size', () => {
    const input = [1, 2, 3, 4, 5];
    const result = chunk(input, 3);
    expect(result).toEqual([
      [1, 2, 3],
      [4, 5],
    ]);
  });
});
