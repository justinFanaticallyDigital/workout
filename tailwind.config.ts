import type { Config } from "tailwindcss";

function ftColor(varName: string) {
  return `rgb(var(--ft-${varName}) / <alpha-value>)`;
}

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
          bg: ftColor("bg"),
          surface: ftColor("surface"),
          card: ftColor("card"),
          muted: ftColor("muted"),
          border: ftColor("border"),
          light: ftColor("light"),
          pale: ftColor("pale"),
          white: ftColor("white"),
          accent: ftColor("accent"),
          dim: ftColor("dim"),
          success: ftColor("success"),
          warn: ftColor("warn"),
          danger: ftColor("danger"),
          "data-1": ftColor("data-1"),
          "data-2": ftColor("data-2"),
          "data-3": ftColor("data-3"),
          "data-4": ftColor("data-4"),
          "data-5": ftColor("data-5"),
          "data-6": ftColor("data-6"),
        },
      },
      fontFamily: {
        mono: ["var(--ft-font-mono)"],
        sans: ["var(--ft-font-sans)"],
      },
    },
  },
  plugins: [],
};
export default config;
