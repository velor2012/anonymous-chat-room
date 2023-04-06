/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./app/**/*.{js,ts,jsx,tsx}",
        "./pages/**/*.{js,ts,jsx,tsx}",
        "./components/**/*.{js,ts,jsx,tsx.css}",
     
        // Or if using `src` directory:
        "./src/**/*.{js,ts,jsx,tsx}",
      ],
  theme: {
    extend: {},
  },
  plugins: [require("daisyui")],
};
