import {heroui} from "@heroui/theme"

/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)"],
        mono: ["var(--font-mono)"],
      },
    },
  },
  darkMode: "class",
  plugins: [heroui({
    layout: {
      radius: {
        small: "0px",
        medium: "0px",
        large: "0px",
      },
      borderWidth: {
        small: "1px",
        medium: "2px",
        large: "3px",
      },
    },
    themes: {
      light: {
        colors: {
          background: "#FFFFFF",
          foreground: "#000000",
          primary: {
            50: "#FEFCE8",
            100: "#FEF9C3",
            200: "#FEF08A",
            300: "#FDE047",
            400: "#FACC15",
            500: "#EAB308",
            600: "#CA8A04",
            700: "#A16207",
            800: "#854D0E",
            900: "#713F12",
            DEFAULT: "#FACC15", // Warning Yellow
            foreground: "#000000",
          },
          focus: "#000000",
        },
        layout: {
          hoverOpacity: 0.9, //  this is accurate
          disabledOpacity: 0.3, // this is accurate
        },
      },
      dark: {
        colors: {
          background: "#000000",
          foreground: "#EDEDED",
          primary: {
            50: "#422006",
            100: "#713F12",
            200: "#854D0E",
            300: "#A16207",
            400: "#CA8A04",
            500: "#EAB308",
            600: "#FACC15",
            700: "#FDE047",
            800: "#FEF08A",
            900: "#FEF9C3",
            DEFAULT: "#FACC15", // Warning Yellow
            foreground: "#000000",
          },
          focus: "#FACC15",
        },
        layout: {
          hoverOpacity: 0.9, //  this is accurate
          disabledOpacity: 0.3, // this is accurate
        },
      },
    },
  })],
}

module.exports = config;