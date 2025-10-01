import { defineConfig } from 'vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteTsConfigPaths from 'vite-tsconfig-paths'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { nitroV2Plugin } from '@tanstack/nitro-v2-vite-plugin'

const config = defineConfig({
  plugins: [
    // this is the plugin that enables path aliases
    viteTsConfigPaths({
      projects: ['./tsconfig.json'],
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
  // SSR configuration to handle Node built-ins
  ssr: {
    // Don't externalize these - bundle them with SSR
    noExternal: ['buffer', 'process'],
    resolve: {
      conditions: ['node', 'import', 'module', 'browser', 'default'],
      externalConditions: ['node', 'import', 'module', 'browser', 'default'],
    },
  },
  optimizeDeps: {
    include: ['@ton/ton', '@tonconnect/ui-react', 'buffer', 'process/browser'],
    esbuildOptions: {
      define: {
        global: 'globalThis',
      },
    },
  },
  resolve: {
    alias: {
      // Ensure buffer resolves correctly in both dev and build
      buffer: 'buffer/',
      // Add additional polyfills if needed
      process: 'process/browser',
    },
  },
  define: {
    // Define these at build time so they're available everywhere
    'process.env': '{}',
    'global': 'globalThis',
    // For production builds
    'process.browser': 'true',
  },
  build: {
    // Ensure polyfills are included in the final bundle
    commonjsOptions: {
      transformMixedEsModules: true,
      requireReturnsDefault: 'auto',
    },
    rollupOptions: {
      // Ensure buffer is properly bundled
      output: {
        inlineDynamicImports: false,
      },
    },
  },
})

export default config
