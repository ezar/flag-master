import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

function buildVersion(): string {
  const d = new Date()
  const p = (n: number, l = 2) => String(n).padStart(l, '0')
  return `${String(d.getFullYear()).slice(2)}.${p(d.getMonth()+1)}.${p(d.getDate())}.${p(d.getHours())}${p(d.getMinutes())}`
}

export default defineConfig({
  define: {
    __BUILD_VERSION__: JSON.stringify(buildVersion()),
  },
  base: '/flag-master/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: { globPatterns: ['**/*.{js,css,html,ico,png,svg}'] },
      manifest: {
        name: 'FlagMaster — Atlas de Banderas',
        short_name: 'FlagMaster',
        description: 'Aprende las banderas del mundo en familia',
        theme_color: '#1a1209',
        background_color: '#f5edd6',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/flag-master/',
        scope: '/flag-master/',
        lang: 'es',
        icons: [
          { src: '/flag-master/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/flag-master/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
        ],
      },
    }),
  ],
})
