import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite' // 1. Import plugin Tailwind

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(), 
    tailwindcss() // 2. Tambahkan ke dalam array plugins
  ],
  server: {
    proxy: {
      '/api': 'http://localhost:3000', // Redirect otomatis request API ke port backend
    },
  },
})