/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        snu:    '#1a3a6b',
        yonsei: '#1d5c9e',
        korea:  '#8b1a1a',
      },
      fontFamily: {
        sans: ["'Apple SD Gothic Neo'", "'Noto Sans KR'", 'sans-serif'],
      },
    },
  },
  plugins: [],
}
