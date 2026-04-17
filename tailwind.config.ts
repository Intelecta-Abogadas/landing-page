import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        verde: {
          DEFAULT: "hsl(var(--verde) / <alpha-value>)",
          dark: "hsl(var(--verde-dark) / <alpha-value>)",
          soft: "hsl(var(--verde-soft) / <alpha-value>)",
          mist: "hsl(var(--verde-mist) / <alpha-value>)",
        },
        blanco: "hsl(var(--blanco) / <alpha-value>)",
        texto: {
          DEFAULT: "hsl(var(--texto) / <alpha-value>)",
          light: "hsl(var(--texto-light) / <alpha-value>)",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
