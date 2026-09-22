import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: '#000000',
        surface: '#0d0d0d',
        'surface-elevated': '#111111',
        border: 'rgba(255,255,255,0.08)',
        primary: {
          DEFAULT: '#7c3aed',
          hover: '#6d28d9',
          light: '#8b5cf6',
        },
        accent: {
          purple: '#8b5cf6',
          indigo: '#6366f1',
          emerald: '#22c55e',
          blue: '#60a5fa',
          amber: '#fbbf24',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Menlo', 'Consolas', 'monospace'],
      }
    },
  },
  plugins: [],
};

export default config;
