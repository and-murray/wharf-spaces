import {TimeSlot} from '@customTypes/booking';

export class TimeSlotUtils {
  static toString(timeSlot: TimeSlot): string {
    switch (timeSlot) {
      case 'am':
        return 'AM';
      case 'pm':
        return 'PM';
      case 'allDay':
        return 'All day';
      default:
        return '';
    }
  }
}
