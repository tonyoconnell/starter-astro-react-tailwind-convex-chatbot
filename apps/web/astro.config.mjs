import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import cloudflare from '@astrojs/cloudflare';

// https://astro.build/config
export default defineConfig({
  output: 'server', // Enable SSR for API routes and middleware
  adapter: cloudflare({
    platformProxy: {
      enabled: true
    }
  }),
  integrations: [react({
    experimentalReactChildren: false,
  }), tailwind()],
  
  // Security configuration
  security: {
    checkOrigin: true,
  },
  
  // Vite configuration for polyfills
  vite: {
    define: {
      // Ensure MessageChannel is available during build
      global: 'globalThis',
    },
    ssr: {
      external: ['react', 'react-dom']
    }
  }
});