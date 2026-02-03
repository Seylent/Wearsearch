/** Tailwind config for consistent typography */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
    './pages/**/*.{js,ts,jsx,tsx}',
    './app/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        heading: ['"Helvetica Neue"', 'Arial Black', 'Arial', 'sans-serif'],
      },
      backgroundColor: {
        background: 'var(--background)',
      },
      colors: {
        foreground: 'var(--foreground)',
      },
    },
  },
  plugins: [],
};
