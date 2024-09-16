// File: tailwind.config.js

module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  darkMode: 'media',
  theme: {
    extend: {
      colors: {
        'terminal-green': '#4ade80',
        'terminal-bg': '#1f2937',
      },
      fontFamily: {
        'terminal': ['VT323', 'monospace'],
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
}