import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// Apna latest ngrok domain allowedHosts me add karo!
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    allowedHosts: [
      // Sirf apne ngrok ka domain yahan likho:
      "unissuant-annalise-unlecherously.ngrok-free.dev",
    ],
    proxy: {
      "/api": {
        target: "http://localhost:5000", // backend server ka url/port
        changeOrigin: true,
      },
    },
  },
});
