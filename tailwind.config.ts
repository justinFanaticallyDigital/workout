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
          // Background hierarchy
          bg: ftColor("bg"),
          "bg-alt": ftColor("bg-alt"),
          surface: ftColor("surface"),
          "surface-alt": ftColor("surface-alt"),
          card: ftColor("card"),
          "surface-raised": ftColor("surface-raised"),

          // Text
          muted: ftColor("muted"),
          dim: ftColor("dim"),
          light: ftColor("light"),
          pale: ftColor("pale"),
          white: ftColor("white"),
          "text-on-accent": ftColor("text-on-accent"),
          "on-accent": ftColor("text-on-accent"),
          "on-bg": ftColor("text-on-bg"),
          "on-bg-sec": ftColor("text-on-bg-sec"),
          "on-bg-ter": ftColor("text-on-bg-ter"),

          // Borders
          border: ftColor("border"),
          "border-faint": ftColor("border-faint"),
          "border-strong": ftColor("border-strong"),

          // Accent
          accent: ftColor("accent"),
          "accent-secondary": ftColor("accent-secondary"),
          "accent-fg": ftColor("accent-fg"),
          "accent-faint": ftColor("accent-faint"),
          "accent-border": ftColor("accent-border"),
          // On-bg accent family (Blueprint-safe — see ARCHITECTURE.md §1)
          "accent-on-bg": ftColor("accent-on-bg"),
          "accent-faint-on-bg": ftColor("accent-faint-on-bg"),
          "accent-border-on-bg": ftColor("accent-border-on-bg"),

          // Movement
          push: ftColor("push"),
          pull: ftColor("pull"),
          legs: ftColor("legs"),
          core: ftColor("core"),

          // State — base
          success: ftColor("success"),
          warn: ftColor("warn"),
          danger: ftColor("danger"),
          info: ftColor("info"),

          // State — Fg/Bg/Border
          "success-fg": ftColor("success-fg"),
          "success-bg": ftColor("success-bg"),
          "success-border": ftColor("success-border"),
          "success-br": ftColor("success-br"),
          "warn-fg": ftColor("warn-fg"),
          "warn-bg": ftColor("warn-bg"),
          "warn-border": ftColor("warn-border"),
          "warn-br": ftColor("warn-br"),
          "danger-fg": ftColor("danger-fg"),
          "danger-bg": ftColor("danger-bg"),
          "danger-border": ftColor("danger-border"),
          "danger-br": ftColor("danger-br"),
          "info-fg": ftColor("info-fg"),
          "info-bg": ftColor("info-bg"),
          "info-border": ftColor("info-border"),
          "info-br": ftColor("info-br"),

          // Stamp
          "stamp-fg": ftColor("stamp-fg"),
          "stamp-bg": ftColor("stamp-bg"),
          "stamp-border": ftColor("stamp-border"),

          // Data viz palette
          "data-1": ftColor("data-1"),
          "data-2": ftColor("data-2"),
          "data-3": ftColor("data-3"),
          "data-4": ftColor("data-4"),
          "data-5": ftColor("data-5"),
          "data-6": ftColor("data-6"),
        },
      },
      fontFamily: {
        display: ["var(--ft-font-display)"],
        data: ["var(--ft-font-data)"],
        handwritten: ["var(--ft-font-handwritten)"],
        body: ["var(--ft-font-body)"],
        mono: ["var(--ft-font-mono)"],
        sans: ["var(--ft-font-sans)"],
        number: ["var(--ft-font-number)"],
      },
      borderRadius: {
        ft: "var(--ft-radius)",
        "ft-sm": "var(--ft-radius-sm)",
        "ft-md": "var(--ft-radius-md)",
        "ft-lg": "var(--ft-radius-lg)",
      },
      boxShadow: {
        "ft-sm": "var(--ft-shadow-sm)",
        "ft-md": "var(--ft-shadow-md)",
      },
    },
  },
  plugins: [],
};
export default config;
