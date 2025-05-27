/** @type {import('tailwindcss').Config} */
export default {
  darkMode: false, // disables dark mode completely
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  theme: {
    extend: {
      fontFamily: {
        rouge: ['"Rouge Script"', 'cursive'],
        pacifico: ['Pacifico', 'cursive'],
      }
    }
  },
  plugins: [
    require('daisyui'),
    require('@tailwindcss/typography')
  ],
  daisyui: {
    themes: ["emerald"]
  }
}