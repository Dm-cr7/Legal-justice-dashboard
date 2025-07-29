import plugin from 'tailwindcss/plugin';

export default {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#f0f9ff", // lightest blue
        foreground: "#0f172a", // dark text
        border:     "#cbd5e1",
        input:      "#e2e8f0",
        ring:       "#3b82f6",

        primary: {
          DEFAULT:    "#3b82f6",   // blue-500
          foreground: "#ffffff",
        },
        secondary: {
          DEFAULT:    "#1e40af",   // blue-800
          foreground: "#ffffff",
        },
        accent: {
          DEFAULT:    "#dbeafe",   // blue-100
          foreground: "#1e3a8a",
        },
        muted: {
          DEFAULT:    "#e0f2fe",   // blue-200
          foreground: "#475569",
        },
        card: {
          DEFAULT:    "#f0f9ff",   // light card
          foreground: "#0f172a",
        },
        destructive: {
          DEFAULT:    "#ef4444",
          foreground: "#ffffff",
        },
        popover: {
          DEFAULT:    "#ffffff",
          foreground: "#1e293b",
        },
      },
      fontFamily: {
        sans:    ["Inter", "sans-serif"],
        heading: ["Poppins", "sans-serif"],
      },
      borderRadius: {
        lg: "1rem",
        md: "0.75rem",
        sm: "0.5rem",
      },
    },
  },
  plugins: [
    plugin(({ addUtilities }) => {
      addUtilities({
        ".bg-background":         { backgroundColor: "#f0f9ff" },
        ".text-foreground":       { color: "#0f172a" },
        ".border-border":         { borderColor: "#cbd5e1" },
        ".bg-input":              { backgroundColor: "#e2e8f0" },
        ".ring-ring":             { "--tw-ring-color": "#3b82f6" },

        ".bg-card":               { backgroundColor: "#f0f9ff" },
        ".text-card-foreground":  { color: "#0f172a" },

        ".bg-muted":              { backgroundColor: "#e0f2fe" },
        ".text-muted-foreground": { color: "#475569" },
      });
    }),
  ],
};
