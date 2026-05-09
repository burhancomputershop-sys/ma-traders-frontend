// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class', // class-based dark mode toggle
  theme: {
    extend: {
      colors: {
        // Dark Theme Colors
        dark: {
          bg:      '#0f172a',  // main background
          surface: '#1e293b',  // cards, sidebar
          border:  '#334155',  // borders
          hover:   '#2d3f55',  // hover states
          muted:   '#475569',  // muted elements
        },
        // Light Theme Colors
        light: {
          bg:      '#f1f5f9',
          surface: '#ffffff',
          border:  '#e2e8f0',
          hover:   '#f8fafc',
          muted:   '#94a3b8',
        },
        // Accent Colors (same in both themes)
        accent: {
          orange:       '#f97316',
          'orange-hover':'#ea6c0a',
          green:        '#22c55e',
          'green-hover': '#16a34a',
          red:          '#ef4444',
          'red-hover':  '#dc2626',
          blue:         '#3b82f6',
          yellow:       '#eab308',
        },
      },
      fontFamily: {
        sans: ['"DM Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        card: '0 4px 24px rgba(0,0,0,0.3)',
        'card-light': '0 4px 24px rgba(0,0,0,0.08)',
      },
    },
  },
  plugins: [],
};
