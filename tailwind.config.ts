import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ft: {
          bg: "#1a1a1a",
          surface: "#2e2e2e",
          card: "#434343",
          muted: "#666666",
          border: "#555555",
          light: "#cccccc",
          pale: "#efefef",
          white: "#ffffff",
          accent: "#e0e0e0",
          dim: "#888888",
          success: "#6fbf73",
          warn: "#e6a23c",
          danger: "#ef5350",
        },
      },
      fontFamily: {
        mono: ["'Courier New'", "Courier", "monospace"],
        sans: ["system-ui", "-apple-system", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
