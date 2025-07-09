#!/usr/bin/env bun

/**
 * Intelligent port selection and startup script
 * Uses central port registry for dynamic configuration
 */

import { PortRegistryUtils } from './port-registry';

interface PortStatus {
  port: number;
  available: boolean;
  processInfo?: string;
}

class AutoStarter {
  private async checkPort(port: number): Promise<PortStatus> {
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
          return { port, available: false, processInfo: `${processName} (${pid})` };
        } catch {
          return { port, available: false, processInfo: `PID ${pid} (Unknown)` };
        }
      }
      
      // No process found using lsof, port appears free
      return { port, available: true };
    } catch (error) {
      // If lsof fails, fall back to the bind test
      try {
        const server = Bun.serve({
          port,
          fetch: () => new Response('test'),
        });
        
        server.stop();
        return { port, available: true };
      } catch (bindError: any) {
        if (bindError.code === 'EADDRINUSE') {
          return { port, available: false, processInfo: 'Process detected via bind test' };
        }
        return { port, available: true };
      }
    }
  }

  private async checkPortRange(rangeName: 'user' | 'claude'): Promise<{
    range: 'user' | 'claude';
    astroStatus: PortStatus;
    logStatus: PortStatus;
    available: boolean;
  }> {
    const astroPort = PortRegistryUtils.getAstroPort(rangeName);
    const logPort = PortRegistryUtils.getLogServerPort(rangeName);
    
    const [astroStatus, logStatus] = await Promise.all([
      this.checkPort(astroPort),
      this.checkPort(logPort)
    ]);

    return {
      range: rangeName,
      astroStatus,
      logStatus,
      available: astroStatus.available && logStatus.available
    };
  }

  private async detectBestRange(): Promise<{
    selectedRange: 'user' | 'claude';
    astroPort: number;
    logPort: number;
    reason: string;
  }> {
    console.log('🔍 Auto-detecting best available port range...\n');

    // Check both ranges
    const [userRange, claudeRange] = await Promise.all([
      this.checkPortRange('user'),
      this.checkPortRange('claude')
    ]);

    const userSummary = PortRegistryUtils.getRangeSummary('user');
    const claudeSummary = PortRegistryUtils.getRangeSummary('claude');

    console.log(`👤 User range (${userSummary}):`);
    console.log(`  • Astro: ${userRange.astroStatus.available ? '✅ Available' : `❌ In use (${userRange.astroStatus.processInfo})`}`);
    console.log(`  • Logs:  ${userRange.logStatus.available ? '✅ Available' : `❌ In use (${userRange.logStatus.processInfo})`}`);

    console.log(`\n🤖 Claude range (${claudeSummary}):`);
    console.log(`  • Astro: ${claudeRange.astroStatus.available ? '✅ Available' : `❌ In use (${claudeRange.astroStatus.processInfo})`}`);
    console.log(`  • Logs:  ${claudeRange.logStatus.available ? '✅ Available' : `❌ In use (${claudeRange.logStatus.processInfo})`}`);

    // Decision logic
    if (userRange.available && claudeRange.available) {
      // Both available - prefer user range (default)
      return {
        selectedRange: 'user',
        astroPort: PortRegistryUtils.getAstroPort('user'),
        logPort: PortRegistryUtils.getLogServerPort('user'),
        reason: 'Both ranges available, using user range (default)'
      };
    } else if (userRange.available) {
      // Only user range available
      return {
        selectedRange: 'user',
        astroPort: PortRegistryUtils.getAstroPort('user'),
        logPort: PortRegistryUtils.getLogServerPort('user'),
        reason: 'User range available, Claude range occupied'
      };
    } else if (claudeRange.available) {
      // Only Claude range available
      return {
        selectedRange: 'claude',
        astroPort: PortRegistryUtils.getAstroPort('claude'),
        logPort: PortRegistryUtils.getLogServerPort('claude'),
        reason: 'Claude range available, user range occupied'
      };
    } else {
      // Neither range available
      throw new Error('Both port ranges are occupied! Please free up ports or use specific port overrides.');
    }
  }

  private async startServices(astroPort: number, logPort: number, range: 'user' | 'claude'): Promise<void> {
    const rangeInfo = PortRegistryUtils.getRange(range);
    
    console.log(`\n🚀 Starting ${rangeInfo.name} services on ports ${astroPort}/${logPort}...\n`);

    // Use concurrently to start both services
    const { spawn } = Bun;
    
    const proc = spawn([
      'bunx', 'concurrently',
      '--names', `${rangeInfo.emoji}APP,${rangeInfo.emoji}LOGS`,
      '--prefix-colors', range === 'user' ? 'blue,green' : 'magenta,cyan',
      `ASTRO_PORT=${astroPort} bun run dev`,
      `cd local-server && LOG_SERVER_PORT=${logPort} bun run dev`
    ], {
      stdio: ['inherit', 'inherit', 'inherit'],
      env: { 
        ...process.env,
        ASTRO_PORT: astroPort.toString(),
        LOG_SERVER_PORT: logPort.toString()
      }
    });

    // Handle process exit
    process.on('SIGINT', () => {
      console.log('\n\n🛑 Shutting down services...');
      proc.kill();
      process.exit(0);
    });

    process.on('SIGTERM', () => {
      console.log('\n\n🛑 Shutting down services...');
      proc.kill();
      process.exit(0);
    });

    await proc.exited;
  }

  public async run(): Promise<void> {
    try {
      const { selectedRange, astroPort, logPort, reason } = await this.detectBestRange();
      
      console.log(`\n✅ Selected: ${selectedRange === 'user' ? '👤 User' : '🤖 Claude'} range`);
      console.log(`📍 Reason: ${reason}`);
      console.log(`🌐 URLs: http://localhost:${astroPort} | http://localhost:${logPort}/health`);

      await this.startServices(astroPort, logPort, selectedRange);
      
    } catch (error) {
      console.error('\n❌ Auto-start failed:', error);
      console.log('\n🔧 Manual alternatives:');
      console.log('  • bun start           (force user range)');
      console.log('  • bun start:claude    (force Claude range)');
      console.log('  • bun ports:check     (check all ports)');
      console.log('  • bun dev:instruct    (separate terminals)');
      process.exit(1);
    }
  }
}

// Run auto-starter if this file is executed directly
if (import.meta.main) {
  const autoStarter = new AutoStarter();
  autoStarter.run();
}