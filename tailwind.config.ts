import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0A0E1A",
        obsidian: "#131826",
        "obsidian-2": "#0E1420",
        steel: "#1c2438",
        "steel-2": "#2a3450",
        gold: "#D4A853",
        "gold-deep": "#A47F3B",
        "gold-soft": "#E5C384",
        amber: "#E8871E",
        ivory: "#F4EFE6",
        ash: "#6E7A8C",
        signal: "#639922",
        "signal-soft": "#80b834",
        crimson: "#C2453F",
        royal: "#7F77DD",
        "royal-soft": "#AFA9EC",
      },
      fontFamily: {
        display: ["Fraunces", "serif"],
        sans: ["Sora", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
    },
  },
  plugins: [],
};
export default config;
