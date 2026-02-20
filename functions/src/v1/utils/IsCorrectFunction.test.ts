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

  describe('Is Running Car API Function Gen 2', () => {
    const functionName = 'carapiGen2';
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

  describe('Is Running Desk API Gen 2 Function', () => {
    const functionName = 'deskapiGen2';
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

  describe('Is Running API Gen 2 Function', () => {
    const functionName = 'apiGen2';
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
