import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:5000", // backend server ka url/port
        changeOrigin: true,
        // secure: false, // agar self-signed SSL use ho to (normally hata do)
      },
    },
  },
});
