import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteSingleFile } from 'vite-plugin-singlefile'

// `npm run build:preview` bundles everything into one HTML file (used for the shareable preview).
// Normal `npm run dev` / `npm run build` produce a regular React app that talks to Flask.
export default defineConfig(({ mode }) => ({
  plugins: [react(), ...(mode === 'preview' ? [viteSingleFile()] : [])],
  server: { port: 5173 },
  build: mode === 'preview' ? { outDir: 'dist-preview' } : {},
}))
