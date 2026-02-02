/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        background: "#0d0d0d", // Fundo muito escuro
        surface: "#171717",    // Cards
        border: "#262626",     // Bordas sutis
        primary: "#ffffff",
        secondary: "#a1a1aa",
        accent: "#3f3f46",
      }
    },
  },
  plugins: [],
}