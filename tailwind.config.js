/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Outfit', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        primary: '#007AFF',
        'primary-dark': '#0A84FF',
        dark: '#050505',
        'mac-gray': '#1D1D1F',
      },
      transitionTimingFunction: {
        'expo': 'cubic-bezier(0.16, 1, 0.3, 1)',
        'out-expo': 'cubic-bezier(0.19, 1, 0.22, 1)',
        'out-circ': 'cubic-bezier(0.075, 0.82, 0.165, 1)',
      },
      animation: {
        'blob': 'blob 10s infinite alternate cubic-bezier(0.45, 0, 0.55, 1)',
        'fade-up': 'fadeUp 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'scale-in': 'scaleIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'float-slow': 'float 8s ease-in-out infinite',
        'float-medium': 'float 6s ease-in-out infinite',
        'float-fast': 'float 4s ease-in-out infinite',
        'spin-slow': 'spin 15s linear infinite',
        'shimmer': 'shimmer 2.5s linear infinite',
      },
      keyframes: {
        blob: {
          '0%': { transform: 'translate3d(0, 0, 0) scale(1) rotate(0deg)' },
          '33%': { transform: 'translate3d(30px, -50px, 0) scale(1.1) rotate(10deg)' },
          '66%': { transform: 'translate3d(-20px, 20px, 0) scale(0.9) rotate(-10deg)' },
          '100%': { transform: 'translate3d(0, 0, 0) scale(1) rotate(0deg)' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translate3d(0, 30px, 0)' },
          '100%': { opacity: '1', transform: 'translate3d(0, 0, 0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        float: {
          '0%, 100%': { transform: 'translate3d(0, 0, 0)' },
          '50%': { transform: 'translate3d(0, -20px, 0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1200px 0' },
          '100%': { backgroundPosition: '1200px 0' }
        }
      }
    }
  },
  plugins: [],
}