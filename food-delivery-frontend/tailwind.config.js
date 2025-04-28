// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#FF6B6B",
          hover: "#ff5252",
        },
        secondary: {
          DEFAULT: "#4ECDC4",
          hover: "#3dbdb5",
        },
        background: "#FAFAFA",
        text: "#292F36",
      },
    },
  },
  plugins: [],
};
