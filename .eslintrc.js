module.exports = {
  root: true,
  extends: ['@react-native', 'plugin:@typescript-eslint/strict'],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'jest'],
  ignorePatterns: ['**/lib/*', 'metro.config.js'],
};
