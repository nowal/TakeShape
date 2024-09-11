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
      borderRadius: {
        '15.1875': '15.1875rem',
        '4xl': '2rem',
        '5xl': '2.25rem',
      },
      boxShadow: {
        '08': '0px 4px 90.8px 0px rgba(0, 0, 0, 0.08)',
      },
      colors: {
        white: '#FFF',
        'white-1': '#F8F8F8',
        'white-green': '#F1FFF2',

        pink: '#FF385C',
        red: '#ff0000',
        gray: '#AFAFAF',
      },
      backgroundImage: {
        'gradient-radial':
          'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      maxWidth: {
        shell: '1512px',
      },
    },
  },
  plugins: [],
};
module.exports = config;
