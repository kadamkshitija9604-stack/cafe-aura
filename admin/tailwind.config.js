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
          50: '#faf7f2',
          100: '#f5efe4',
          200: '#ebdeca',
          300: '#dec7a8',
          400: '#d0ac83',
          500: '#c5925e',
          600: '#b77a4a',
          700: '#98613d',
          800: '#7b4e36',
          900: '#64412f',
          950: '#362117',
        },
        espresso: {
          800: '#1e140d',
          900: '#140c07',
          950: '#0c0704',
        },
        caramel: {
          400: '#e5a358',
          500: '#c97a2b',
          600: '#b0651c',
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
