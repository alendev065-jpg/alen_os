/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        mono: ['"IBM Plex Mono"', 'monospace'],
        display: ['"Bebas Neue"', 'cursive'],
      },
      colors: {
        cream: '#f0ebe0',
        'cream-dark': '#e8e2d5',
        'cream-border': '#d4cfc4',
        alen: {
          black: '#0a0a0a',
          red: '#cc0000',
          'red-dark': '#aa0000',
          white: '#ffffff',
          gray: '#888888',
          'light-gray': '#cccccc',
        },
      },
      letterSpacing: {
        widest2: '0.2em',
        widest3: '0.3em',
      },
      gridTemplateColumns: {
        '24': 'repeat(24, minmax(0, 1fr))',
      },
    },
  },
  plugins: [],
};
