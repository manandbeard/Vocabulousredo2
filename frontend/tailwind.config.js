/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: '#f8f6fa',
          'container-low': '#f2f0f4',
          'container-lowest': '#ffffff',
          'container-high': '#eceaee',
        },
        primary: {
          DEFAULT: '#8b6cc1',
          container: '#c4aee6',
          foreground: '#ffffff',
        },
        secondary: {
          DEFAULT: '#e8a87c',
          container: '#fcd5b8',
          foreground: '#5a3a1e',
        },
        tertiary: {
          DEFAULT: '#7cc5a8',
          container: '#b8e8d4',
          'fixed-dim': '#a8d8c0',
        },
        'on-surface': '#2e2e32',
        'on-surface-variant': '#5a5a62',
        'outline-variant': 'rgba(46, 46, 50, 0.15)',
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        'full': '9999px',
      },
      boxShadow: {
        'ambient': '0px 20px 40px rgba(139, 108, 193, 0.08)',
        'ambient-peach': '0px 20px 40px rgba(232, 168, 124, 0.08)',
        'ambient-mint': '0px 20px 40px rgba(124, 197, 168, 0.08)',
        'float': '0px 8px 32px rgba(139, 108, 193, 0.12)',
        'glow': '0px 0px 48px rgba(139, 108, 193, 0.15)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'float-delayed': 'float 8s ease-in-out 2s infinite',
        'fade-in': 'fadeIn 0.6s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
}
