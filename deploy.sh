#!/bin/bash

# Deploy script for Cloudflare Workers
# Run: ./deploy.sh

set -e

echo "🚀 Deploying Astro + React 19 app to Cloudflare Workers..."

# Build the application
echo "📦 Building application..."
npm run build:web

# Deploy to Workers
echo "☁️  Deploying to Cloudflare Workers..."
npx wrangler deploy --env=""

echo "✅ Deployment complete!"
echo "🌐 Your app should be available at: https://astro-convex-ai.your-account.workers.dev"