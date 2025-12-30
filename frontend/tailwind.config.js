/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#FFFFFF', // Pure White
        secondary: '#F8FAFC', // Slate 50 - Very subtle grey
        accent: {
          DEFAULT: '#0B1120', // Midnight Navy - Deep, Premium
          hover: '#1e293b', // Slate 800
          light: '#334155', // Slate 700
        },
        gold: {
          DEFAULT: '#C5A059', // Elegant Gold
          hover: '#B89248',
          light: '#E5C985',
        },
        text: {
          main: '#0F172A', // Slate 900
          light: '#64748B', // Slate 500
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Playfair Display', 'serif'],
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.8s ease-out forwards',
        'gentle-float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      }
    },
  },
  plugins: [],
};