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
        primary: {
          DEFAULT: '#0066FF',
          hover: '#0052CC',
          subtle: 'rgba(0, 102, 255, 0.1)',
        },
        midnight: '#020203',
        snow: '#FBFBFD',
        'mac-gray': '#1D1D1F',
      },
      transitionTimingFunction: {
        // Professional, clean, no bounce
        'expo': 'cubic-bezier(0.16, 1, 0.3, 1)', 
        'out-expo': 'cubic-bezier(0.19, 1, 0.22, 1)',
        'spring': 'cubic-bezier(0.25, 1, 0.5, 1)', // Renamed for compatibility, but now a clean ease-out
        'out-back': 'cubic-bezier(0.25, 1, 0.5, 1)', // Flattened
        'fluid': 'cubic-bezier(0.3, 0, 0, 1)',
      },
      animation: {
        'blob': 'blob 25s infinite alternate cubic-bezier(0.4, 0, 0.2, 1)',
        'blob-reverse': 'blobReverse 30s infinite alternate cubic-bezier(0.4, 0, 0.2, 1)',
        'fade-up': 'fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'scale-in': 'scaleIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'slide-up': 'slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'float-slow': 'float 6s ease-in-out infinite',
        'float-medium': 'float 4s ease-in-out infinite',
        'float-fast': 'float 2.5s ease-in-out infinite',
        'spin-slow': 'spin 15s linear infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'marquee': 'marquee 40s linear infinite',
        'pulse-slow': 'pulse 8s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'liquid': 'liquid 12s ease-in-out infinite alternate',
      },
      keyframes: {
        liquid: {
          '0%': { borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%', transform: 'rotate(0deg) scale(1)' },
          '50%': { borderRadius: '30% 60% 70% 40% / 50% 60% 30% 60%', transform: 'rotate(180deg) scale(1.1)' },
          '100%': { borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%', transform: 'rotate(360deg) scale(1)' },
        },
        blob: {
          '0%': { transform: 'translate(0px, 0px) scale(1) rotate(0deg)' },
          '33%': { transform: 'translate(50px, -50px) scale(1.1) rotate(5deg)' },
          '66%': { transform: 'translate(-40px, 40px) scale(0.95) rotate(-5deg)' },
          '100%': { transform: 'translate(0px, 0px) scale(1) rotate(0deg)' },
        },
        blobReverse: {
          '0%': { transform: 'translate(0px, 0px) scale(1) rotate(0deg)' },
          '33%': { transform: 'translate(-50px, 50px) scale(0.95) rotate(-5deg)' },
          '66%': { transform: 'translate(40px, -40px) scale(1.1) rotate(5deg)' },
          '100%': { transform: 'translate(0px, 0px) scale(1) rotate(0deg)' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translate3d(0, 30px, 0)' },
          '100%': { opacity: '1', transform: 'translate3d(0, 0, 0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        slideUp: {
          '0%': { transform: 'translate3d(0, 100%, 0)' },
          '100%': { transform: 'translate3d(0, 0, 0)' },
        },
        float: {
          '0%, 100%': { transform: 'translate3d(0, 0, 0)' },
          '50%': { transform: 'translate3d(0, -15px, 0)' },
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