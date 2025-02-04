import {AllBankHolidays} from '@customTypes/.';
import {LogLevel, logMessage} from '../util/Logging/Logging';

const getBankHolidays = async (): Promise<AllBankHolidays | undefined> => {
  try {
    const url = 'https://www.gov.uk/bank-holidays.json';
    const options = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    };
    const response = await fetch(url, options);
    const bankHolidays: AllBankHolidays = await response.json();
    return bankHolidays;
  } catch (error) {
    logMessage(LogLevel.error, error);
    return;
  }
};

export default getBankHolidays;
