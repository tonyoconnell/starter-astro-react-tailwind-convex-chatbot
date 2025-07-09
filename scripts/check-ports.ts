#!/usr/bin/env bun

/**
 * Port validation utility for development environment
 * Checks if required ports are available before starting services
 */

interface PortConfig {
  port: number;
  name: string;
  required: boolean;
  range: 'user' | 'claude';
}

type PortRange = 'user' | 'claude' | 'all';

class PortChecker {
  private readonly userPorts: PortConfig[] = [
    { port: 5000, name: 'Astro Main App (User)', required: true, range: 'user' },
    { port: 5001, name: 'Log Server (User)', required: true, range: 'user' },
    { port: 5002, name: 'Reserved (User)', required: false, range: 'user' },
    { port: 5003, name: 'Reserved (User)', required: false, range: 'user' },
    { port: 5004, name: 'Reserved (User)', required: false, range: 'user' },
    { port: 5005, name: 'Reserved (User)', required: false, range: 'user' }
  ];

  private readonly claudePorts: PortConfig[] = [
    { port: 5100, name: 'Astro Main App (Claude)', required: true, range: 'claude' },
    { port: 5101, name: 'Log Server (Claude)', required: true, range: 'claude' },
    { port: 5102, name: 'Reserved (Claude)', required: false, range: 'claude' },
    { port: 5103, name: 'Reserved (Claude)', required: false, range: 'claude' },
    { port: 5104, name: 'Reserved (Claude)', required: false, range: 'claude' },
    { port: 5105, name: 'Reserved (Claude)', required: false, range: 'claude' }
  ];

  private range: PortRange;

  constructor(range: PortRange = 'all') {
    this.range = range;
  }

  private get ports(): PortConfig[] {
    switch (this.range) {
      case 'user':
        return this.userPorts;
      case 'claude':
        return this.claudePorts;
      case 'all':
      default:
        return [...this.userPorts, ...this.claudePorts];
    }
  }

  private async isPortInUse(port: number): Promise<{ inUse: boolean; processInfo?: string }> {
    try {
      // Try to create a server on the port
      const server = Bun.serve({
        port,
        fetch: () => new Response('test'),
      });
      
      server.stop();
      return { inUse: false };
    } catch (error: any) {
      if (error.code === 'EADDRINUSE') {
        // Get process info using lsof
        try {
          const proc = Bun.spawn(['lsof', '-i', `:${port}`, '-t'], { 
            stdout: 'pipe',
            stderr: 'ignore'
          });
          const output = await new Response(proc.stdout).text();
          const pid = output.trim();
          
          if (pid) {
            const procInfo = Bun.spawn(['ps', '-p', pid, '-o', 'comm='], {
              stdout: 'pipe',
              stderr: 'ignore'
            });
            const processName = (await new Response(procInfo.stdout).text()).trim();
            return { inUse: true, processInfo: `PID ${pid} (${processName})` };
          }
        } catch {
          // lsof might not be available or might fail
        }
        return { inUse: true, processInfo: 'Unknown process' };
      }
      return { inUse: false };
    }
  }

  private async checkAllPorts(): Promise<{ available: PortConfig[]; inUse: Array<PortConfig & { processInfo: string }> }> {
    const results = await Promise.all(
      this.ports.map(async (portConfig) => {
        const result = await this.isPortInUse(portConfig.port);
        return { ...portConfig, ...result };
      })
    );

    const available = results.filter(r => !r.inUse).map(r => ({ port: r.port, name: r.name, required: r.required }));
    const inUse = results.filter(r => r.inUse).map(r => ({ 
      port: r.port, 
      name: r.name, 
      required: r.required,
      processInfo: r.processInfo || 'Unknown'
    }));

    return { available, inUse };
  }

  private suggestSolutions(conflicts: Array<PortConfig & { processInfo: string }>): void {
    console.log('\n🔧 Solutions:');
    
    conflicts.forEach(conflict => {
      console.log(`\n  Port ${conflict.port} (${conflict.name}):`);
      console.log(`    • Kill process: pkill -f "${conflict.processInfo.split(' ')[0]}" (if safe)`);
      console.log(`    • Find process: lsof -i :${conflict.port}`);
      
      if (conflict.range === 'user') {
        if (conflict.name.includes('Astro')) {
          console.log(`    • Use Claude range: bun start:claude`);
          console.log(`    • Use different port: ASTRO_PORT=5010 bun start`);
        } else if (conflict.name.includes('Log Server')) {
          console.log(`    • Use Claude range: bun start:claude`);
          console.log(`    • Use different port: LOG_SERVER_PORT=5011 bun start`);
        }
      } else if (conflict.range === 'claude') {
        if (conflict.name.includes('Astro')) {
          console.log(`    • Use user range: bun start`);
          console.log(`    • Use different port: ASTRO_PORT=5110 bun start:claude`);
        } else if (conflict.name.includes('Log Server')) {
          console.log(`    • Use user range: bun start`);
          console.log(`    • Use different port: LOG_SERVER_PORT=5111 bun start:claude`);
        }
      }
    });

    const rangeText = this.range === 'user' ? 'User' : 
                     this.range === 'claude' ? 'Claude' : 'All';
    
    console.log('\n  Alternative approaches:');
    if (this.range === 'user' || this.range === 'all') {
      console.log('    • Switch to Claude range: bun start:claude');
      console.log('    • Use isolated terminals: bun dev:isolated');
    }
    if (this.range === 'claude' || this.range === 'all') {
      console.log('    • Switch to User range: bun start');
      console.log('    • Use isolated terminals: bun dev:claude');
    }
    console.log('    • Use auto-detection: bun start:auto');
    console.log(`    • Check all ports: bun ports:check`);
  }

  public async run(): Promise<void> {
    const rangeText = this.range === 'user' ? 'User Development' : 
                     this.range === 'claude' ? 'Claude Testing' : 'All';
    
    console.log(`🔍 Checking ${rangeText} server ports...\n`);

    const { available, inUse } = await this.checkAllPorts();

    // Show available ports
    if (available.length > 0) {
      console.log('✅ Available ports:');
      available.forEach(port => {
        const status = port.required ? '(required)' : '(reserved)';
        const emoji = port.range === 'user' ? '👤' : '🤖';
        console.log(`  ${emoji} ${port.port}: ${port.name} ${status}`);
      });
    }

    // Show conflicts
    if (inUse.length > 0) {
      console.log('\n❌ Ports in use:');
      inUse.forEach(port => {
        const severity = port.required ? '⚠️  CONFLICT' : 'ℹ️  INFO';
        const emoji = port.range === 'user' ? '👤' : '🤖';
        console.log(`  ${emoji} ${port.port}: ${port.name} - ${port.processInfo} ${severity}`);
      });
    }

    // Check if required ports are available
    const requiredConflicts = inUse.filter(p => p.required);
    
    if (requiredConflicts.length === 0) {
      console.log(`\n🎉 All required ${rangeText.toLowerCase()} ports are available!`);
      
      if (this.range === 'user' || this.range === 'all') {
        console.log('\n👤 User commands:');
        console.log('  • bun start          (both services on 5000/5001)');
        console.log('  • bun dev:app-only   (main app only)');
        console.log('  • bun dev:logs-only  (log server only)');
      }
      
      if (this.range === 'claude' || this.range === 'all') {
        console.log('\n🤖 Claude commands:');
        console.log('  • bun start:claude   (both services on 5100/5101)');
        console.log('  • bun dev:claude-app (main app only)');
        console.log('  • bun dev:claude-logs(log server only)');
      }
      
      if (this.range === 'all') {
        console.log('\n🔄 Auto commands:');
        console.log('  • bun start:auto     (intelligent port selection)');
      }
      
      process.exit(0);
    } else {
      console.log(`\n⚠️  ${rangeText} port conflicts detected!`);
      this.suggestSolutions(requiredConflicts);
      process.exit(1);
    }
  }
}

// Run port checker if this file is executed directly
if (import.meta.main) {
  // Parse command line arguments
  const args = process.argv.slice(2);
  let range: PortRange = 'all';
  
  for (const arg of args) {
    if (arg.startsWith('--range=')) {
      const rangeValue = arg.split('=')[1] as PortRange;
      if (['user', 'claude', 'all'].includes(rangeValue)) {
        range = rangeValue;
      }
    }
  }
  
  const checker = new PortChecker(range);
  checker.run().catch(error => {
    console.error('❌ Port checker failed:', error);
    process.exit(1);
  });
}