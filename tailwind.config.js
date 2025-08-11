/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ['ui-sans-serif', 'system-ui', 'Inter', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial'],
      },
      boxShadow: {
        'neon': '0 0 20px rgba(0, 255, 255, 0.35), inset 0 0 10px rgba(0, 255, 255, 0.15)',
      },
      colors: {
        'ink': '#0b0e1a',
        'panel': '#0f1428',
        'panel-2': '#0e1326',
        'accent': '#63f5ff',
        'accent-2': '#7d5fff',
        'accent-3': '#20f3a7'
      },
      backgroundImage: {
        'grid': 'linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)',
        'radial-fade': 'radial-gradient(1000px 500px at 50% -10%, rgba(99,245,255,0.15), transparent 60%)',
      }
    },
  },
  plugins: [],
}
