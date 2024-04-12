import {SpaceType} from '../Models/booking.model';
import {isCorrectFunction} from './IsCorrectFunction';

describe('Is Correct Function Tests', () => {
  describe('Is Running Car API Function', () => {
    const functionName = 'carapi';
    describe('Is Booking Desk', () => {
      const spaceType = SpaceType.Enum.desk;
      it('should return false', () => {
        expect(isCorrectFunction(spaceType, functionName)).toBeFalsy();
      });
    });

    describe('Is Booking Car', () => {
      const spaceType = SpaceType.Enum.car;
      it('should return true', () => {
        expect(isCorrectFunction(spaceType, functionName)).toBeTruthy();
      });
    });
  });

  describe('Is Running Desk API Function', () => {
    const functionName = 'deskapi';
    describe('Is Booking Desk', () => {
      const spaceType = SpaceType.Enum.desk;
      it('should return true', () => {
        expect(isCorrectFunction(spaceType, functionName)).toBeTruthy();
      });
    });

    describe('Is Booking Car', () => {
      const spaceType = SpaceType.Enum.car;
      it('should return false', () => {
        expect(isCorrectFunction(spaceType, functionName)).toBeFalsy();
      });
    });
  });

  describe('Is Running API Function', () => {
    const functionName = 'api';
    describe('Is Booking Desk', () => {
      const spaceType = SpaceType.Enum.desk;
      it('should return false', () => {
        expect(isCorrectFunction(spaceType, functionName)).toBeFalsy();
      });
    });

    describe('Is Booking Car', () => {
      const spaceType = SpaceType.Enum.car;
      it('should return false', () => {
        expect(isCorrectFunction(spaceType, functionName)).toBeFalsy();
      });
    });
  });
});
