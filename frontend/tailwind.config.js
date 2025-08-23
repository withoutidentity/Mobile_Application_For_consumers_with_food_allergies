/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./context/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}"
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#2A9D8F",
        secondary: "#264653",
        warning: "#E9C46A",
        danger: "#E76F51",
        safe: "#2A9D8F",
        unsafe: "#E76F51",
        caution: "#E9C46A",
        background: "#F8F9FA",
        card: "#FFFFFF",
        text: "#333333",
        textLight: "#666666",
        border: "#E5E5E5",
        light: {
          text: "#333333",
          background: "#F8F9FA",
          tint: "#2A9D8F",
          tabIconDefault: "#ccc",
          tabIconSelected: "#2A9D8F",
        },
      },
    },
  },
  plugins: [],
};
