/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'sans': ['Inter', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'sans-serif'],
        'chinese': ['PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'sans-serif'],
      },
      colors: {
        primary: {
          50: '#f0f4ff',
          100: '#e0e7ff',
          500: '#4F46E5', // 主色蓝
          600: '#4F46E5',
          700: '#3730a3',
        },
        secondary: {
          500: '#9333EA', // 主色紫
          600: '#9333EA',
          700: '#7c3aed',
        },
        accent: {
          blue: '#3B82F6', // 强调色亮蓝
          green: '#10B981', // 强调色荧光绿
        },
        neutral: {
          50: '#F3F4F6', // 辅助色浅灰
          100: '#f9fafb',
          900: '#111827',
        }
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #4F46E5 0%, #9333EA 100%)',
        'gradient-hero': 'linear-gradient(135deg, #f0f4ff 0%, #ffffff 50%, #faf5ff 100%)',
      }
    },
  },
  plugins: [],
}
