#!/usr/bin/env bun

/**
 * Development Commands Help System
 * Shows all available commands with descriptions and examples
 */

import { PortRegistryUtils } from './port-registry';

interface Command {
  name: string;
  description: string;
  example: string;
  ports?: string;
  category: string;
}

class HelpSystem {
  private getCommands(): Command[] {
    const userAstro = PortRegistryUtils.getAstroPort('user');
    const userLogs = PortRegistryUtils.getLogServerPort('user');
    const claudeAstro = PortRegistryUtils.getAstroPort('claude');
    const claudeLogs = PortRegistryUtils.getLogServerPort('claude');
    const userRange = PortRegistryUtils.getRangeSummary('user');
    const claudeRange = PortRegistryUtils.getRangeSummary('claude');

    return [
      // Startup Commands
      {
        name: 'bun start',
        description: 'Start both services (user range)',
        example: 'bun start',
        ports: `${userAstro}/${userLogs}`,
        category: 'startup'
      },
      {
        name: 'bun start:claude',
        description: 'Start both services (Claude range)',
        example: 'bun start:claude',
        ports: `${claudeAstro}/${claudeLogs}`,
        category: 'startup'
      },
      {
        name: 'bun start:auto',
        description: 'Auto-detect best available ports',
        example: 'bun start:auto',
        ports: 'auto',
        category: 'startup'
      },

      // Development Commands
      {
        name: 'bun dev:app-only',
        description: 'Main Astro app only (user)',
        example: 'bun dev:app-only',
        ports: userAstro.toString(),
        category: 'development'
      },
      {
        name: 'bun dev:logs-only',
        description: 'Log server only (user)',
        example: 'bun dev:logs-only',
        ports: userLogs.toString(),
        category: 'development'
      },
      {
        name: 'bun dev:claude-app',
        description: 'Main Astro app only (Claude)',
        example: 'bun dev:claude-app',
        ports: claudeAstro.toString(),
        category: 'development'
      },
      {
        name: 'bun dev:claude-logs',
        description: 'Log server only (Claude)',
        example: 'bun dev:claude-logs',
        ports: claudeLogs.toString(),
        category: 'development'
      },
      {
        name: 'bun dev:instruct',
        description: 'Instructions for 2-terminal setup (user & Claude)',
        example: 'bun dev:instruct',
        category: 'development'
      },

      // Port Management
      {
        name: 'bun ports:check',
        description: 'Check all server ports',
        example: 'bun ports:check',
        category: 'ports'
      },
      {
        name: 'bun ports:check:user',
        description: `Check user range (${userRange})`,
        example: 'bun ports:check:user',
        ports: userRange,
        category: 'ports'
      },
      {
        name: 'bun ports:check:claude',
        description: `Check Claude range (${claudeRange})`,
        example: 'bun ports:check:claude',
        ports: claudeRange,
        category: 'ports'
      },
      {
        name: 'bun ports:kill',
        description: 'Kill processes on all ports',
        example: 'bun ports:kill',
        category: 'ports'
      },
      {
        name: 'bun ports:kill:user',
        description: 'Kill processes on user ports',
        example: 'bun ports:kill:user',
        category: 'ports'
      },
      {
        name: 'bun ports:kill:claude',
        description: 'Kill processes on Claude ports',
        example: 'bun ports:kill:claude',
        category: 'ports'
      },

      // Convex Commands
      {
        name: 'bun convex:dev',
        description: 'Start Convex backend development',
        example: 'bun convex:dev',
        category: 'convex'
      },
      {
        name: 'bun convex:deploy',
        description: 'Deploy Convex backend',
        example: 'bun convex:deploy',
        category: 'convex'
      },

      // Build Commands
      {
        name: 'bun build',
        description: 'Build all packages',
        example: 'bun build',
        category: 'build'
      },
      {
        name: 'bun test',
        description: 'Run all tests',
        example: 'bun test',
        category: 'testing'
      },
      {
        name: 'bun test:e2e',
        description: 'Run E2E tests',
        example: 'bun test:e2e',
        category: 'testing'
      }
    ];
  }

  private showCategory(category: string, commands: Command[]): void {
    const categoryEmojis: Record<string, string> = {
      'startup': '🚀',
      'development': '⚙️',
      'ports': '🔌',
      'convex': '🌐',
      'build': '🏗️',
      'testing': '🧪'
    };

    const categoryNames: Record<string, string> = {
      'startup': 'Startup Commands',
      'development': 'Development Commands',
      'ports': 'Port Management',
      'convex': 'Convex Commands',
      'build': 'Build Commands',
      'testing': 'Testing Commands'
    };

    const emoji = categoryEmojis[category] || '📋';
    const name = categoryNames[category] || category;
    
    console.log(`${emoji} ${name}`);
    console.log('────────────────────────────────────────');
    
    commands.forEach(cmd => {
      const ports = cmd.ports ? ` (${cmd.ports})` : '';
      console.log(`  ${cmd.name}${ports}`);
      console.log(`    ${cmd.description}`);
      console.log(`    Example: ${cmd.example}`);
      console.log('');
    });
  }

  private showPortRanges(): void {
    const userRange = PortRegistryUtils.getRange('user');
    const claudeRange = PortRegistryUtils.getRange('claude');
    const userAstro = PortRegistryUtils.getAstroPort('user');
    const userLogs = PortRegistryUtils.getLogServerPort('user');
    const claudeAstro = PortRegistryUtils.getAstroPort('claude');
    const claudeLogs = PortRegistryUtils.getLogServerPort('claude');

    console.log('🌐 Port Ranges');
    console.log('────────────────────────────────────────');
    console.log(`👤 User Development Range (${PortRegistryUtils.getRangeSummary('user')}):`);
    console.log(`  • ${userAstro}: Main Astro application`);
    console.log(`  • ${userLogs}: Local observability server`);
    console.log('');
    console.log(`🤖 Claude Testing Range (${PortRegistryUtils.getRangeSummary('claude')}):`);
    console.log(`  • ${claudeAstro}: Main Astro application`);
    console.log(`  • ${claudeLogs}: Local observability server`);
    console.log('');
  }

  private showQuickStart(): void {
    const userAstro = PortRegistryUtils.getAstroPort('user');
    const userLogs = PortRegistryUtils.getLogServerPort('user');
    const userRange = PortRegistryUtils.getRangeSummary('user');
    const claudeRange = PortRegistryUtils.getRangeSummary('claude');

    console.log('⚡ Quick Start Guide');
    console.log('────────────────────────────────────────');
    console.log('New to this project? Try these commands:');
    console.log('');
    console.log('1. 📦 Install dependencies:');
    console.log('   bun install');
    console.log('');
    console.log('2. 🚀 Start development (recommended):');
    console.log('   bun start:auto          # Auto-detects best ports');
    console.log(`   bun start               # User range (${userRange})`);
    console.log(`   bun start:claude        # Claude range (${claudeRange})`);
    console.log('');
    console.log('3. 🔌 Check port availability:');
    console.log('   bun ports:check         # See all port status');
    console.log('');
    console.log('4. 🌐 Access your app:');
    console.log(`   http://localhost:${userAstro}   # Main application`);
    console.log(`   http://localhost:${userLogs}   # Log server health`);
    console.log('');
  }

  private showExamples(): void {
    console.log('📚 Common Usage Examples');
    console.log('────────────────────────────────────────');
    console.log('Here are some common development scenarios:');
    console.log('');
    console.log('🎯 Starting Development:');
    console.log('   bun start:auto          # Let system pick best ports');
    console.log('   bun start               # Use user range');
    console.log('   bun start:claude        # Use Claude range');
    console.log('');
    console.log('🔧 Port Management:');
    console.log('   bun ports:check         # Check all ports');
    console.log('   bun ports:kill:user     # Kill user range processes');
    console.log('   bun ports:kill:claude   # Kill Claude range processes');
    console.log('');
    console.log('⚙️ Development Workflow:');
    console.log('   bun dev:instruct        # Get manual setup instructions');
    console.log('   bun dev:app-only        # Run just the app');
    console.log('   bun dev:logs-only       # Run just the log server');
    console.log('');
    console.log('🧪 Testing:');
    console.log('   bun test                # Run unit tests');
    console.log('   bun test:e2e            # Run end-to-end tests');
    console.log('');
  }

  private showPortsHelp(): void {
    console.log('🔌 Port Management Help');
    console.log('────────────────────────────────────────');
    this.showPortRanges();
    console.log('🔧 Port Commands:');
    console.log('   bun ports:check         # Check all ports');
    console.log('   bun ports:check:user    # Check user range only');
    console.log('   bun ports:check:claude  # Check Claude range only');
    console.log('   bun ports:kill          # Kill all development processes');
    console.log('   bun ports:kill:user     # Kill user range processes');
    console.log('   bun ports:kill:claude   # Kill Claude range processes');
    console.log('');
    console.log('💡 Tips:');
    console.log('   • Use start:auto for automatic port selection');
    console.log('   • Check ports before starting development');
    console.log('   • Kill processes if you encounter port conflicts');
    console.log('');
  }

  public run(): void {
    const args = process.argv.slice(2);
    
    if (args.includes('--quick')) {
      this.showQuickStart();
      return;
    }
    
    if (args.includes('--examples')) {
      this.showExamples();
      return;
    }
    
    if (args.includes('--ports')) {
      this.showPortsHelp();
      return;
    }
    
    // Show full help
    console.log('🛠️  Development Commands Help');
    console.log('════════════════════════════════════════');
    console.log('');
    
    const commands = this.getCommands();
    const categories = [...new Set(commands.map(cmd => cmd.category))];
    
    categories.forEach(category => {
      const categoryCommands = commands.filter(cmd => cmd.category === category);
      this.showCategory(category, categoryCommands);
    });

    // Show port ranges
    this.showPortRanges();
    
    // Show footer
    console.log('💡 Pro Tips:');
    console.log('  • Use bun help --quick for quick start guide');
    console.log('  • Use bun help --examples for common usage patterns');
    console.log('  • Use bun help --ports for detailed port information');
    console.log('  • Most commands support --help flag for specific help');
    console.log('');
    console.log('🆘 Need more help? Check the documentation:');
    console.log('  • CLAUDE.md - Complete development guide');
    console.log('  • local-server/README.md - Observability details');
    console.log('  • .env.example - Configuration options');
  }
}

// Run help system if this file is executed directly
if (import.meta.main) {
  const help = new HelpSystem();
  help.run();
}