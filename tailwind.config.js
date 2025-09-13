/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f5f7ff',
          100: '#ebefff',
          200: '#d6deff',
          300: '#b0bfff',
          400: '#7e95ff',
          500: '#5674ff',
          600: '#3856e6',
          700: '#2a41b4',
          800: '#243892',
          900: '#1f3178',
        },
      },
      boxShadow: {
        card: '0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)',
      },
    },
  },
  plugins: [],
}
