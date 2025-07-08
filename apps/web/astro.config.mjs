import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import cloudflare from '@astrojs/cloudflare';

// https://astro.build/config
export default defineConfig({
  output: 'hybrid', // Allows SSR for API routes while keeping pages static
  adapter: cloudflare({
    platformProxy: {
      enabled: true
    }
  }),
  integrations: [react(), tailwind()],
  
  // Security headers for authentication
  security: {
    checkOrigin: true,
  },
  
  // Enable experimental features for better auth support
  experimental: {
    hybridOutput: true,
  },
});