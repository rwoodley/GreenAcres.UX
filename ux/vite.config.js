import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Set base path for GitHub Pages
  // For repo at github.com/username/GreenAcres.UX, it will be served at username.github.io/GreenAcres.UX/
  // Change to '/' if using a custom domain or deploying to username.github.io
  base: '/GreenAcres.UX/',
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
