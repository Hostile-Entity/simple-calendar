import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["icons/pwa-192.svg", "icons/pwa-512.svg"],
      manifest: {
        name: "Simple Calendar",
        short_name: "Calendar",
        description: "Simple local-first calendar with color and notes",
        start_url: "/",
        display: "standalone",
        background_color: "#f3f8f8",
        theme_color: "#0f766e",
        icons: [
          {
            src: "/icons/pwa-192.svg",
            sizes: "192x192",
            type: "image/svg+xml",
            purpose: "any"
          },
          {
            src: "/icons/pwa-512.svg",
            sizes: "512x512",
            type: "image/svg+xml",
            purpose: "any"
          }
        ]
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,png,ico,woff2}"]
      }
    })
  ]
});
