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
  
  // Vite configuration optimized for Cloudflare Workers
  vite: {
    define: {
      global: 'globalThis',
    },
    ssr: {
      external: ['react', 'react-dom'],
      noExternal: ['@astrojs/cloudflare']
    },
    plugins: [
      {
        name: 'cf-workers-polyfill',
        async generateBundle(options, bundle) {
          // Import fs and path using dynamic import
          const fs = await import('fs');
          const path = await import('path');
          
          // Create a minimal synchronous MessageChannel polyfill
          const polyfillCode = `
// Minimal MessageChannel polyfill for React 19 SSR on Cloudflare Workers
(function() {
  'use strict';
  
  if (typeof globalThis.MessageChannel !== 'undefined') {
    return; // Already available
  }

  class MessagePortPolyfill extends EventTarget {
    constructor() {
      super();
      this.otherPort = null;
    }

    setOtherPort(port) {
      this.otherPort = port;
    }

    postMessage(message) {
      if (this.otherPort) {
        // Synchronous delivery for simplicity 
        const event = new MessageEvent('message', { data: message });
        this.otherPort.dispatchEvent(event);
      }
    }

    start() {
      // no-op
    }

    close() {
      this.otherPort = null;
    }
  }

  class MessageChannelPolyfill {
    constructor() {
      this.port1 = new MessagePortPolyfill();
      this.port2 = new MessagePortPolyfill();
      
      this.port1.setOtherPort(this.port2);
      this.port2.setOtherPort(this.port1);
    }
  }

  // Install polyfill immediately
  globalThis.MessageChannel = MessageChannelPolyfill;
  globalThis.MessagePort = MessagePortPolyfill;
})();
          `;
          
          // Inject polyfill at the beginning of worker files
          for (const [fileName, chunk] of Object.entries(bundle)) {
            if (chunk.type === 'chunk' && (
              fileName === 'index.js' || 
              fileName.includes('_worker.js') || 
              fileName.includes('renderers')
            )) {
              chunk.code = polyfillCode + '\n' + chunk.code;
            }
          }
        }
      }
    ]
  }
});