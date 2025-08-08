import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  assetsInclude: ['**/*.mp3'],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html')
      }
    },
    copyPublicDir: true,
    assetsDir: 'assets'
  },
  publicDir: 'public'
})
