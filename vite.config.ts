import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'SIGnAL EDU',
        short_name: 'SIGnAL',
        description: 'AI 대학입시 컨설팅 플랫폼',
        theme_color: '#1a3a6b',
        background_color: '#ffffff',
        display: 'standalone',
        lang: 'ko',
        icons: [
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png' }
        ]
      }
    })
  ]
})
