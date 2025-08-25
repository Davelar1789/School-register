import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

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
        // Only precache static assets (images, icons, JSON)
        globPatterns: ["**/*.{png,svg,ico,json}"],

        // Runtime caching strategies
        runtimeCaching: [
          {
            // HTML entry point
            urlPattern: /\/$/,
            handler: "NetworkFirst", // try network first, fallback to cache
            options: {
              cacheName: "html-cache",
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 24 * 60 * 60, // 1 day
              },
            },
          },
          {
            // JS & CSS files
            urlPattern: /^https?.*\.(js|css)$/,
            handler: "NetworkFirst",
            options: {
              cacheName: "assets-cache",
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 24 * 60 * 60, // 1 day
              },
            },
          },
          {
            // API requests can also have a cache strategy if needed
            urlPattern: /^https?.*\/api\/.*$/,
            handler: "NetworkFirst",
            options: {
              cacheName: "api-cache",
              networkTimeoutSeconds: 5,
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 5 * 60, // 5 minutes
              },
            },
          },
        ],
      },
    }),
  ],
  server: {
    proxy: {
      "/api": { target: "http://localhost:8000", secure: false },
    },
  },
});
