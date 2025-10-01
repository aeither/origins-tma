import { defineConfig } from 'vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteTsConfigPaths from 'vite-tsconfig-paths'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { nitroV2Plugin } from '@tanstack/nitro-v2-vite-plugin'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

const config = defineConfig({
  plugins: [
    // this is the plugin that enables path aliases
    viteTsConfigPaths({
      projects: ['./tsconfig.json'],
    }),
    // Node.js polyfills for browser (fixes Buffer not found error)
    nodePolyfills({
      include: ['buffer', 'process', 'util', 'stream'],
      globals: {
        Buffer: true,
        process: true,
      },
    }),
    tailwindcss(),
    tanstackStart(),
    nitroV2Plugin({ 
      preset: 'vercel',
      compatibilityDate: '2025-10-02' // Nitro compatibility date
    }) as any, // Vercel deployment configuration
    react(),
  ],
  server: {
    allowedHosts: true, // Allow all hosts for ngrok development
    host: true, // Allow external connections
    cors: {
      origin: true, // Allow all origins
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    },
  },
  optimizeDeps: {
    include: ['@ton/ton', '@tonconnect/ui-react', 'buffer'],
    esbuildOptions: {
      define: {
        global: 'globalThis',
      },
    },
  },
  define: {
    'process.env': {},
    global: 'globalThis',
  },
})

export default config
