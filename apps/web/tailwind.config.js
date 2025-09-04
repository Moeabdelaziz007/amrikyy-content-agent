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
          'deep-space': 'var(--background-deep-space)',
          'quantum-grid': 'var(--background-quantum-grid)',
          surface: 'var(--background-surface)',
        },
        accent: {
          'neon-green': 'var(--accent-neon-green)',
          'quantum-blue': 'var(--accent-quantum-blue)',
          'space-purple': 'var(--accent-space-purple)',
        },
        text: {
          primary: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          accent: 'var(--text-accent)',
        },
        border: {
          color: 'var(--border-color)',
          hover: 'var(--border-hover)',
        },
      },
      boxShadow: {
        'neon-glow': '0 0 15px var(--accent-neon-glow)',
      },
      animation: {
        'cyber-pulse': 'cyber-pulse 2s ease-in-out infinite',
      },
      keyframes: {
        'cyber-pulse': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
      },
    }
  },
  plugins: [require('tailwindcss-animate')]
};
