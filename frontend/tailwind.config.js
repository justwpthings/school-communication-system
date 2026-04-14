/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        surface: '#f9f9fb',
        card: '#ffffff',
        ink: '#1d1d1f',
        muted: '#6e6e73',
        accent: '#007aff',
        accentSoft: '#e9f2ff',
        stroke: '#e7e7ec',
        success: '#18a058',
        warning: '#f59e0b',
        danger: '#e5484d'
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif']
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '1.25rem',
        '3xl': '1.5rem'
      },
      boxShadow: {
        card: '0 12px 40px rgba(15, 23, 42, 0.08)',
        soft: '0 4px 24px rgba(15, 23, 42, 0.06)'
      },
      keyframes: {
        fadeUp: {
          '0%': {
            opacity: '0',
            transform: 'translateY(14px)'
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)'
          }
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        popIn: {
          '0%': {
            opacity: '0',
            transform: 'scale(0.98)'
          },
          '100%': {
            opacity: '1',
            transform: 'scale(1)'
          }
        }
      },
      animation: {
        fadeUp: 'fadeUp 0.45s ease-out',
        fadeIn: 'fadeIn 0.35s ease-out',
        popIn: 'popIn 0.25s ease-out'
      }
    }
  },
  plugins: []
};
