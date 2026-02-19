import {SpaceType} from '../Models/booking.model';

export const isCorrectFunction = (
  spaceType: SpaceType,
  functionName = process.env.FUNCTION_TARGET,
): boolean => {
  if (
    spaceType === SpaceType.Enum.car &&
    (functionName === 'carapi' || functionName === 'carapiGen2')
  ) {
    return true;
  }
  if (
    spaceType === SpaceType.Enum.desk &&
    (functionName === 'deskapi' || functionName === 'deskapiGen2')
  ) {
    return true;
  }
  return false;
};
