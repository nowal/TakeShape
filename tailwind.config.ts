import defaultTheme from 'tailwindcss/defaultTheme';
import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{html,js,ts,jsx,tsx,mdx}',
    './app/**/*.{html,js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        montserrat: [
          'var(--font-montserrat)',
          ...defaultTheme.fontFamily.sans,
        ],
        'open-sans': [
          'var(--font-open-sans)',
          ...defaultTheme.fontFamily.sans,
        ],
        poppins: 'var(--font-poppins)',
      },
      colors: {
        black: '#020202',
        'black-1': '#0F0F0F',
        'black-2': '#484848',
        'black-3': '#858585',
        'black-4': '#949494',
        'black-5': '#838383',
        'black-6': '#181818',
        'black-7': '#404040',
        'black-8': '#424242',

        'black-05': 'var(--black-05)',
        'black-08': 'var(--black-08)',
        'black-09': 'var(--black-09)',

        white: '#FFF',
        'white-1': '#F8F8F8',
        'white-2': '#F9F9F9',
        'white-3': '#F5F5F5',
        'white-4': '#EDEDED',
        'white-5': '#FDFDFD',


        'white-pink': '#FFF9FA',
        'white-pink-1': '#FFF6F7',
        'white-pink-2': '#FFCDD3',
        'white-pink-3': '#FFF2F5',

        pink: 'var(--pink)',
        'pink-1': '#E73152',

        red: '#ff0000',

        gray: '#AFAFAF',
        'gray-1': '#D3D3D3',
        'gray-3': '#D7D7D7',
        'gray-4': '#DEDEDE',
        'gray-5': '#999999',
        'gray-6': '#D6D6D6',
        'gray-7': '#5F5F5F',
        'gray-8': '#f8f8f8',
        'gray-9': '#AAAAAA',
        'gray-10': '#ececec'
      },
      borderRadius: {
        '15.1875': '15.1875rem',
        '4xl': '2rem',
        '5xl': '2.25rem',
      },
      dropShadow: {
        '05': '0px 4px 90.8px rgba(0, 0, 0, 0.05)',
      },
      boxShadow: {
        '08': '0px 4px 90.8px 0px rgba(0, 0, 0, 0.08)',
        '09': '0px 4.288px 28.623px 0px rgba(0, 0, 0, 0.09)',
        'pink-bottom-08':
          '0px 42px 32px 0px rgba(255, 56, 92, 0.08)',
      },
      backgroundImage: {
        'gradient-radial':
          'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      keyframes: {
        'ant-walk': {
          to: { strokeDashoffset: '0' },
        },
      },
      maxWidth: {
        shell: '1512px',
      },
      letterSpacing: {
        'tight-06': '-0.06em',
        'tight-02':'-0.02em'
      },
      spacing: {
        0.25: '0.0625rem',
        2.75: '0.6875rem',
        3.75: '0.9375rem',
        4.5: '1.125rem',
        5.5: '1.375rem',
        7.5: '1.875rem',
        9.5: '2.375rem',
        12.5: '3.125rem',
      },
      screens: {
        xxs: '375px',
        xs: '450px',
      },
    },
  },
  plugins: [],
};
module.exports = config;
