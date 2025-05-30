/** @type {import('tailwindcss').Config} */
export default {
  mode: 'jit', 
  content: [
    "./src/**/*.{astro,html,js,jsx,ts,tsx}",
  ],
  plugins: [],
  theme: {
    extend: {
      screens: {
        'xxs': {'min': '340px'}, 
        'xs': {'min': '400px'}, 
        'tb': {'min': '1024px'}, 
      },
      colors: {
        'orange': "#F1592A",
        'webBlack':'#1E1E1E'
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
}