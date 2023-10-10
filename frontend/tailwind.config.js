const colors = require("tailwindcss/colors")
const { nextui } = require("@nextui-org/react")

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/api/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      colors: {
        primary: {
          DEFAULT: colors.purple[600],
          ...colors.purple,
        },
        secondary: colors.yellow,
        "section-darkest": "#0A0A0A",
        "section-darker": "#141414",
        "section-dark": "#1F1F1F",
      },
    },
  },
  plugins: [
    nextui({
      defaultTheme: "dark",
      addCommonColors: true,
    }),
  ],
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
