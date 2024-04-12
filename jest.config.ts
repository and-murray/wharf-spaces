/*
 * For a detailed explanation regarding each configuration property and type check, visit:
 * https://jestjs.io/docs/configuration
 */

import type {Config} from 'jest';
const config: Config = {
  verbose: true,
  moduleNameMapper: {
    '^@components$': '<rootDir>/shared/components/',
    '^@root$': '<rootDir>/',
    '^@firebase$': '<rootDir>/src/firebase/',
    '^@navigation$': '<rootDir>/src/navigation/',
    '^@atoms$': '<rootDir>/src/components/atoms/',
    '^@molecules$': '<rootDir>/src/components/molecules/',
    '^@organisms$': '<rootDir>/src/components/organisms/',
    '^@screens$': '<rootDir>/src/screens/',
    '^@state$': '<rootDir>/src/state/',
    '^@customTypes$': '<rootDir>/src/types/',
    '^@res$': '<rootDir>/src/res/',
    '^@api$': '<rootDir>/src/api/',
    '^@utils$': '<rootDir>/src/util/',
  },

  setupFiles: [
    './node_modules/@react-native-google-signin/google-signin/jest/build/setup.js',
    './setup-jest.ts',
  ],

  // Automatically clear mock calls, instances, contexts and results before every test
  clearMocks: true,

  // Indicates whether the coverage information should be collected while executing the test
  collectCoverage: false,

  // The directory where Jest should output its coverage files
  coverageDirectory: 'coverage',

  // A preset that is used as a base for Jest's configuration
  preset: 'react-native',

  transformIgnorePatterns: [
    'node_modules/(?!(@react-native|react-native|@react-navigation|@gluestack-ui/themed|@gluestack-ui|@expo|@legendapp))',
  ],
  modulePathIgnorePatterns: ['functions'],

  // A list of paths to modules that run some code to configure or set up the testing framework before each test
  setupFilesAfterEnv: ['@testing-library/jest-native/extend-expect'],
};

export default config;
