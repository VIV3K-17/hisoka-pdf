/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        premium: {
          dark: '#0f172a',
          glass: 'rgba(255, 255, 255, 0.05)',
          border: 'rgba(255, 255, 255, 0.1)',
        },
        brand: {
          dark: '#140f22',
          red: '#ce0a3a',
          pink: '#dc3e8f',
          blue: '#ceeffe',
          yellow: '#fcfaa0',
        }
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}
