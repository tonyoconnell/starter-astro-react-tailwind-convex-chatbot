#!/usr/bin/env bun

/**
 * Intelligent port selection and startup script
 * Automatically detects available port ranges and starts services
 */

interface PortStatus {
  port: number;
  available: boolean;
  processInfo?: string;
}

class AutoStarter {
  private async checkPort(port: number): Promise<PortStatus> {
    try {
      const server = Bun.serve({
        port,
        fetch: () => new Response('test'),
      });
      
      server.stop();
      return { port, available: true };
    } catch (error: any) {
      if (error.code === 'EADDRINUSE') {
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
            return { port, available: false, processInfo: `${processName} (${pid})` };
          }
        } catch {
          // lsof failed, but we know port is in use
        }
        return { port, available: false, processInfo: 'Unknown process' };
      }
      return { port, available: true };
    }
  }

  private async checkPortRange(astroPort: number, logPort: number): Promise<{
    range: 'user' | 'claude';
    astroStatus: PortStatus;
    logStatus: PortStatus;
    available: boolean;
  }> {
    const [astroStatus, logStatus] = await Promise.all([
      this.checkPort(astroPort),
      this.checkPort(logPort)
    ]);

    return {
      range: astroPort === 5000 ? 'user' : 'claude',
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
      this.checkPortRange(5000, 5001), // User range
      this.checkPortRange(5100, 5101)  // Claude range
    ]);

    console.log('👤 User range (5000-5001):');
    console.log(`  • Astro: ${userRange.astroStatus.available ? '✅ Available' : `❌ In use (${userRange.astroStatus.processInfo})`}`);
    console.log(`  • Logs:  ${userRange.logStatus.available ? '✅ Available' : `❌ In use (${userRange.logStatus.processInfo})`}`);

    console.log('\n🤖 Claude range (5100-5101):');
    console.log(`  • Astro: ${claudeRange.astroStatus.available ? '✅ Available' : `❌ In use (${claudeRange.astroStatus.processInfo})`}`);
    console.log(`  • Logs:  ${claudeRange.logStatus.available ? '✅ Available' : `❌ In use (${claudeRange.logStatus.processInfo})`}`);

    // Decision logic
    if (userRange.available && claudeRange.available) {
      // Both available - prefer user range (default)
      return {
        selectedRange: 'user',
        astroPort: 5000,
        logPort: 5001,
        reason: 'Both ranges available, using user range (default)'
      };
    } else if (userRange.available) {
      // Only user range available
      return {
        selectedRange: 'user',
        astroPort: 5000,
        logPort: 5001,
        reason: 'User range available, Claude range occupied'
      };
    } else if (claudeRange.available) {
      // Only Claude range available
      return {
        selectedRange: 'claude',
        astroPort: 5100,
        logPort: 5101,
        reason: 'Claude range available, user range occupied'
      };
    } else {
      // Neither range available
      throw new Error('Both port ranges are occupied! Please free up ports or use specific port overrides.');
    }
  }

  private async startServices(astroPort: number, logPort: number, range: 'user' | 'claude'): Promise<void> {
    const rangeName = range === 'user' ? 'User' : 'Claude';
    const rangeEmoji = range === 'user' ? '👤' : '🤖';
    
    console.log(`\n🚀 Starting ${rangeName} services on ports ${astroPort}/${logPort}...\n`);

    // Use concurrently to start both services
    const { spawn } = Bun;
    
    const proc = spawn([
      'bunx', 'concurrently',
      '--names', `${rangeEmoji}APP,${rangeEmoji}LOGS`,
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
      console.log('  • bun dev:isolated    (separate terminals)');
      process.exit(1);
    }
  }
}

// Run auto-starter if this file is executed directly
if (import.meta.main) {
  const autoStarter = new AutoStarter();
  autoStarter.run();
}