const { fontFamily } = require('tailwindcss/defaultTheme');

module.exports = {
  darkMode: ['class'],
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './pages/**/*.{ts,tsx}',
    '../../packages/ui/components/**/*.{ts,tsx}'
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', ...fontFamily.sans]
      },
      colors: {
        background: {
          abyss: 'var(--background-abyss)',
        },
        surface: {
          glass: 'var(--surface-glass)',
        },
        accent: {
          'electric-jade': 'var(--accent-electric-jade)',
          'cyber-pink': 'var(--accent-cyber-pink)',
        },
        text: {
          bright: 'var(--text-bright)',
          muted: 'var(--text-muted)',
        },
        border: {
          glow: 'var(--border-glow)',
          strong: 'var(--border-strong)',
        },
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.5s ease-out forwards',
        'pulse-glow': 'pulseGlow 2s infinite ease-in-out',
        'background-pan': 'background-pan 15s ease infinite',
      },
      keyframes: {
        fadeInUp: {
          'from': { opacity: 0, transform: 'translateY(20px)' },
          'to': { opacity: 1, transform: 'translateY(0)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 5px var(--accent-electric-jade)' },
          '50%': { boxShadow: '0 0 15px var(--accent-electric-jade)' },
        },
        backgroundPan: {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
      },
    }
  },
  plugins: [require('tailwindcss-animate')]
};
