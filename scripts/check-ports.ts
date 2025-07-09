#!/usr/bin/env bun

/**
 * Port availability checker for development server ports
 * Uses central port registry for dynamic configuration
 */

import { PortRegistryUtils } from './port-registry';

interface PortConfig {
  port: number;
  name: string;
  required: boolean;
  range: 'user' | 'claude';
}

type PortRange = 'user' | 'claude' | 'all';

class PortChecker {
  private range: PortRange;

  constructor(range: PortRange = 'all') {
    this.range = range;
  }

  private get ports(): PortConfig[] {
    switch (this.range) {
      case 'user':
        return PortRegistryUtils.getPortsForRange('user').map(p => ({
          port: p.port,
          name: `${p.name} (User)`,
          required: p.required,
          range: 'user' as const
        }));
      case 'claude':
        return PortRegistryUtils.getPortsForRange('claude').map(p => ({
          port: p.port,
          name: `${p.name} (Claude)`,
          required: p.required,
          range: 'claude' as const
        }));
      case 'all':
      default:
        return PortRegistryUtils.getAllPorts().map(p => ({
          port: p.port,
          name: `${p.name} (${p.range === 'user' ? 'User' : 'Claude'})`,
          required: p.required,
          range: p.range
        }));
    }
  }

  private async isPortInUse(port: number): Promise<{ inUse: boolean; processInfo?: string }> {
    try {
      // Use lsof directly to check for any process using the port (IPv4 or IPv6)
      const proc = Bun.spawn(['lsof', '-i', `:${port}`, '-t'], { 
        stdout: 'pipe',
        stderr: 'ignore'
      });
      const output = await new Response(proc.stdout).text();
      const pid = output.trim();
      
      if (pid) {
        // Port is in use, get process info
        try {
          const procInfo = Bun.spawn(['ps', '-p', pid, '-o', 'comm='], {
            stdout: 'pipe',
            stderr: 'ignore'
          });
          const processName = (await new Response(procInfo.stdout).text()).trim();
          return { inUse: true, processInfo: `PID ${pid} (${processName})` };
        } catch {
          return { inUse: true, processInfo: `PID ${pid} (Unknown)` };
        }
      }
      
      // No process found using lsof, port appears free
      return { inUse: false };
    } catch (error) {
      // If lsof fails, fall back to the bind test
      try {
        const server = Bun.serve({
          port,
          fetch: () => new Response('test'),
        });
        
        server.stop();
        return { inUse: false };
      } catch (bindError: any) {
        if (bindError.code === 'EADDRINUSE') {
          return { inUse: true, processInfo: 'Process detected via bind test' };
        }
        return { inUse: false };
      }
    }
  }

  private async checkAllPorts(): Promise<{ available: PortConfig[]; inUse: Array<PortConfig & { processInfo: string }> }> {
    const results = await Promise.all(
      this.ports.map(async (portConfig) => {
        const result = await this.isPortInUse(portConfig.port);
        return { ...portConfig, ...result };
      })
    );

    const available = results.filter(r => !r.inUse).map(r => ({ port: r.port, name: r.name, required: r.required, range: r.range }));
    const inUse = results.filter(r => r.inUse).map(r => ({ 
      port: r.port, 
      name: r.name, 
      required: r.required,
      range: r.range,
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
          console.log(`    • Use different port: ASTRO_PORT=${PortRegistryUtils.getAstroPort('claude')} bun start`);
        } else if (conflict.name.includes('Log Server')) {
          console.log(`    • Use Claude range: bun start:claude`);
          console.log(`    • Use different port: LOG_SERVER_PORT=${PortRegistryUtils.getLogServerPort('claude')} bun start`);
        }
      } else if (conflict.range === 'claude') {
        if (conflict.name.includes('Astro')) {
          console.log(`    • Use user range: bun start`);
          console.log(`    • Use different port: ASTRO_PORT=${PortRegistryUtils.getAstroPort('user')} bun start:claude`);
        } else if (conflict.name.includes('Log Server')) {
          console.log(`    • Use user range: bun start`);
          console.log(`    • Use different port: LOG_SERVER_PORT=${PortRegistryUtils.getLogServerPort('user')} bun start:claude`);
        }
      }
    });

    const rangeText = this.range === 'user' ? 'User' : 
                     this.range === 'claude' ? 'Claude' : 'All';
    
    console.log('\n  Alternative approaches:');
    if (this.range === 'user' || this.range === 'all') {
      console.log('    • Switch to Claude range: bun start:claude');
      console.log('    • Use isolated terminals: bun dev:instruct');
    }
    if (this.range === 'claude' || this.range === 'all') {
      console.log('    • Switch to User range: bun start');
      console.log('    • Use isolated terminals: bun dev:instruct');
    }
    console.log('    • Use auto-detection: bun start:auto');
    console.log(`    • Check all ports: bun ports:check`);
  }

  public async run(): Promise<void> {
    const rangeText = this.range === 'user' ? 'User Development' : 
                     this.range === 'claude' ? 'Claude Testing' : 'All';
    
    console.log(`🔍 Checking ${rangeText} server ports...\n`);

    const { available, inUse } = await this.checkAllPorts();

    // Combine all ports and sort by port number
    const allPorts = [
      ...available.map(p => ({ ...p, status: 'available', processInfo: p.required ? '(required)' : '(reserved)' })),
      ...inUse.map(p => ({ ...p, status: 'in-use' }))
    ].sort((a, b) => a.port - b.port);

    // Show all ports in unified layout
    console.log('📋 All ports:');
    allPorts.forEach(port => {
      const rangeInfo = PortRegistryUtils.getRange(port.range);
      const emoji = rangeInfo.emoji;
      const statusIcon = port.status === 'available' ? '✅' : '🔴';
      const name = port.name.padEnd(25); // Pad to 25 characters for alignment
      
      console.log(`  ${statusIcon} ${emoji} ${port.port}: ${name} ${port.status === 'available' ? port.processInfo : '- ' + port.processInfo}`);
    });

    // Check if required ports are available
    const requiredConflicts = inUse.filter(p => p.required);
    
    // Summary
    console.log(`\n📊 Port Status Summary:`);
    console.log(`  • Available: ${available.length} ports`);
    console.log(`  • In Use: ${inUse.length} ports`);
    
    if (requiredConflicts.length === 0) {
      console.log(`  • Status: ✅ Ready to start ${rangeText.toLowerCase()} services`);
    } else {
      console.log(`  • Status: ⚠️  ${requiredConflicts.length} required port${requiredConflicts.length > 1 ? 's' : ''} occupied`);
    }
    
    // Optional: Show suggested commands only if user wants solutions
    if (requiredConflicts.length > 0) {
      console.log(`\n💡 Run 'bun ports:kill${this.range === 'user' ? ':user' : this.range === 'claude' ? ':claude' : ''}' to free up ports`);
    }
  }
}

// Run port checker if this file is executed directly
if (import.meta.main) {
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
  checker.run();
}