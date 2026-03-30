import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: {
          light: "#FFFFFF",
          dark: "#212121",
        },
        surface: {
          light: "#F7F7F7",
          dark: "#2A2B32",
        },
        primary: {
          DEFAULT: "#FF7A00",
          light: "#FFA24C",
        },
        text: {
          primary: {
            light: "#1A1A1A",
            dark: "#FFFFFF",
          },
          secondary: {
            light: "#666666",
            dark: "#B3B3B3",
          },
        },
      },
      fontFamily: {
        sans: [
          "SF Pro Display",
          "SF Pro Text",
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "sans-serif",
        ],
      },
      borderRadius: {
        "2xl": "16px",
        "3xl": "24px",
      },
      animation: {
        "pulse-recording": "pulse-recording 1.5s ease-in-out infinite",
        "glow": "glow 2s ease-in-out infinite",
        "fade-in": "fadeIn 0.3s ease-out",
        "slide-up": "slideUp 0.4s ease-out",
        "scale-in": "scaleIn 0.2s ease-out",
        "spin-slow": "spin 1.2s linear infinite",
      },
      keyframes: {
        "pulse-recording": {
          "0%, 100%": { transform: "scale(1)", opacity: "1" },
          "50%": { transform: "scale(1.08)", opacity: "0.85" },
        },
        glow: {
          "0%, 100%": { boxShadow: "0 0 20px rgba(255, 122, 0, 0.3)" },
          "50%": { boxShadow: "0 0 40px rgba(255, 122, 0, 0.6)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.9)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
