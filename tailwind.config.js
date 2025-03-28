/** @type {import('tailwindcss').Config} */
export default {
  mode: 'jit', 
  content: [
    "./src/**/*.{astro,html,js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      screens: {
        'xs': {'min': '400px'}, 
        'tb': {'max': '64rem'}, 
      },
      fontFamily: {
        merriweather: ['Merriweather', 'serif'],
        poppins: ['Poppins', 'sans-serif'],
        Inter: ['Inter','sans-serif'],
      },
      extend: {
        spacing: {
            128: '32rem',
            144: '36rem',
        }
    },
    fontSize: {
      'title': '2.4rem',
      'title-sub': '2.2rem',
      'desc': '0.9rem',
    }
    },
  },
  plugins: [],
}