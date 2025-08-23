import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa"; // ✅ import the PWA plugin

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate", // auto-update service worker
      manifest: {
        name: "School Management System",
        short_name: "SchoolApp",
        start_url: "/",
        display: "standalone",
        background_color: "#ffffff",
        theme_color: "#1e3a8a",
        icons: [
          {
            src: "/icons/icon-192x192.png",
            sizes: "192x192",
            type: "image/png"
          },
          {
            src: "/icons/icon-512x512.png",
            sizes: "512x512",
            type: "image/png"
          }
        ]
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,png,ico,json}"] // precache all build files
      }
    })
  ],
  server: {
    proxy: {
      "/api": { target: "http://localhost:8000", secure: false },
    },
  },
});
