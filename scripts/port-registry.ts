/**
 * Central Port Registry
 * Single source of truth for all port configurations across the application
 */

export interface PortDefinition {
  port: number;
  name: string;
  description: string;
  required: boolean;
  service: string; // 'astro' | 'logs' | 'reserved'
}

export interface PortRange {
  name: string;
  emoji: string;
  description: string;
  basePort: number;
  ports: PortDefinition[];
}

export interface PortRegistry {
  user: PortRange;
  claude: PortRange;
}

/**
 * Central port registry - modify this to change all port configurations
 */
export const PORT_REGISTRY: PortRegistry = {
  user: {
    name: 'User Development',
    emoji: '👤',
    description: 'User development range for manual development',
    basePort: 5100,
    ports: [
      {
        port: 5100,
        name: 'Astro Main App',
        description: 'Main Astro application server',
        required: true,
        service: 'astro'
      },
      {
        port: 5101,
        name: 'Log Server',
        description: 'Local observability log server',
        required: true,
        service: 'logs'
      }
    ]
  },
  claude: {
    name: 'Claude Testing',
    emoji: '🤖',
    description: 'Claude testing range for automated testing',
    basePort: 5150,
    ports: [
      {
        port: 5150,
        name: 'Astro Main App',
        description: 'Main Astro application server',
        required: true,
        service: 'astro'
      },
      {
        port: 5151,
        name: 'Log Server',
        description: 'Local observability log server',
        required: true,
        service: 'logs'
      }
    ]
  }
};

/**
 * Utility functions for working with the port registry
 */
export class PortRegistryUtils {
  /**
   * Get all port ranges
   */
  static getAllRanges(): PortRange[] {
    return Object.values(PORT_REGISTRY);
  }

  /**
   * Get a specific port range
   */
  static getRange(rangeName: 'user' | 'claude'): PortRange {
    return PORT_REGISTRY[rangeName];
  }

  /**
   * Get all ports for a specific range
   */
  static getPortsForRange(rangeName: 'user' | 'claude'): PortDefinition[] {
    return PORT_REGISTRY[rangeName].ports;
  }

  /**
   * Get all ports across all ranges
   */
  static getAllPorts(): Array<PortDefinition & { range: 'user' | 'claude'; rangeName: string; emoji: string }> {
    return Object.entries(PORT_REGISTRY).flatMap(([rangeName, range]) =>
      range.ports.map(port => ({
        ...port,
        range: rangeName as 'user' | 'claude',
        rangeName: range.name,
        emoji: range.emoji
      }))
    );
  }

  /**
   * Get port numbers only for a specific range
   */
  static getPortNumbersForRange(rangeName: 'user' | 'claude'): number[] {
    return PORT_REGISTRY[rangeName].ports.map(p => p.port);
  }

  /**
   * Get required ports for a specific range
   */
  static getRequiredPorts(rangeName: 'user' | 'claude'): PortDefinition[] {
    return PORT_REGISTRY[rangeName].ports.filter(p => p.required);
  }

  /**
   * Get ports by service type
   */
  static getPortsByService(service: string, rangeName?: 'user' | 'claude'): PortDefinition[] {
    if (rangeName) {
      return PORT_REGISTRY[rangeName].ports.filter(p => p.service === service);
    }
    return this.getAllPorts().filter(p => p.service === service);
  }

  /**
   * Get Astro port for a specific range
   */
  static getAstroPort(rangeName: 'user' | 'claude'): number {
    const astroPort = PORT_REGISTRY[rangeName].ports.find(p => p.service === 'astro');
    if (!astroPort) throw new Error(`No Astro port found for ${rangeName} range`);
    return astroPort.port;
  }

  /**
   * Get log server port for a specific range
   */
  static getLogServerPort(rangeName: 'user' | 'claude'): number {
    const logPort = PORT_REGISTRY[rangeName].ports.find(p => p.service === 'logs');
    if (!logPort) throw new Error(`No log server port found for ${rangeName} range`);
    return logPort.port;
  }

  /**
   * Get port range summary
   */
  static getRangeSummary(rangeName: 'user' | 'claude'): string {
    const range = PORT_REGISTRY[rangeName];
    const ports = range.ports.map(p => p.port);
    const minPort = Math.min(...ports);
    const maxPort = Math.max(...ports);
    return `${minPort}-${maxPort}`;
  }

  /**
   * Add a new port to a range (for future extensibility)
   */
  static addPortToRange(rangeName: 'user' | 'claude', portDef: PortDefinition): void {
    PORT_REGISTRY[rangeName].ports.push(portDef);
  }

  /**
   * Get environment variable mapping
   */
  static getEnvVars(): Record<string, string> {
    return {
      USER_ASTRO_PORT: this.getAstroPort('user').toString(),
      USER_LOG_SERVER_PORT: this.getLogServerPort('user').toString(),
      CLAUDE_ASTRO_PORT: this.getAstroPort('claude').toString(),
      CLAUDE_LOG_SERVER_PORT: this.getLogServerPort('claude').toString(),
      ASTRO_PORT: this.getAstroPort('user').toString(), // Default to user
      LOG_SERVER_PORT: this.getLogServerPort('user').toString() // Default to user
    };
  }

  /**
   * Get package.json script commands
   */
  static getPackageScripts(): Record<string, string> {
    const userAstro = this.getAstroPort('user');
    const userLogs = this.getLogServerPort('user');
    const claudeAstro = this.getAstroPort('claude');
    const claudeLogs = this.getLogServerPort('claude');

    return {
      'start:force': `concurrently --names "APP,LOGS" --prefix-colors "blue,green" "ASTRO_PORT=${userAstro} bun run dev" "LOG_SERVER_PORT=${userLogs} bun run log-server:dev"`,
      'start:claude:force': `concurrently --names "CLAUDE-APP,CLAUDE-LOGS" --prefix-colors "magenta,cyan" "ASTRO_PORT=${claudeAstro} bun run dev" "LOG_SERVER_PORT=${claudeLogs} bun run log-server:dev"`,
      'dev:app-only': `ASTRO_PORT=${userAstro} bun run dev`,
      'dev:logs-only': `LOG_SERVER_PORT=${userLogs} bun run log-server:dev`,
      'dev:claude-app': `ASTRO_PORT=${claudeAstro} bun run dev`,
      'dev:claude-logs': `LOG_SERVER_PORT=${claudeLogs} bun run log-server:dev`
    };
  }

  /**
   * Generate dev instructions
   */
  static getDevInstructions(): string {
    const userRange = this.getRange('user');
    const claudeRange = this.getRange('claude');
    const userAstro = this.getAstroPort('user');
    const userLogs = this.getLogServerPort('user');
    const claudeAstro = this.getAstroPort('claude');
    const claudeLogs = this.getLogServerPort('claude');

    return [
      `🚀 USER RANGE (${this.getRangeSummary('user')}):`,
      `  Terminal 1: bun dev:app-only    # Main app: http://localhost:${userAstro}`,
      `  Terminal 2: bun dev:logs-only   # Log server: http://localhost:${userLogs}`,
      ``,
      `🤖 CLAUDE RANGE (${this.getRangeSummary('claude')}):`,
      `  Terminal 1: bun dev:claude-app  # Claude app: http://localhost:${claudeAstro}`,
      `  Terminal 2: bun dev:claude-logs # Claude logs: http://localhost:${claudeLogs}`,
      ``,
      `💡 TIP: Use 'bun start' or 'bun start:claude' for single-command startup`
    ].join('\n');
  }
}

export default PORT_REGISTRY;

// CLI interface for running port registry utilities
if (import.meta.main) {
  const args = process.argv.slice(2);
  
  if (args.includes('--dev-instructions')) {
    console.log(PortRegistryUtils.getDevInstructions());
  } else if (args.includes('--env-vars')) {
    const envVars = PortRegistryUtils.getEnvVars();
    Object.entries(envVars).forEach(([key, value]) => {
      console.log(`${key}=${value}`);
    });
  } else if (args.includes('--package-scripts')) {
    const scripts = PortRegistryUtils.getPackageScripts();
    Object.entries(scripts).forEach(([key, value]) => {
      console.log(`"${key}": "${value}"`);
    });
  } else {
    console.log('Port Registry CLI');
    console.log('Available commands:');
    console.log('  --dev-instructions   Show development instructions');
    console.log('  --env-vars          Show environment variables');
    console.log('  --package-scripts   Show package.json scripts');
  }
}