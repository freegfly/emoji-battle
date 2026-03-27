/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'neon-purple': '#b24bf3',
        'neon-green': '#00ff88',
        'neon-pink': '#ff2d95',
        'neon-blue': '#00d4ff',
        'neon-yellow': '#ffed4a',
        'dark-bg': '#0a0a0f',
        'dark-card': '#15151f',
        'dark-border': '#2a2a3a',
      },
      boxShadow: {
        'neon-purple': '0 0 20px rgba(178, 75, 243, 0.5)',
        'neon-green': '0 0 20px rgba(0, 255, 136, 0.5)',
        'neon-pink': '0 0 20px rgba(255, 45, 149, 0.5)',
        'neon-blue': '0 0 20px rgba(0, 212, 255, 0.5)',
      },
      animation: {
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shake': 'shake 0.5s cubic-bezier(.36,.07,.19,.97) both',
        'slide-up': 'slideUp 0.3s ease-out',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'float': 'float 3s ease-in-out infinite',
        'attack-right': 'attackRight 0.4s ease-out',
        'attack-left': 'attackLeft 0.4s ease-out',
        'damage': 'damage 0.3s ease-out',
      },
      keyframes: {
        shake: {
          '10%, 90%': { transform: 'translate3d(-1px, 0, 0)' },
          '20%, 80%': { transform: 'translate3d(2px, 0, 0)' },
          '30%, 50%, 70%': { transform: 'translate3d(-4px, 0, 0)' },
          '40%, 60%': { transform: 'translate3d(4px, 0, 0)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        glow: {
          '0%': { boxShadow: '0 0 20px rgba(178, 75, 243, 0.3)' },
          '100%': { boxShadow: '0 0 40px rgba(178, 75, 243, 0.6)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        attackRight: {
          '0%': { transform: 'translateX(0)' },
          '50%': { transform: 'translateX(30px)' },
          '100%': { transform: 'translateX(0)' },
        },
        attackLeft: {
          '0%': { transform: 'translateX(0)' },
          '50%': { transform: 'translateX(-30px)' },
          '100%': { transform: 'translateX(0)' },
        },
        damage: {
          '0%': { filter: 'brightness(1)' },
          '50%': { filter: 'brightness(2) saturate(2)' },
          '100%': { filter: 'brightness(1)' },
        },
      },
    },
  },
  plugins: [],
}
