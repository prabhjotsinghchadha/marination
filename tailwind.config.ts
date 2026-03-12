import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        yes: {
          DEFAULT: "#00e5a0",
          dim: "rgba(0,229,160,0.12)",
          border: "rgba(0,229,160,0.3)",
        },
        no: {
          DEFAULT: "#ff4b6e",
          dim: "rgba(255,75,110,0.12)",
          border: "rgba(255,75,110,0.3)",
        },
        surface: {
          DEFAULT: "#0e1520",
          2: "#141d2b",
          3: "#1a2535",
        },
        border: {
          DEFAULT: "rgba(255,255,255,0.07)",
        },
        text: {
          DEFAULT: "#c8d4e0",
          dim: "#5a6a7a",
        },
        accent: {
          DEFAULT: "#3b82f6",
          dim: "rgba(59,130,246,0.15)",
        },
        gold: {
          DEFAULT: "#f5a623",
          dim: "rgba(245,166,35,0.15)",
          border: "rgba(245,166,35,0.3)",
        },
        bg: "#080b10",
      },
      fontFamily: {
        mono: ['"Space Mono"', "monospace"],
        display: ["Syne", "sans-serif"],
      },
      keyframes: {
        slideIn: {
          from: { transform: "translateY(16px)", opacity: "0" },
          to: { transform: "translateY(0)", opacity: "1" },
        },
        fadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
      },
      animation: {
        slideIn: "slideIn 0.2s ease",
        fadeIn: "fadeIn 0.2s ease",
      },
      maxWidth: {
        app: "1400px",
      },
    },
  },
  plugins: [],
};

export default config;
