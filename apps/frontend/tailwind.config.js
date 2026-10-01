/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: '#1C1F28',
          card:    '#141720',
          topbar:  '#111420',
          landing: '#050608',
        },
        border: {
          DEFAULT: '#2a2d3a',
        },
        text: {
          primary:   '#e2e8f0',
          secondary: '#a0a4b8',
          muted:     '#94A3B8',
        },
        fg: {
          DEFAULT: '#FFFFFF',
          2:       '#E2E8F0',
          muted:   '#94A3B8',
          faint:   'rgba(255,255,255,0.35)',
        },
        status: {
          ok:      '#22c55e',
          warning: '#eab308',
          danger:  '#ef4444',
          info:    '#3b82f6',
        },
      },
      fontFamily: {
        sans:    ['Space Grotesk', 'sans-serif'],
        body:    ['Inter', 'sans-serif'],
        mono:    ['JetBrains Mono', 'monospace'],
        hero:    ['Bebas Neue', 'sans-serif'],
        stencil: ['"Big Shoulders Stencil Text"', 'Impact', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 0 rgba(255,255,255,0.04) inset, 0 10px 30px -8px rgba(0,0,0,0.55)',
      },
    },
  },
  plugins: [],
}
