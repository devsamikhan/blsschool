import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  // YEH LINE SAB SE ZAROORI HAI:
  base: '/', 
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [
    react(), 
    mode === "development" && componentTagger(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'assets/*.png', 'assets/*.svg'],
      manifest: {
        name: 'Blended Learning School',
        short_name: 'BLS ESAKHEL',
        description: 'Advanced Institutional Management Ecosystem',
        theme_color: '#0f172a',
        background_color: '#0f172a',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'android-chrome-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: 'android-chrome-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ],
        shortcuts: [
          {
            name: "LMS Dashboard",
            short_name: "Dashboard",
            description: "Access your personalized dashboard",
            url: "/admin/dashboard",
            icons: [{ src: "android-chrome-192x192.png", sizes: "192x192" }]
          },
          {
            name: "Academic Diary",
            short_name: "Diary",
            description: "Check latest homework and lessons",
            url: "/student/homework",
            icons: [{ src: "android-chrome-192x192.png", sizes: "192x192" }]
          }
        ],
        screenshots: [
          {
            src: "/assets/campus_exterior_v2.png",
            sizes: "1280x720",
            type: "image/png",
            form_factor: "wide",
            label: "Professional LMS Interface"
          },
          {
            src: "/assets/home_lab_hero_v2.png",
            sizes: "720x1280",
            type: "image/png",
            form_factor: "narrow",
            label: "Smart Mobile Learning"
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        maximumFileSizeToCacheInBytes: 10 * 1024 * 1024, 
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] }
            }
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'gstatic-fonts-cache',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] }
            }
          }
        ]
      },
      devOptions: {
        enabled: true,
        type: 'module',
        navigateFallback: 'index.html'
      }
    })
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));