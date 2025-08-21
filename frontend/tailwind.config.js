/** @type {import('tailwindcss').Config} */
module.exports = {
  // เพิ่ม NativeWind preset
  presets: [require("nativewind/preset")],

  content: [
    "./App.{js,jsx,ts,tsx}",
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}"
  ],

  theme: {
    extend: {},
  },
  plugins: [],
};
