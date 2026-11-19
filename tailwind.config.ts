import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";
import typography from "@tailwindcss/typography";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    container: {
      center: true,
      padding: { DEFAULT: "1rem", sm: "1.5rem", lg: "2rem" },
      screens: { "2xl": "1280px" },
    },
    extend: {
      fontFamily: {
        // Devanagari fallback is included so Hindi text always renders.
        sans: ["var(--font-sans)", "var(--font-devanagari)", "system-ui", "sans-serif"],
        serif: ["var(--font-serif)", "var(--font-devanagari)", "Georgia", "serif"],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: { DEFAULT: "hsl(var(--primary))", foreground: "hsl(var(--primary-foreground))" },
        secondary: { DEFAULT: "hsl(var(--secondary))", foreground: "hsl(var(--secondary-foreground))" },
        destructive: { DEFAULT: "hsl(var(--destructive))", foreground: "hsl(var(--destructive-foreground))" },
        muted: { DEFAULT: "hsl(var(--muted))", foreground: "hsl(var(--muted-foreground))" },
        accent: { DEFAULT: "hsl(var(--accent))", foreground: "hsl(var(--accent-foreground))" },
        card: { DEFAULT: "hsl(var(--card))", foreground: "hsl(var(--card-foreground))" },
        popover: { DEFAULT: "hsl(var(--popover))", foreground: "hsl(var(--popover-foreground))" },
        forest: {
          50: "#f2f7f2", 100: "#e0ebe0", 200: "#c2d7c3", 300: "#97ba9a", 400: "#6a9870",
          500: "#4a7c51", 600: "#386340", 700: "#2d4f34", 800: "#26402c", 900: "#1f3525", 950: "#0f1d13",
        },
        gold: { 100: "#f8efd6", 200: "#efdcaa", 300: "#e4c477", 400: "#d8ac50", 500: "#c9973a", 600: "#ad782f", 700: "#8b5a28" },
        cream: { 50: "#fdfbf6", 100: "#faf5ea", 200: "#f3e9d3", 300: "#e9d9b6" },
        earth: { 500: "#8a6a45", 700: "#5c4329" },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      boxShadow: {
        soft: "0 10px 30px -12px rgba(31, 53, 37, 0.18)",
        glow: "0 0 0 1px rgba(201, 151, 58, 0.25), 0 12px 32px -12px rgba(201, 151, 58, 0.35)",
      },
      keyframes: {
        "float-slow": { "0%,100%": { transform: "translateY(0) rotate(0deg)" }, "50%": { transform: "translateY(-10px) rotate(3deg)" } },
      },
      animation: { "float-slow": "float-slow 8s ease-in-out infinite" },
    },
  },
  plugins: [animate, typography],
};

export default config;
