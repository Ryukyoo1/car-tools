/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        base: '#05070a',
        card: '#141414',
        'card-hover': '#1a1a1a',
        'accent-blue': '#5b9cff',
        'accent-purple': '#9b8cff',
        'accent-gray': '#aeb6c2',
        'accent-amber': '#f2b45a',
        'accent-green': '#4fd18b',
        'accent-cyan': '#4fd8e8',
        'accent-yellow': '#f4d45c',
        'accent-indigo': '#7e8cff',
        'accent-red': '#e82127',
      },
      fontFamily: {
        sans: [
          'Microsoft YaHei',
          '微软雅黑',
          'PingFang SC',
          'Hiragino Sans GB',
          'Heiti SC',
          'sans-serif',
        ],
      },
      borderRadius: {
        sm: '14px',
        md: '18px',
        lg: '28px',
        tile: '24px',
      },
      boxShadow: {
        card: '0 1px 0 0 rgba(255,255,255,0.04) inset, 0 8px 30px rgba(0,0,0,0.4)',
        glass: '0 20px 60px rgba(0,0,0,0.35)',
      },
    },
  },
  plugins: [],
}
