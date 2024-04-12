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
    let response = await fetch(url, options);
    let bankHolidays: AllBankHolidays = await response.json();
    return bankHolidays;
  } catch (error) {
    logMessage(LogLevel.error, error);
  }
};

export default getBankHolidays;
