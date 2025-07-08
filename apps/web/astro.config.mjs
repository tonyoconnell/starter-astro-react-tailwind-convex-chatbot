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
  integrations: [react(), tailwind()],
  
  // Security configuration
  security: {
    checkOrigin: true,
  },
});