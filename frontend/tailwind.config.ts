import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        neon: {
          cyan: "#22d3ee",
          pink: "#ec4899",
          red: "#ef4444"
        }
      },
      boxShadow: {
        glow: "0 0 30px rgba(34, 211, 238, 0.35)"
      }
    }
  },
  plugins: []
};

export default config;
