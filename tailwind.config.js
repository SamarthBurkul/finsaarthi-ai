/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'deep-purple': '#2C1A47',
        'jet-black': '#0B0B0D',
        'gold': '#D4AF37',
        'rose-gold': '#B76E79',
        'cream-white': '#F6F4F1',
        'charcoal-gray': '#1E1E22',
        'soft-white': '#F5F7FA',
        'slate-gray': '#8C8F9A',
      },
      fontFamily: {
        'playfair': ['Playfair Display', 'serif'],
        'inter': ['Inter', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.8s ease-in-out',
        'typing': 'typing 3s steps(40, end), blink-caret 0.75s step-end infinite',
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
}