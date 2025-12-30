/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#FFFFFF', // Crisp White - Main background
        secondary: '#F4F6F8', // Mist Grey - Subtle background
        accent: {
          DEFAULT: '#2C3E50', // Slate Blue - Buttons, Logos, Navbar
          hover: '#1a252f', // Darker shade for hover
          light: '#3e5871', // Lighter shade
        },
        text: {
          main: '#1A1A1A', // Deep Onyx - Main body text
          light: '#4A5568', // Lighter text for secondary content
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Playfair Display', 'serif'],
      }
    },
  },
  plugins: [],
};