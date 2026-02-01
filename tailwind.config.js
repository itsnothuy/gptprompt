/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        accent: {
          DEFAULT: '#10a37f',
          hover: '#0d8a6a',
          light: '#d1f3e7',
          dark: '#1a4a3a',
        },
        chatgpt: {
          bg: {
            light: '#ffffff',
            dark: '#343541',
          },
          secondary: {
            light: '#f7f7f8',
            dark: '#40414f',
          },
          text: {
            light: '#1a1a1a',
            dark: '#ececf1',
          },
        },
      },
      animation: {
        'picker-enter': 'picker-enter 150ms ease-out',
        'picker-exit': 'picker-exit 100ms ease-in',
        'fade-in': 'fade-in 150ms ease-out',
      },
      keyframes: {
        'picker-enter': {
          from: { opacity: '0', transform: 'scale(0.96) translateY(-8px)' },
          to: { opacity: '1', transform: 'scale(1) translateY(0)' },
        },
        'picker-exit': {
          from: { opacity: '1', transform: 'scale(1)' },
          to: { opacity: '0', transform: 'scale(0.96)' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
