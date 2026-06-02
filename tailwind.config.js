export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0b0b0d",
        graphite: "#171717",
        warm: "#f28a18",
        gold: "#d7a24a",
        pearl: "#f7f4ef"
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "Segoe UI", "Arial", "sans-serif"]
      },
      boxShadow: {
        glow: "0 0 40px rgba(242, 138, 24, 0.28)"
      }
    }
  },
  plugins: []
};
