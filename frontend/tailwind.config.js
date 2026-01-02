/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Custom colors matching the UI design
        primary: '#4F46E5',
        secondary: '#10B981',
        danger: '#EF4444',
        warning: '#F59E0B',
        'screen-on': '#10B981',
        'screen-off': '#6B7280',
        'app-active': '#8B5CF6',
        'offline': '#EF4444'
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}