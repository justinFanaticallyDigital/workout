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
          push: ftColor("push"),
          pull: ftColor("pull"),
          legs: ftColor("legs"),
          core: ftColor("core"),
          "success-fg": ftColor("success-fg"),
          "success-bg": ftColor("success-bg"),
          "success-br": ftColor("success-br"),
          "warn-fg": ftColor("warn-fg"),
          "warn-bg": ftColor("warn-bg"),
          "warn-br": ftColor("warn-br"),
          "danger-fg": ftColor("danger-fg"),
          "danger-bg": ftColor("danger-bg"),
          "danger-br": ftColor("danger-br"),
          "info-fg": ftColor("info-fg"),
          "info-bg": ftColor("info-bg"),
          "info-br": ftColor("info-br"),
        },
      },
      fontFamily: {
        mono: ["var(--ft-font-mono)"],
        sans: ["var(--ft-font-sans)"],
        display: ["var(--ft-font-display)"],
        data: ["var(--ft-font-data)"],
        body: ["var(--ft-font-body)"],
      },
      borderRadius: {
        ft: "var(--ft-radius)",
      },
    },
  },
  plugins: [],
};
export default config;
