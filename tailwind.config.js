/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  future: {
    hoverOnlyWhenSupported: true,
  },
  theme: {
    extend: {
      fontFamily: {
        sans: [
          '"Inter Tight"',
          'Inter',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'sans-serif',
        ],
        display: [
          '"Instrument Serif"',
          'ui-serif',
          'Georgia',
          'serif',
        ],
        mono: [
          '"JetBrains Mono"',
          'ui-monospace',
          'SFMono-Regular',
          'Menlo',
          'monospace',
        ],
      },
      letterSpacing: {
        tightest: '-0.06em',
      },
      colors: {
        graphite: {
          0: '#0a0a0c',
          50: '#0b0b0d',
          100: '#0e0e10',
          200: '#111114',
          300: '#15161a',
          400: '#1a1b20',
          500: '#202126',
          600: '#2a2b31',
          700: '#3b3c44',
          800: '#5a5b63',
          900: '#85868d',
        },
        bone: {
          50: '#f5f4f1',
          100: '#ecebe6',
          200: '#d8d7d1',
          300: '#b6b5b0',
          400: '#8c8b86',
          500: '#67676a',
        },
        ember: {
          50: '#fdf6ee',
          100: '#f7e5cf',
          200: '#ecc59c',
          300: '#dba36a',
          400: '#d6a266',
          500: '#c2864a',
          600: '#9a6536',
        },
        sage: '#a7b5a4',
        ink: {
          50: '#f5f4f1',
          100: '#e5e4df',
          200: '#c4c3bd',
          300: '#8b8a85',
          400: '#5b5a55',
          500: '#3a3a36',
          600: '#222220',
          700: '#16161a',
          800: '#0e0e10',
          900: '#0a0a0c',
        },
      },
      boxShadow: {
        editorial: '0 1px 0 0 rgba(255,255,255,0.04) inset, 0 24px 60px -28px rgba(0,0,0,0.9)',
        lift: '0 32px 70px -36px rgba(0,0,0,0.95)',
        ring: '0 0 0 1px rgba(255,255,255,0.06)',
      },
      borderRadius: {
        xs: '6px',
        sm: '8px',
        md: '12px',
      },
      transitionTimingFunction: {
        editorial: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
      },
      animation: {
        shimmer: 'shimmer 2.4s ease-in-out infinite',
        float: 'float 10s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
