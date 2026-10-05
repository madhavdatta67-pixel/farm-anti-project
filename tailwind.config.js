/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './client/src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        agri: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
          950: '#052e16',
        },
        earth: {
          50: '#faf8f5',
          100: '#f3ede4',
          200: '#e5d7c3',
          300: '#d4bb9b',
          400: '#c19c72',
          500: '#af8051',
          600: '#9b6744',
          700: '#7e503a',
          800: '#674234',
          900: '#55372d',
        },
      },
    },
  },
  plugins: [],
}
