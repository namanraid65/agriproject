/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        agri: {
          green: {
            50: '#f0fdf4',
            100: '#dcfce7',
            500: '#22c55e',
            600: '#16a34a',
            700: '#15803d',
            800: '#166534',
            900: '#14532d',
          },
          amber: {
            50: '#fdfbeb',
            100: '#fef3c7',
            500: '#f59e0b',
            600: '#d97706',
            700: '#b45309',
          },
          earth: {
            50: '#fafaf9',
            100: '#f5f5f4',
            500: '#78716c',
            800: '#44403c',
            900: '#1c1917',
          }
        }
      }
    },
  },
  plugins: [],
}
