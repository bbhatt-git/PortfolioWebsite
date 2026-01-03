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
        'fluid': 'cubic-bezier(0.3, 0, 0, 1)',
      },
      animation: {
        'blob': 'blob 25s infinite alternate cubic-bezier(0.4, 0, 0.2, 1)',
        'blob-reverse': 'blobReverse 30s infinite alternate cubic-bezier(0.4, 0, 0.2, 1)',
        'fade-up': 'fadeUp 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'scale-in': 'scaleIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'slide-up': 'slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'float-slow': 'float 10s ease-in-out infinite',
        'float-medium': 'float 8s ease-in-out infinite',
        'float-fast': 'float 6s ease-in-out infinite',
        'spin-slow': 'spin 20s linear infinite',
        'shimmer': 'shimmer 3s linear infinite',
        'marquee': 'marquee 60s linear infinite',
        'pulse-slow': 'pulse 8s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        blob: {
          '0%': { transform: 'translate(0px, 0px) scale(1)' },
          '33%': { transform: 'translate(50px, -80px) scale(1.15)' },
          '66%': { transform: 'translate(-40px, 40px) scale(0.85)' },
          '100%': { transform: 'translate(0px, 0px) scale(1)' },
        },
        blobReverse: {
          '0%': { transform: 'translate(0px, 0px) scale(1)' },
          '33%': { transform: 'translate(-50px, 80px) scale(0.85)' },
          '66%': { transform: 'translate(40px, -40px) scale(1.15)' },
          '100%': { transform: 'translate(0px, 0px) scale(1)' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translate3d(0, 40px, 0)' },
          '100%': { opacity: '1', transform: 'translate3d(0, 0, 0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        slideUp: {
          '0%': { transform: 'translate3d(0, 100%, 0)' },
          '100%': { transform: 'translate3d(0, 0, 0)' },
        },
        float: {
          '0%, 100%': { transform: 'translate3d(0, 0, 0)' },
          '50%': { transform: 'translate3d(0, -25px, 0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1200px 0' },
          '100%': { backgroundPosition: '1200px 0' }
        },
        marquee: {
          '0%': { transform: 'translate3d(0, 0, 0)' },
          '100%': { transform: 'translate3d(-50%, 0, 0)' },
        }
      }
    }
  },
  plugins: [],
}