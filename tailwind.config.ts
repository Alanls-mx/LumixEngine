import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        jakarta: ['"Plus Jakarta Sans"', 'sans-serif'],
      },
      colors: {
        night: '#090D16',
        panel: '#0F172A',
        borderline: '#1E293B',
        violetGlow: '#10B981',
        magentaGlow: '#34D399',
      },
      boxShadow: {
        soft: '0 24px 80px rgba(2, 6, 23, 0.32)',
        violet: '0 18px 60px rgba(16, 185, 129, 0.18)',
      },
    },
  },
  plugins: [],
} satisfies Config;
