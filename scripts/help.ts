#!/usr/bin/env bun

/**
 * Development Commands Help System
 * Shows all available commands with descriptions and examples
 */

interface Command {
  name: string;
  description: string;
  example?: string;
  ports?: string;
  category: 'startup' | 'development' | 'ports' | 'testing' | 'build' | 'convex';
}

const commands: Command[] = [
  // Startup Commands
  {
    name: 'bun start',
    description: 'Start both services (user range)',
    example: 'bun start',
    ports: '5000/5001',
    category: 'startup'
  },
  {
    name: 'bun start:claude',
    description: 'Start both services (Claude range)',
    example: 'bun start:claude',
    ports: '5100/5101',
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
    ports: '5000',
    category: 'development'
  },
  {
    name: 'bun dev:logs-only',
    description: 'Log server only (user)',
    example: 'bun dev:logs-only',
    ports: '5001',
    category: 'development'
  },
  {
    name: 'bun dev:claude-app',
    description: 'Main Astro app only (Claude)',
    example: 'bun dev:claude-app',
    ports: '5100',
    category: 'development'
  },
  {
    name: 'bun dev:claude-logs',
    description: 'Log server only (Claude)',
    example: 'bun dev:claude-logs',
    ports: '5101',
    category: 'development'
  },
  {
    name: 'bun dev:isolated',
    description: 'Instructions for 2-terminal setup (user)',
    example: 'bun dev:isolated',
    category: 'development'
  },
  {
    name: 'bun dev:claude',
    description: 'Instructions for 2-terminal setup (Claude)',
    example: 'bun dev:claude',
    category: 'development'
  },

  // Port Management
  {
    name: 'bun ports:check',
    description: 'Check all port availability',
    example: 'bun ports:check',
    category: 'ports'
  },
  {
    name: 'bun ports:check:user',
    description: 'Check user range (5000-5005)',
    example: 'bun ports:check:user',
    ports: '5000-5005',
    category: 'ports'
  },
  {
    name: 'bun ports:check:claude',
    description: 'Check Claude range (5100-5105)',
    example: 'bun ports:check:claude',
    ports: '5100-5105',
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
    name: 'bun lint',
    description: 'Run linting',
    example: 'bun lint',
    category: 'build'
  }
];

const categoryEmojis = {
  startup: '🚀',
  development: '⚙️',
  ports: '🔌',
  testing: '🧪',
  build: '📦',
  convex: '🔄'
};

const categoryTitles = {
  startup: 'Startup Commands',
  development: 'Development Commands',
  ports: 'Port Management',
  testing: 'Testing Commands',
  build: 'Build Commands',
  convex: 'Convex Backend'
};

class HelpSystem {
  private showCategory(category: keyof typeof categoryEmojis, commands: Command[]): void {
    console.log(`\n${categoryEmojis[category]} ${categoryTitles[category]}`);
    console.log('─'.repeat(40));
    
    commands.forEach(cmd => {
      const ports = cmd.ports ? ` (${cmd.ports})` : '';
      console.log(`  ${cmd.name}${ports}`);
      console.log(`    ${cmd.description}`);
      if (cmd.example) {
        console.log(`    Example: ${cmd.example}`);
      }
      console.log('');
    });
  }

  private showPortRanges(): void {
    console.log('\n🎯 Port Allocation Strategy');
    console.log('─'.repeat(40));
    console.log('👤 User Development Range (5000-5099):');
    console.log('  • 5000: Main Astro application');
    console.log('  • 5001: Local observability server');
    console.log('  • 5002-5005: Reserved for future services');
    console.log('');
    console.log('🤖 Claude Testing Range (5100-5199):');
    console.log('  • 5100: Main Astro application (Claude)');
    console.log('  • 5101: Local observability server (Claude)');
    console.log('  • 5102-5105: Reserved for Claude test scenarios');
    console.log('');
    console.log('💡 Benefits:');
    console.log('  • No conflicts between manual development and automated testing');
    console.log('  • Clear separation of concerns');
    console.log('  • Independent service management');
  }

  private showQuickStart(): void {
    console.log('\n⚡ Quick Start Guide');
    console.log('─'.repeat(40));
    console.log('New to this project? Try these commands:');
    console.log('');
    console.log('1. 📦 Install dependencies:');
    console.log('   bun install');
    console.log('');
    console.log('2. 🚀 Start development (recommended):');
    console.log('   bun start:auto          # Auto-detects best ports');
    console.log('   bun start               # User range (5000/5001)');
    console.log('   bun start:claude        # Claude range (5100/5101)');
    console.log('');
    console.log('3. 🔌 Check port availability:');
    console.log('   bun ports:check         # See all port status');
    console.log('');
    console.log('4. 🌐 Access your app:');
    console.log('   http://localhost:5000   # Main application');
    console.log('   http://localhost:5001   # Log server health');
  }

  private showExamples(): void {
    console.log('\n📖 Common Usage Examples');
    console.log('─'.repeat(40));
    console.log('');
    console.log('🔄 Typical Development Workflow:');
    console.log('  bun start:auto          # Start with best available ports');
    console.log('  # Work on your features...');
    console.log('  # Claude can run: bun start:claude (no conflicts!)');
    console.log('');
    console.log('🐛 Debugging Issues:');
    console.log('  bun dev:isolated        # Instructions for separate terminals');
    console.log('  bun dev:app-only        # Run only main app');
    console.log('  bun dev:logs-only       # Run only log server');
    console.log('');
    console.log('🔧 Port Conflicts:');
    console.log('  bun ports:check         # See what\'s using ports');
    console.log('  bun start:claude        # Switch to Claude range');
    console.log('  bun start:auto          # Let system choose');
    console.log('');
    console.log('⚠️  Troubleshooting:');
    console.log('  bun ports:check:user    # Check user ports only');
    console.log('  bun ports:check:claude  # Check Claude ports only');
  }

  public run(filter?: string): void {
    const args = process.argv.slice(2);
    
    // Handle specific help requests
    if (args.includes('--ports') || args.includes('-p')) {
      this.showPortRanges();
      return;
    }
    
    if (args.includes('--quick') || args.includes('-q')) {
      this.showQuickStart();
      return;
    }
    
    if (args.includes('--examples') || args.includes('-e')) {
      this.showExamples();
      return;
    }

    // Show header
    console.log('\n🎯 AI Starter Template - Development Commands');
    console.log('═'.repeat(50));
    
    // Show commands by category
    const categories = ['startup', 'development', 'ports', 'convex', 'build', 'testing'] as const;
    
    categories.forEach(category => {
      const categoryCommands = commands.filter(cmd => cmd.category === category);
      if (categoryCommands.length > 0) {
        this.showCategory(category, categoryCommands);
      }
    });

    // Show port ranges
    this.showPortRanges();
    
    // Show footer
    console.log('\n💡 Pro Tips:');
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