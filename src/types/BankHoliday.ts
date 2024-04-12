export type BankHoliday = {
  title: string;
  date: string;
};

export type AllBankHolidays = {
  'england-and-wales': {
    events: BankHoliday[];
  };
};
