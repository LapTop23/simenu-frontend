/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
    './context/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      // ---------------------------------------------------------------
      // SiMenu design tokens. Named after their role in the brief, not
      // "primary/secondary" — keeps intent legible everywhere they're used.
      // ---------------------------------------------------------------
      colors: {
        ink: '#1B1F1C', // Charcoal Basil — primary text, dark surfaces
        paper: '#F6F5F1', // cool-neutral page background
        chili: {
          DEFAULT: '#D62828',
          dark: '#B01F1F',
        },
        saffron: {
          DEFAULT: '#E7A94C',
          dark: '#C98A2E',
        },
        basil: {
          DEFAULT: '#1F4D3D',
          dark: '#153A2D',
        },
        sand: '#E7E2D8',
      },
      fontFamily: {
        display: ['"Fraunces"', 'ui-serif', 'serif'],
        body: ['"Inter"', 'ui-sans-serif', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
      },
      keyframes: {
        'slide-up': {
          '0%': { transform: 'translateY(120%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'pop-in': {
          '0%': { transform: 'scale(0.85)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      animation: {
        'slide-up': 'slide-up 320ms cubic-bezier(0.22, 1, 0.36, 1)',
        'pop-in': 'pop-in 220ms cubic-bezier(0.22, 1, 0.36, 1)',
      },
    },
  },
  plugins: [],
};
