/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Press Start 2P"', 'ui-monospace', 'monospace'],
        pixel: ['"VT323"', 'ui-monospace', 'monospace'],
        body: ['"Inter"', 'system-ui', 'sans-serif'],
      },
      colors: {
        // NES / FF1 inspired palette
        bg: {
          900: '#06070f',
          800: '#0a0e27',
          700: '#141a3a',
        },
        panel: {
          DEFAULT: '#1e2a5e',
          dark: '#0f1438',
          light: '#2c3a7a',
        },
        ink: {
          DEFAULT: '#f0f0e8',
          muted: '#a6a6c0',
        },
        hp: '#e74c3c',
        mp: '#3aa8ff',
        coin: '#f9d71c',
        quest: {
          green: '#5fc860',
          red: '#e74c3c',
          blue: '#3aa8ff',
          gold: '#f9d71c',
          purple: '#b084f5',
        },
      },
    },
  },
  plugins: [],
};
