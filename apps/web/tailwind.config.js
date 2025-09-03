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
        // Cybernetic Night Theme
        cyber: {
          bg: '#0A0A0A',
          'bg-secondary': '#111111',
          'bg-tertiary': '#1A1A1A',
          accent: '#00D4FF',
          'accent-secondary': '#0099CC',
          'accent-glow': 'rgba(0, 212, 255, 0.3)',
          text: '#FFFFFF',
          'text-secondary': '#B3B3B3',
          'text-muted': '#666666',
          border: '#333333',
          'border-accent': '#00D4FF',
          success: '#00FF88',
          warning: '#FFB800',
          error: '#FF4444',
          info: '#00D4FF',
        },
      },
      boxShadow: {
        'cyber': '0 0 20px rgba(0, 212, 255, 0.3)',
        'cyber-sm': '0 0 10px rgba(0, 212, 255, 0.2)',
        'cyber-lg': '0 0 30px rgba(0, 212, 255, 0.4)',
      },
      animation: {
        'cyber-pulse': 'cyber-pulse 2s ease-in-out infinite',
        'cyber-glow': 'cyber-glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        'cyber-pulse': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        'cyber-glow': {
          '0%': { boxShadow: '0 0 5px rgba(0, 212, 255, 0.2)' },
          '100%': { boxShadow: '0 0 20px rgba(0, 212, 255, 0.6)' },
        },
      },
    }
  },
  plugins: [require('tailwindcss-animate')]
};
