import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        ocean: {
          50: "#effcff",
          100: "#d9f7fc",
          200: "#b8eef7",
          300: "#7bddec",
          400: "#37c5d8",
          500: "#16a8bf",
          600: "#10879b",
          700: "#126c7d",
          800: "#155766",
          900: "#174956"
        },
        coral: "#ff8f7a",
        lavender: "#b9adff",
        sunshine: "#ffd66b"
      }
    }
  },
  plugins: []
};

export default config;
