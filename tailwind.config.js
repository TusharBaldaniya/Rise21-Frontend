/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          50: '#fbfbfa',
          100: '#f5f4eb', // Main background color
          200: '#eaeaeb',
          300: '#d7d6cd',
          400: '#b4b3a6',
          500: '#949285',
          600: '#757468',
          700: '#5a594f',
          800: '#414038',
          900: '#2c2b25',
        },
        sage: {
          50: '#f4f6f3',
          100: '#e2e8dd', // Accent pill background
          200: '#c5d0bc',
          300: '#a3b497',
          400: '#7e9571',
          500: '#5a7255', // Primary brand color
          600: '#475b43',
          700: '#394835',
          800: '#2c3729',
          900: '#1e251b',
        }
      },
      fontFamily: {
        serif: ['Lora', 'Merriweather', 'Georgia', 'serif'],
        sans: ['Inter', 'Plus Jakarta Sans', 'sans-serif'],
      },
      boxShadow: {
        'premium': '0 4px 20px -2px rgba(90, 114, 85, 0.08), 0 2px 8px -1px rgba(90, 114, 85, 0.04)',
        'premium-hover': '0 12px 30px -4px rgba(90, 114, 85, 0.12), 0 4px 12px -2px rgba(90, 114, 85, 0.06)',
      }
    },
  },
  plugins: [],
}
