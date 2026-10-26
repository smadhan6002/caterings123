/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0966CC',
          dark: '#123B75',
          light: '#EFF6FF',
        },
        navy: {
          DEFAULT: '#123B75',
          dark: '#0c274e',
        },
        secondary: '#3B82F6',
        lightBlue: '#EFF6FF',
        lightBorder: '#DCE8F5',
        bodyText: '#24364B',
        mutedText: '#64748B',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
