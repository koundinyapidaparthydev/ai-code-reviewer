/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          50: '#FBF7F0',
          100: '#F4EDE3',
          200: '#E8DCC9',
          300: '#D4C4A8',
        },
        ink: {
          50: '#F5F2EE',
          100: '#E7E1D8',
          200: '#C9BFAF',
          400: '#8A7E70',
          500: '#5C5248',
          600: '#3D342B',
          700: '#2A231C',
          800: '#1C1612',
          900: '#14100C',
        },
        coral: {
          50: '#FDF4F0',
          100: '#F8D9D0',
          200: '#F0B8A8',
          400: '#E8957A',
          500: '#E07A5F',
          600: '#C45A3E',
          700: '#A34730',
        },
        amber: {
          50: '#FBF4E0',
          100: '#F4E4B4',
          400: '#E9B949',
          500: '#D4A017',
          600: '#B8860B',
          800: '#6B4E08',
        },
        sage: {
          50: '#EEF4EE',
          100: '#D5E4D6',
          600: '#3F6B4A',
          700: '#2F5238',
        },
        primary: {
          50: '#FDF4F0',
          100: '#F8D9D0',
          200: '#F0B8A8',
          300: '#E8957A',
          400: '#E07A5F',
          500: '#E07A5F',
          600: '#C45A3E',
          700: '#A34730',
          800: '#7C3524',
          900: '#5A261A',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'Georgia', 'serif'],
      },
      boxShadow: {
        paper:
          '0 1px 2px rgba(28, 22, 18, 0.05), 0 12px 32px rgba(28, 22, 18, 0.07)',
        lift: '0 10px 28px rgba(28, 22, 18, 0.12)',
      },
      borderRadius: {
        paper: '1.25rem',
      },
    },
  },
  plugins: [],
};
