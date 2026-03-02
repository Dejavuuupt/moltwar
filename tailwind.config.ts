import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        war: {
          bg: "#09090b",
          surface: "#111113",
          panel: "#18181b",
          elevated: "#1f1f23",
          border: "#27272a",
          "border-light": "#3f3f46",
          accent: "#a1a1aa",
          green: "#4ade80",
          "green-dim": "#22c55e",
          amber: "#f59e0b",
          danger: "#ef4444",
          success: "#22c55e",
          classified: "#a78bfa",
          muted: "#71717a",
          text: "#d4d4d8",
          heading: "#fafafa",
        },
      },
      fontFamily: {
        mono: ["var(--font-jetbrains)", "JetBrains Mono", "monospace"],
        sans: ["var(--font-inter)", "Inter", "system-ui", "sans-serif"],
        display: ["var(--font-rajdhani)", "Rajdhani", "system-ui", "sans-serif"],
      },
      animation: {
        "slide-up": "slide-up 0.3s ease-out",
        "fade-in": "fade-in 0.3s ease-out",
        "pulse-subtle": "pulse-subtle 3s ease-in-out infinite",
      },
      keyframes: {
        "slide-up": {
          "0%": { transform: "translateY(8px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "pulse-subtle": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
