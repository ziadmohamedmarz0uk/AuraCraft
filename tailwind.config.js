/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        obsidian: {
          950: '#050505',
          900: '#0A0A0A',
          850: '#111111',
          800: '#161616',
          750: '#1C1C1C',
          700: '#262626',
          600: '#333333',
          500: '#484848',
          400: '#71717A',
          300: '#A1A1AA',
          200: '#D4D4D8',
          100: '#EDEDED',
          50: '#FAFAFA',
        },
        studio: {
          bg: '#0A0A0A',
          card: '#141414',
          sub: '#181818',
          border: '#262626',
          hover: '#383838',
          text: '#EDEDED',
          muted: '#8A8A8A',
        },
        accent: {
          cobalt: '#2563EB',
          'cobalt-hover': '#1D4ED8',
          indigo: '#4F46E5',
          blue: '#3B82F6',
        }
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        heading: ['Plus Jakarta Sans', 'Inter', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      letterSpacing: {
        tighter: '-0.04em',
        tight: '-0.02em',
      },
      boxShadow: {
        'subtle': '0 1px 2px 0 rgba(0, 0, 0, 0.4)',
        'card': '0 4px 20px -2px rgba(0, 0, 0, 0.5)',
      }
    },
  },
  plugins: [],
}
