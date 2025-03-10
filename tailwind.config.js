/** @type {import('tailwindcss').Config} */
export default {
  mode: 'jit', 
  content: [
    "./src/**/*.{astro,html,js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      screens: {
        'xs': {'min': '400px'}, // Custom breakpoint for less than 400px
      },
      fontFamily: {
        merriweather: ['Merriweather', 'serif'],
        poppins: ['Poppins', 'sans-serif'],
      },
    },
  },
  plugins: [],
}