/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eefbfb',
          100: '#d5f5f5',
          200: '#b0eded',
          300: '#79dede',
          400: '#3bc5c7',
          500: '#14a8ab',
          600: '#0e878b',
          700: '#0e6c70',
          800: '#10565a',
          900: '#12474b',
          950: '#06292c',
        },
        cyber: {
          dark: '#0a0d14',
          darker: '#06080d',
          card: '#111726',
          border: '#1e293b',
          accent: '#06b6d4',
          glow: '#38bdf8'
        }
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      animation: {
        'pulse-fast': 'pulse 1.2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'scan': 'scan 2s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        scan: {
          '0%, 100%': { transform: 'translateY(0%)' },
          '50%': { transform: 'translateY(100%)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 15px rgba(6, 182, 212, 0.3)' },
          '100%': { boxShadow: '0 0 30px rgba(6, 182, 212, 0.8)' },
        }
      }
    },
  },
  plugins: [],
}
