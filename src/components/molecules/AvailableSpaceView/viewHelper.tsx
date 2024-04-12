import {AvailableSpacesOption, TimeSlot} from '@root/src/types';
import {SpaceType} from '@customTypes/booking';
import {WarningSymbolKey} from '../../atoms/Warning/WarningSymbol/WarningSymbol';
import {WarningProps} from '../../atoms/Warning/Warning';

const deskFullNotBookedMessage =
  'Sorry, there are no more designated desk spaces available on this day, but you can book a communal space.';
const deskFullAndBookedMessage =
  'You have already booked a desk space for this day. Feel free to cancel it, if not needed anymore.';
const deskFullAndCommunalMessage =
  'You have booked a communal space. Please try not to occupy any designated desk of the clubhouse as they are already booked by others.';
const deskFullSingleTimeSlotMessage =
  'Sorry, there are no more designated desk spaces available for this slot, but you can book a communal space.';

const parkingFullNoBooking =
  'Sorry, there are no spaces available at this time. However, you can book onto the waiting list.';
const parkingWaitingListBooking =
  "You're booked onto the waiting list. Keep an eye on your booking as you may be automatically given a space if there are cancelations.";
export const determineWarningProps = (
  spaceType: SpaceType,
  hasBooked: boolean,
  hasCommunalSpace: boolean,
  options: AvailableSpacesOption[],
): WarningProps => {
  if (spaceType === SpaceType.car) {
    return setParkingMessage(hasBooked, hasCommunalSpace);
  } else {
    return setDeskMessage(hasBooked, hasCommunalSpace, options);
  }
};

const setParkingMessage = (hasBooked: boolean, hasCommunalSpace: boolean) => {
  if (hasBooked && hasCommunalSpace) {
    return {
      warningMessage: parkingWaitingListBooking,
      symbolToUse: 'infoCircle' as WarningSymbolKey,
      backgroundColor: '$otherBlueTransparent',
      borderColor: '$brandBlue',
    };
  }
  return {
    warningMessage: parkingFullNoBooking,
    symbolToUse: 'infoCircle' as WarningSymbolKey,
    backgroundColor: '$otherOrangeTransparent',
    borderColor: '$brandOrange',
  };
};

const setDeskMessage = (
  hasBooked: boolean,
  hasCommunalSpace: boolean,
  options: AvailableSpacesOption[],
) => {
  let warningMessage = deskFullNotBookedMessage;
  let warningSymbol: WarningSymbolKey = 'warningTriangle';
  let warningBackground = '$otherOrangeTransparent';
  let warningBorderColor = '$brandOrange';

  if (hasBooked) {
    // Check if am / pm slots are free and not booking allDay

    warningSymbol = 'infoCircle';
    warningBackground = '$otherBlueTransparent';
    warningBorderColor = '$brandBlue';
    if (hasCommunalSpace) {
      warningMessage = deskFullAndCommunalMessage;
    } else {
      warningMessage = deskFullAndBookedMessage;
    }
  } else {
    if (checkAlternateAmOrPmFree(options)) {
      warningMessage = deskFullSingleTimeSlotMessage;
    }
  }
  return {
    warningMessage: warningMessage,
    symbolToUse: warningSymbol,
    backgroundColor: warningBackground,
    borderColor: warningBorderColor,
  };
};
export const checkAlternateAmOrPmFree = (options: AvailableSpacesOption[]) => {
  let hasSlotFree = false;

  let allDayOption = options.find(
    option => option.timeSlot === TimeSlot.allDay,
  );
  // If they are booking for all day then not part of scenario
  // of booking am/pm and alternate being free
  if (allDayOption?.isSelected) {
    return hasSlotFree;
  }
  let amOption = options.find(option => option.timeSlot === TimeSlot.am);
  let pmOption = options.find(option => option.timeSlot === TimeSlot.pm);

  //Check if alternate to selected timeslot has spaces
  if (amOption?.isSelected) {
    hasSlotFree = pmOption?.spaceLeft && pmOption?.spaceLeft > 0 ? true : false;
  } else if (pmOption) {
    hasSlotFree = amOption?.spaceLeft && amOption?.spaceLeft > 0 ? true : false;
  }

  return hasSlotFree;
};
