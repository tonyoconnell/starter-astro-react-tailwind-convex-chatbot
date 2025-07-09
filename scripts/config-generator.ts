#!/usr/bin/env bun
/**
 * Configuration Generator
 * Automatically generates and updates all configuration files from the central port registry
 */

import { readFile, writeFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { PortRegistryUtils } from './port-registry';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

interface ConfigTemplate {
  file: string;
  generate: () => string | Promise<string>;
  description: string;
}

class ConfigGenerator {
  private templates: ConfigTemplate[] = [
    {
      file: 'package.json',
      generate: () => this.generatePackageJson(),
      description: 'Package.json scripts'
    },
    {
      file: '.env.example',
      generate: () => this.generateEnvExample(),
      description: 'Environment variables template'
    },
    {
      file: 'apps/web/astro.config.mjs',
      generate: () => this.generateAstroConfig(),
      description: 'Astro configuration'
    }
  ];

  private async generatePackageJson(): Promise<string> {
    const currentPath = join(projectRoot, 'package.json');
    const current = JSON.parse(await readFile(currentPath, 'utf-8'));
    
    // Generate dynamic scripts
    const dynamicScripts = PortRegistryUtils.getPackageScripts();
    
    // Merge with existing scripts, keeping non-port-related ones
    const updatedScripts = {
      ...current.scripts,
      ...dynamicScripts
    };

    const updated = {
      ...current,
      scripts: updatedScripts
    };

    return JSON.stringify(updated, null, 2) + '\n';
  }

  private generateEnvExample(): string {
    const envVars = PortRegistryUtils.getEnvVars();
    const userAstro = PortRegistryUtils.getAstroPort('user');
    const userLogs = PortRegistryUtils.getLogServerPort('user');
    const claudeAstro = PortRegistryUtils.getAstroPort('claude');
    const claudeLogs = PortRegistryUtils.getLogServerPort('claude');

    return `# === Development Server Ports ===
# Dual-range port allocation strategy

# Development Mode: user | claude | auto
DEV_MODE=user

# User Development Ports (${PortRegistryUtils.getRangeSummary('user')})
USER_ASTRO_PORT=${envVars.USER_ASTRO_PORT}
USER_LOG_SERVER_PORT=${envVars.USER_LOG_SERVER_PORT}

# Claude Testing Ports (${PortRegistryUtils.getRangeSummary('claude')})  
CLAUDE_ASTRO_PORT=${envVars.CLAUDE_ASTRO_PORT}
CLAUDE_LOG_SERVER_PORT=${envVars.CLAUDE_LOG_SERVER_PORT}

# Runtime ports (auto-selected based on DEV_MODE)
ASTRO_PORT=${envVars.ASTRO_PORT}
ASTRO_HOST=localhost
LOG_SERVER_PORT=${envVars.LOG_SERVER_PORT}

# === Log Forwarding Configuration ===

# Frontend log server URL (default: http://localhost:${userLogs}/log)
VITE_LOG_SERVER_URL=http://localhost:${userLogs}/log

# Enable/disable log forwarding (default: true in dev, false in prod)
ENABLE_LOG_FORWARDING=true

# Enable file logging on the server (default: false)
ENABLE_FILE_LOGGING=false

# Log file path (default: local-server/logs.txt)
LOG_FILE=local-server/logs.txt

# CORS allowed origins for log server (comma-separated)
CORS_ORIGINS=http://localhost:${userAstro},http://localhost:3000

# Maximum log message size in characters (default: 1000)
MAX_LOG_SIZE=1000

# === Authentication Configuration ===

# BetterAuth Configuration (updated for new port)
BETTER_AUTH_URL=http://localhost:${userAstro}
BETTER_AUTH_SECRET=your-secret-key-here-change-in-production

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id-here
GOOGLE_CLIENT_SECRET=your-google-client-secret-here

# GitHub OAuth  
GITHUB_CLIENT_ID=your-github-client-id-here
GITHUB_CLIENT_SECRET=your-github-client-secret-here

# === Convex Configuration ===
# Add your Convex deployment URL here
# CONVEX_URL=your-convex-deployment-url

# === Port Allocation Strategy ===
# User Development Range (${PortRegistryUtils.getRangeSummary('user')}):
#   ${userAstro}: Main Astro application (user development)
#   ${userLogs}: Local observability server (user development)
#
# Claude Testing Range (${PortRegistryUtils.getRangeSummary('claude')}):
#   ${claudeAstro}: Main Astro application (Claude testing)
#   ${claudeLogs}: Local observability server (Claude testing)
#
# This prevents port conflicts between manual development and automated testing
`;
  }

  private generateAstroConfig(): string {
    const userAstro = PortRegistryUtils.getAstroPort('user');
    
    return `import { defineConfig } from 'astro/config';
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
    port: parseInt(process.env.ASTRO_PORT || '${userAstro}'),
    host: process.env.ASTRO_HOST || 'localhost'
  },
  
  // Security configuration
  security: {
    checkOrigin: true,
  },
});
`;
  }

  async generateAll(): Promise<void> {
    console.log('🔧 Generating configuration files from port registry...\n');
    
    for (const template of this.templates) {
      try {
        console.log(`📝 Generating ${template.description}...`);
        const content = await template.generate();
        const filePath = join(projectRoot, template.file);
        await writeFile(filePath, content);
        console.log(`✅ Updated ${template.file}`);
      } catch (error) {
        console.error(`❌ Failed to generate ${template.file}:`, error);
      }
    }
    
    console.log('\n🎉 Configuration generation complete!');
    console.log('💡 All files now use the central port registry as the single source of truth.');
  }

  async verify(): Promise<void> {
    console.log('🔍 Verifying configuration consistency...\n');
    
    const envVars = PortRegistryUtils.getEnvVars();
    const issues: string[] = [];
    
    // Check package.json scripts
    try {
      const packageJson = JSON.parse(await readFile(join(projectRoot, 'package.json'), 'utf-8'));
      const expectedScripts = PortRegistryUtils.getPackageScripts();
      
      for (const [scriptName, expectedContent] of Object.entries(expectedScripts)) {
        if (packageJson.scripts[scriptName] !== expectedContent) {
          issues.push(`package.json script "${scriptName}" doesn't match registry`);
        }
      }
    } catch (error) {
      issues.push('Failed to verify package.json');
    }
    
    // Check .env.example
    try {
      const envContent = await readFile(join(projectRoot, '.env.example'), 'utf-8');
      for (const [envVar, expectedValue] of Object.entries(envVars)) {
        if (!envContent.includes(`${envVar}=${expectedValue}`)) {
          issues.push(`.env.example missing or incorrect ${envVar}=${expectedValue}`);
        }
      }
    } catch (error) {
      issues.push('Failed to verify .env.example');
    }
    
    if (issues.length === 0) {
      console.log('✅ All configurations are consistent with port registry');
    } else {
      console.log('❌ Configuration issues found:');
      issues.forEach(issue => console.log(`  - ${issue}`));
      console.log('\n💡 Run "bun scripts/config-generator.ts --generate" to fix these issues');
    }
  }

  async showStatus(): Promise<void> {
    console.log('📊 Port Registry Status\n');
    
    const ranges = PortRegistryUtils.getAllRanges();
    ranges.forEach(range => {
      console.log(`${range.emoji} ${range.name} (${PortRegistryUtils.getRangeSummary(range === PortRegistryUtils.getRange('user') ? 'user' : 'claude')}):`);
      range.ports.forEach(port => {
        console.log(`  ${port.port}: ${port.name} (${port.service})`);
      });
      console.log('');
    });
    
    console.log('🔧 Generated Environment Variables:');
    const envVars = PortRegistryUtils.getEnvVars();
    Object.entries(envVars).forEach(([key, value]) => {
      console.log(`  ${key}=${value}`);
    });
  }
}

// CLI interface
if (import.meta.main) {
  const generator = new ConfigGenerator();
  const args = process.argv.slice(2);
  
  if (args.includes('--generate') || args.includes('-g')) {
    await generator.generateAll();
  } else if (args.includes('--verify') || args.includes('-v')) {
    await generator.verify();
  } else if (args.includes('--status') || args.includes('-s')) {
    await generator.showStatus();
  } else {
    console.log('🔧 Configuration Generator');
    console.log('');
    console.log('Commands:');
    console.log('  --generate, -g    Generate all configuration files from port registry');
    console.log('  --verify, -v      Verify configurations match port registry');
    console.log('  --status, -s      Show current port registry status');
    console.log('');
    console.log('Examples:');
    console.log('  bun scripts/config-generator.ts --generate');
    console.log('  bun scripts/config-generator.ts --verify');
  }
}