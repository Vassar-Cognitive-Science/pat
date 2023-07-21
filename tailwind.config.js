/** @type {import('tailwindcss').Config} */

//const colors = require('tailwindcss/colors');
import colors from 'tailwindcss/colors';

module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {},
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      black: colors.black,
      white: colors.white,
      gray: colors.gray,
      emerald: colors.emerald,
      indigo: colors.indigo,
      yellow: colors.yellow,
      'pat-light': '#E1E1ED',
      'pat-purple': '#4E38A2',
      'pat-highlight': '#FCE5B9',
      'pat-bg-blog': '#8275B9',
      'pat-bg-plum': '#2C2A32'
    },
    fontFamily:{
      'heading': ['"Brygada 1918"', 'serif'],
      'pat': ['Lekton', 'sans-serif'],
      'you': ['Gowun Dodum', 'sans-serif'],
      'tag': ['"Josefin Sans"', 'sans-serif'],
    }
  },
  plugins: [],
}

