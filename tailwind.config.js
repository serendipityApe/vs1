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
    themes: {
      light: {
        colors: {
          primary: {
            50: "#fef7ed",
            100: "#fdedd5",
            200: "#fbd9aa",
            300: "#f8c074",
            400: "#f39b21", // 主色
            500: "#ef8e19",
            600: "#e07312",
            700: "#b95c12",
            800: "#944917",
            900: "#783e16",
            950: "#401f09",
            DEFAULT: "#f39b21",
            foreground: "#ffffff",
          },
          secondary: {
            50: "#fff7ed",
            100: "#ffedd5",
            200: "#fed7aa",
            300: "#fdba74",
            400: "#fb923c",
            500: "#f97316", // 次要颜色：稍微偏红的橙色
            600: "#ea580c",
            700: "#c2410c",
            800: "#9a3412",
            900: "#7c2d12",
            950: "#431407",
            DEFAULT: "#f97316",
            foreground: "#ffffff",
          },
          warning: {
            50: "#fefce8",
            100: "#fef9c3",
            200: "#fef08a",
            300: "#fde047",
            400: "#facc15",
            500: "#eab308",
            600: "#ca8a04",
            700: "#a16207",
            800: "#854d0e",
            900: "#713f12",
            950: "#422006",
            DEFAULT: "#eab308",
            foreground: "#ffffff",
          },
        },
      },
      dark: {
        colors: {
          primary: {
            50: "#401f09",
            100: "#783e16",
            200: "#944917",
            300: "#b95c12",
            400: "#e07312",
            500: "#ef8e19",
            600: "#f39b21", // 主色
            700: "#f8c074",
            800: "#fbd9aa",
            900: "#fdedd5",
            950: "#fef7ed",
            DEFAULT: "#f39b21",
            foreground: "#000000",
          },
          secondary: {
            50: "#431407",
            100: "#7c2d12",
            200: "#9a3412",
            300: "#c2410c",
            400: "#ea580c",
            500: "#f97316", // 次要颜色
            600: "#fb923c",
            700: "#fdba74",
            800: "#fed7aa",
            900: "#ffedd5",
            950: "#fff7ed",
            DEFAULT: "#f97316",
            foreground: "#000000",
          },
          warning: {
            50: "#422006",
            100: "#713f12",
            200: "#854d0e",
            300: "#a16207",
            400: "#ca8a04",
            500: "#eab308",
            600: "#facc15",
            700: "#fde047",
            800: "#fef08a",
            900: "#fef9c3",
            950: "#fefce8",
            DEFAULT: "#eab308",
            foreground: "#000000",
          },
        },
      },
    },
  })],
}

module.exports = config;