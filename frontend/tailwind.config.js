const colors = require("tailwindcss/colors")

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      colors: {
        primary: colors.purple,
        secondary: colors.yellow,
        "section-darkest": "#0A0A0A",
        "section-darker": "#141414",
        "section-dark": "#1F1F1F",
      },
    },
  },
  plugins: [],
  safelist: [
    {
      pattern: /justify-.+/,
    },
    {
      pattern: /space-[xy]-\d+/,
    },
    {
      pattern: /text-(neutral|primary|gray)-\d+/,
    },
  ],
}
