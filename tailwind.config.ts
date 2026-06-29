import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Playfair Display", "Georgia", "serif"],
      },
      colors: {
        brand: {
          50:  "#f5f3ff",
          100: "#ede9fe",
          400: "#a78bfa",
          500: "#8b5cf6",
          600: "#7c3aed",
          700: "#6d28d9",
          900: "#1f0a4b",
        },
      },
      backgroundImage: {
        "hero-gradient": "linear-gradient(180deg, #1a0533 0%, #2d1b69 20%, #4c3399 35%, #6366f1 55%, #818cf8 70%, #a5b4fc 82%, #c4b5fd 90%, #e9d5ff 100%)",
        "dark-gradient": "linear-gradient(160deg, #0d0d1a 0%, #1a0a3a 40%, #0d1a3a 100%)",
        "card-gradient": "linear-gradient(135deg, rgba(124,58,237,0.25), rgba(88,28,220,0.15))",
      },
      backdropBlur: {
        xs: "4px",
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "wave": "wave 1.5s ease-in-out infinite",
      },
      keyframes: {
        wave: {
          "0%, 100%": { transform: "scaleY(0.4)" },
          "50%": { transform: "scaleY(1)" },
        },
      },
      boxShadow: {
        "glass": "0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)",
        "glow": "0 0 60px rgba(124,58,237,0.5), 0 0 120px rgba(124,58,237,0.2)",
        "btn": "0 8px 24px rgba(124,58,237,0.4)",
      },
    },
  },
  plugins: [],
};

export default config;
