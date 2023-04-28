import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  base: "/destiny2shuffler",
  plugins: [react()],
  build: {
    outDir: "docs"
  },
})
