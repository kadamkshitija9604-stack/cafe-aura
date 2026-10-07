/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        aura: {
          50: '#231711',   // primary high-contrast dark espresso text
          100: '#342218',  // deep warm mocha text
          200: '#4A3326',  // secondary warm text
          300: '#684C3D',  // medium text & labels
          400: '#8C6E5C',  // muted labels & icons
          500: '#A86D3B',  // accent warm coffee
          600: '#C48446',  // caramel accent
          700: '#D8C8B8',  // delicate secondary border
          800: '#E8DDD0',  // main light border / divider
          900: '#F4EEE5',  // faint soft warm hover / tag backdrop
          950: '#ECE3D6',  // faint table header / accent container
        },
        espresso: {
          800: '#F2EAE0',  // soft secondary surface / dropdowns
          900: '#FFFFFF',  // pure white card / panel background
          950: '#F9F6F0',  // soft faint warm cream main background
        },
        caramel: {
          400: '#B86B1E',  // warm caramel gold
          500: '#9C5410',  // rich caramel primary
          600: '#7F4109',  // deep caramel
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'sans-serif'],
      }
    },
  },
  plugins: [],
};

