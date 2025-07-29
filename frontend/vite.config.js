// vite.config.js
import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"

export default defineConfig({
  base: "./", // ensures static assets load correctly
  plugins: [react()],
})
