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
        background: 'var(--background-default)',
        surface: {
          raised: 'var(--surface-raised)',
          overlay: 'var(--surface-overlay)',
        },
        accent: {
          primary: 'var(--accent-primary)',
          'primary-hover': 'var(--accent-primary-hover)',
          secondary: 'var(--accent-secondary)',
        },
        text: {
          primary: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          disabled: 'var(--text-disabled)',
        },
        border: {
          subtle: 'var(--border-subtle)',
          interactive: 'var(--border-interactive)',
          focus: 'var(--border-focus)',
        },
      },
      boxShadow: {
        'focus-ring': '0 0 0 3px rgba(0, 230, 118, 0.2)',
      },
    }
  },
  plugins: [require('tailwindcss-animate')]
};
