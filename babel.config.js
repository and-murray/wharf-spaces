module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    [
      'module-resolver',
      {
        root: ['./src'],
        extensions: [
          '.ios.ts',
          '.android.ts',
          '.ts',
          '.ios.tsx',
          '.android.tsx',
          '.tsx',
          '.jsx',
          '.js',
          '.json',
        ],
        alias: {
          // Remember to mirror in tsconfig.json and jest.config.ts
          // Reset the react native cache to see any changes
          '@root': './',
          '@firebase': './src/firebase',
          '@navigation': './src/navigation',
          '@atoms': './src/components/atoms',
          '@molecules': './src/components/molecules',
          '@organisms': './src/components/organisms',
          '@screens': './src/screens',
          '@state': './src/state',
          '@customTypes': './src/types',
          '@res': './src/res',
          '@api': './src/api',
          '@utils': './src/util',
          '@components': './src/components',
        },
      },
    ],
    // has to be listed last
    '@babel/plugin-proposal-export-namespace-from',
    'react-native-reanimated/plugin',
  ],
};
