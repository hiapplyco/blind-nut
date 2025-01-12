import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "#8B6E5B", // Mocha Mousse primary
          foreground: "#ffffff",
          hover: "#A18472", // Lighter Mocha for hover
          contrast: "#8B5CF6", // Vivid Purple for contrast
        },
        secondary: {
          DEFAULT: "#D2C0B2", // Lighter complementary brown
          foreground: "#44332A", // Darker brown for contrast
          contrast: "#D946EF", // Magenta Pink for additional contrast
        },
        destructive: {
          DEFAULT: "#ef4444",
          foreground: "#ffffff",
        },
        muted: {
          DEFAULT: "#F5F0ED", // Very light warm beige
          foreground: "#66534A", // Darker brown for text
          contrast: "#A78BFA", // Lighter purple for muted contrast
        },
        accent: {
          DEFAULT: "#EBE3DD", // Soft warm accent
          foreground: "#44332A", // Dark brown for contrast
          contrast: "#C4B5FD", // Softest purple for accent contrast
        },
        card: {
          DEFAULT: "#ffffff",
          foreground: "#44332A", // Dark brown for card text
        },
      },
      borderRadius: {
        lg: "0.5rem",
        md: "0.375rem",
        sm: "0.25rem",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;