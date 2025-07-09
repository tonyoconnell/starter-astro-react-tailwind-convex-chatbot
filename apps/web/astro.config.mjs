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
  
  // Development server configuration
  server: {
    port: parseInt(process.env.ASTRO_PORT || '5000'),
    host: process.env.ASTRO_HOST || 'localhost'
  },
  
  // Security configuration
  security: {
    checkOrigin: true,
  },
});