/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: ["./App.tsx","./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
        fontFamily: {
          red_rose_regular: ['RedRose-Regular', 'sans-serif'],
          red_rose_bold: ['RedRose-Bold', 'sans-serif']
        }
    },
  },
  plugins: [],
}