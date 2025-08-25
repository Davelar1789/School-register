import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa"; // ✅ PWA plugin

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate", // service worker auto-update
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
        globPatterns: ["**/*.{js,css,html,svg,png,ico,json}"], // precache all build files
        runtimeCaching: [
          {
            urlPattern: /^https?.*\/api\/.*$/, // API calls
            handler: "NetworkFirst",
            options: {
              cacheName: "api-cache",
              networkTimeoutSeconds: 5
            }
          },
          {
            urlPattern: /^https?.*\.(js|css|html|svg|png|ico|json)$/, // static assets
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "assets-cache"
            }
          }
        ]
      }
    })
  ],
  server: {
    proxy: {
      "/api": { target: "http://localhost:8000", secure: false },
    },
  },
});
