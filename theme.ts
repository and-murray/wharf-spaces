import {extendTheme} from '@gluestack-ui/themed-native-base';

const theme = extendTheme({
  colors: {
    brand: {
      red: '#ff323c',
      orange: '#ff7900',
      yellow: '#ffc800',
      green: '#5ac328',
      blue: '#2897ff',
      purple: '#a050ff',
      charcoal: '#323232',
      white: '#ffffff',
    },
    other: {
      lightGrey: '#f6f6f6',
      greyMid: '#757575',
      greyDark: '#434343',
      primaryRed: '#d82036',
      darkRed: '#ef4444',
      grey: '#ECECEC',
      greenAccent: '#43A813',
      greenAccentTransparent: '#43A8131a',
      blackTransparent: '#0000003a',
      redTransparent: '#FF323C08',
      blueTransparent: '#1F73C20D',
      orangeTransparent: '#ff79000D',
    },
  },
  fontConfig: {
    Poppins: {
      400: {normal: 'Poppins-Regular'},
      500: {normal: 'Poppins-Medium'},
    },
  },
  fonts: {
    heading: 'Poppins',
    body: 'Poppins',
    mono: 'Poppins',
  },
});

export function getHexValue(colorString: string): string {
  if (colorString === undefined) {
    return '';
  }

  const value: string = colorString
    .split('.')
    //@ts-ignore
    .reduce((a, b) => a[b], theme.colors) as unknown as string;

  return value;
}
type CustomThemeType = typeof theme;

declare module '@gluestack-ui/themed-native-base' {
  interface ICustomTheme extends CustomThemeType {}
}

export default theme;
