import {config as GSConfig} from '@gluestack-ui/config';

export const config = {
  ...GSConfig,
  tokens: {
    ...GSConfig.tokens,
    colors: {
      ...GSConfig.tokens.colors,

      // Murray Booking Brand color Tokens
      brandRed: '#ff323c',
      brandOrange: '#ff7900',
      brandYellow: '#ffc800',
      brandGreen: '#5ac328',
      brandBlue: '#2897ff',
      brandPurple: '#a050ff',
      brandCharcoal: '#323232',
      brandWhite: '#ffffff',

      // Murray Booking Other color Tokens
      otherLightGrey: '#f6f6f6',
      otherGreyMid: '#757575',
      otherGreyDark: '#434343',
      otherPrimaryRed: '#d82036',
      otherDarkRed: '#ef4444',
      otherGrey: '#ECECEC',
      otherGreenAccent: '#43A813',
      otherGreenAccentTransparent: '#43A8131a',
      otherBlackTransparent: '#0000003a',
      otherRedTransparent: '#FF323C08',
      otherBlueTransparent: '#1F73C20D',
      otherOrangeTransparent: '#ff79000D',
    },
    fontConfig: {
      Poppins: {
        400: {normal: 'Poppins-Regular'},
        500: {normal: 'Poppins-Medium'},
      },
    },
    fonts: {
      ...GSConfig.tokens.fonts,
      heading: 'Poppins',
      body: 'Poppins',
      mono: 'Poppins',
    },
  },
} as const;

export function getHexValue(colorString: string): string {
  if (colorString === undefined) {
    return '';
  }

  const value: string = colorString
    .split('.')
    //@ts-ignore
    .reduce((a, b) => a[b], config.tokens.colors) as unknown as string;

  return value;
}
