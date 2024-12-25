/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        customBlue: "#6EC1E5",
        customGreen: "#61ceb6",
        accentYellow: "#fcb700",
        accentBlue: "#3692b4",
        darkBlue: "#1D647E",
        lightBlue: "#E7F9FE",
        bgGray: "#f5f5f5",
        darkGray: "#666666",
      },
    },
  },
  plugins: [],
};
