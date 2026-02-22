import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

const REPO_BASE = "/simple-calendar/";

export default defineConfig({
  base: REPO_BASE,
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["icons/pwa-192.png", "icons/pwa-512.png", "icons/settings.svg"],
      manifest: {
        name: "Simple Calendar",
        short_name: "Calendar",
        description: "Simple local-first calendar with color and notes",
        start_url: REPO_BASE,
        scope: REPO_BASE,
        display: "standalone",
        background_color: "#f3f8f8",
        theme_color: "#0f766e",
        icons: [
          {
            src: "icons/pwa-192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any"
          },
          {
            src: "icons/pwa-512.png",
            sizes: "512x512",
            type: "image/png",
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
