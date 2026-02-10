import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        // Strategi tambahan biar data API otomatis kesimpen tanpa klik satu-satu
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.pathname.startsWith('/api'),
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 7, // 1 minggu
              },
            },
          },
        ],
      },
      includeAssets: [
        'favicon/favicon.ico',
        'favicon/apple-touch-icon.png',
        'favicon/favicon.svg',
      ],
      manifest: {
        name: 'E-Perpus SMA KI HAJAR DEWANTORO',
        short_name: 'E-Perpus',
        description:
          'Aplikasi Perpustakaan Digital SMA Ki Hajar Dewantoro Kota Tangerang',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',
        icons: [
          {
            src: 'favicon/favicon-96x96.png',
            sizes: '96x96',
            type: 'image/png',
          },
          {
            src: 'favicon/web-app-manifest-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'favicon/web-app-manifest-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'favicon/web-app-manifest-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
    }),
  ],
  // --- TAMBAHKAN BLOK INI BRE ---
  esbuild: {
    // Hapus console.log dan debugger otomatis pas build
    drop: ['console', 'debugger'],
  },
  // ------------------------------
  server: {
    proxy: {
      '/api': 'https://apiprawira.my.id',
      '/uploads': { target: 'https://apiprawira.my.id', changeOrigin: true },
    },
  },
  resolve: {
    preserveSymlinks: false,
    alias: {},
  },
})
