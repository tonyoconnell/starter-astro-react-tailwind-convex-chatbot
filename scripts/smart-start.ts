#!/usr/bin/env bun

/**
 * Smart startup script that handles port conflicts intelligently
 * Provides multiple strategies for robust development server startup
 */

type PortRange = 'user' | 'claude' | 'auto';

interface StartupOptions {
  range: PortRange;
  autoKill: boolean;
  fallback: boolean;
  force: boolean;
}

interface PortStatus {
  port: number;
  available: boolean;
  processInfo?: string;
  canKill?: boolean;
}

class SmartStarter {
  private userPorts = { astro: 5000, logs: 5001 };
  private claudePorts = { astro: 5100, logs: 5101 };

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
        // Port is in use, get process info
        try {
          const pidProc = Bun.spawn(['lsof', '-ti', `:${port}`], { 
            stdout: 'pipe',
            stderr: 'ignore'
          });
          const pidOutput = await new Response(pidProc.stdout).text();
          const pid = pidOutput.trim();
          
          if (pid) {
            const nameProc = Bun.spawn(['ps', '-p', pid, '-o', 'comm='], {
              stdout: 'pipe',
              stderr: 'ignore'
            });
            const processName = (await new Response(nameProc.stdout).text()).trim();
            
            // Determine if we can safely kill this process
            const baseName = processName.split('/').pop()?.toLowerCase() || '';
            const safeToKill = ['bun', 'node', 'astro', 'vite'].some(safe => 
              baseName.includes(safe)
            );
            
            return { 
              port, 
              available: false, 
              processInfo: `${baseName} (${pid})`,
              canKill: safeToKill
            };
          }
        } catch {
          // lsof failed, but we know port is in use
        }
        return { port, available: false, processInfo: 'Unknown process', canKill: false };
      }
      return { port, available: true };
    }
  }

  private async checkPortRange(astroPort: number, logPort: number): Promise<{
    astroStatus: PortStatus;
    logStatus: PortStatus;
    available: boolean;
    canClear: boolean;
  }> {
    const [astroStatus, logStatus] = await Promise.all([
      this.checkPort(astroPort),
      this.checkPort(logPort)
    ]);

    return {
      astroStatus,
      logStatus,
      available: astroStatus.available && logStatus.available,
      canClear: (!astroStatus.available ? astroStatus.canKill || false : true) && 
                (!logStatus.available ? logStatus.canKill || false : true)
    };
  }

  private async killPortProcess(port: number): Promise<boolean> {
    try {
      const pidProc = Bun.spawn(['lsof', '-ti', `:${port}`], { 
        stdout: 'pipe',
        stderr: 'ignore'
      });
      const pidOutput = await new Response(pidProc.stdout).text();
      const pid = pidOutput.trim();
      
      if (!pid) return false;

      console.log(`🔪 Killing process ${pid} on port ${port}...`);
      
      // Try graceful kill first
      const killProc = Bun.spawn(['kill', pid], { stderr: 'ignore' });
      await killProc.exited;
      
      // Wait for process to exit
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check if still running
      const checkProc = Bun.spawn(['ps', '-p', pid], {
        stdout: 'ignore',
        stderr: 'ignore'
      });
      await checkProc.exited;
      
      if (checkProc.exitCode === 0) {
        // Force kill if still running
        console.log(`💀 Force killing process ${pid}...`);
        const forceKillProc = Bun.spawn(['kill', '-9', pid], { stderr: 'ignore' });
        await forceKillProc.exited;
      }
      
      return true;
    } catch (error) {
      console.log(`❌ Failed to kill process on port ${port}: ${error}`);
      return false;
    }
  }

  private async clearPorts(astroPort: number, logPort: number): Promise<boolean> {
    console.log(`🧹 Clearing ports ${astroPort} and ${logPort}...`);
    
    const [astroKilled, logKilled] = await Promise.all([
      this.killPortProcess(astroPort),
      this.killPortProcess(logPort)
    ]);
    
    // Wait a moment for ports to be freed
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return astroKilled && logKilled;
  }

  private async startServices(astroPort: number, logPort: number, range: string): Promise<void> {
    const rangeName = range === 'user' ? 'User' : range === 'claude' ? 'Claude' : 'Auto-selected';
    const rangeEmoji = range === 'user' ? '👤' : range === 'claude' ? '🤖' : '🔄';
    
    console.log(`\n🚀 Starting ${rangeName} services...`);
    console.log(`🌐 Main app: http://localhost:${astroPort}`);
    console.log(`📡 Log server: http://localhost:${logPort}/health\n`);

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

    // Handle graceful shutdown
    const cleanup = () => {
      console.log('\n\n🛑 Shutting down services...');
      proc.kill();
      process.exit(0);
    };

    process.on('SIGINT', cleanup);
    process.on('SIGTERM', cleanup);

    await proc.exited;
  }

  private async getAvailableRange(options: StartupOptions): Promise<{
    astroPort: number;
    logPort: number;
    range: string;
    strategy: string;
  }> {
    console.log('🔍 Analyzing port availability...\n');

    const [userRange, claudeRange] = await Promise.all([
      this.checkPortRange(this.userPorts.astro, this.userPorts.logs),
      this.checkPortRange(this.claudePorts.astro, this.claudePorts.logs)
    ]);

    console.log('👤 User range (5000-5001):');
    console.log(`  • Astro: ${userRange.astroStatus.available ? '✅ Available' : `❌ ${userRange.astroStatus.processInfo}`}`);
    console.log(`  • Logs:  ${userRange.logStatus.available ? '✅ Available' : `❌ ${userRange.logStatus.processInfo}`}`);

    console.log('\n🤖 Claude range (5100-5101):');
    console.log(`  • Astro: ${claudeRange.astroStatus.available ? '✅ Available' : `❌ ${claudeRange.astroStatus.processInfo}`}`);
    console.log(`  • Logs:  ${claudeRange.logStatus.available ? '✅ Available' : `❌ ${claudeRange.logStatus.processInfo}`}`);

    // Strategy selection based on options and availability
    if (options.range === 'user') {
      if (userRange.available) {
        return {
          astroPort: this.userPorts.astro,
          logPort: this.userPorts.logs,
          range: 'user',
          strategy: 'Requested user range available'
        };
      } else if (options.autoKill && userRange.canClear) {
        console.log('\n🧹 Auto-clearing user ports...');
        const cleared = await this.clearPorts(this.userPorts.astro, this.userPorts.logs);
        if (cleared) {
          return {
            astroPort: this.userPorts.astro,
            logPort: this.userPorts.logs,
            range: 'user',
            strategy: 'User range cleared and available'
          };
        }
      }
      
      if (options.fallback && claudeRange.available) {
        console.log('\n🔄 Falling back to Claude range...');
        return {
          astroPort: this.claudePorts.astro,
          logPort: this.claudePorts.logs,
          range: 'claude',
          strategy: 'Fallback to Claude range'
        };
      }

      throw new Error('User range not available and fallback options exhausted');
    }

    if (options.range === 'claude') {
      if (claudeRange.available) {
        return {
          astroPort: this.claudePorts.astro,
          logPort: this.claudePorts.logs,
          range: 'claude',
          strategy: 'Requested Claude range available'
        };
      } else if (options.autoKill && claudeRange.canClear) {
        console.log('\n🧹 Auto-clearing Claude ports...');
        const cleared = await this.clearPorts(this.claudePorts.astro, this.claudePorts.logs);
        if (cleared) {
          return {
            astroPort: this.claudePorts.astro,
            logPort: this.claudePorts.logs,
            range: 'claude',
            strategy: 'Claude range cleared and available'
          };
        }
      }

      if (options.fallback && userRange.available) {
        console.log('\n🔄 Falling back to user range...');
        return {
          astroPort: this.userPorts.astro,
          logPort: this.userPorts.logs,
          range: 'user',
          strategy: 'Fallback to user range'
        };
      }

      throw new Error('Claude range not available and fallback options exhausted');
    }

    // Auto mode - intelligent selection
    if (userRange.available && claudeRange.available) {
      return {
        astroPort: this.userPorts.astro,
        logPort: this.userPorts.logs,
        range: 'user',
        strategy: 'Both ranges available, using user (default)'
      };
    } else if (userRange.available) {
      return {
        astroPort: this.userPorts.astro,
        logPort: this.userPorts.logs,
        range: 'user',
        strategy: 'User range available'
      };
    } else if (claudeRange.available) {
      return {
        astroPort: this.claudePorts.astro,
        logPort: this.claudePorts.logs,
        range: 'claude',
        strategy: 'Claude range available'
      };
    } else if (options.autoKill) {
      // Try clearing the most promising range
      if (userRange.canClear) {
        console.log('\n🧹 Auto-clearing user ports...');
        const cleared = await this.clearPorts(this.userPorts.astro, this.userPorts.logs);
        if (cleared) {
          return {
            astroPort: this.userPorts.astro,
            logPort: this.userPorts.logs,
            range: 'user',
            strategy: 'User range cleared and available'
          };
        }
      }
      
      if (claudeRange.canClear) {
        console.log('\n🧹 Auto-clearing Claude ports...');
        const cleared = await this.clearPorts(this.claudePorts.astro, this.claudePorts.logs);
        if (cleared) {
          return {
            astroPort: this.claudePorts.astro,
            logPort: this.claudePorts.logs,
            range: 'claude',
            strategy: 'Claude range cleared and available'
          };
        }
      }
    }

    throw new Error('No available port ranges found');
  }

  public async run(options: StartupOptions): Promise<void> {
    try {
      console.log('🎯 Smart Startup initiated...\n');

      const { astroPort, logPort, range, strategy } = await this.getAvailableRange(options);
      
      console.log(`\n✅ Selected strategy: ${strategy}`);
      console.log(`🎯 Using ${range} range: ${astroPort}/${logPort}`);

      await this.startServices(astroPort, logPort, range);
      
    } catch (error) {
      console.error('\n❌ Smart startup failed:', error);
      console.log('\n🔧 Manual alternatives:');
      console.log('  • bun ports:kill:user    (kill user range processes)');
      console.log('  • bun ports:kill:claude  (kill Claude range processes)');
      console.log('  • bun start:force        (force start user range)');
      console.log('  • bun start:claude:force (force start Claude range)');
      console.log('  • bun dev:isolated       (separate terminals)');
      console.log('  • bun ports:check        (check port status)');
      process.exit(1);
    }
  }
}

// Run smart starter if this file is executed directly
if (import.meta.main) {
  const args = process.argv.slice(2);
  let range: PortRange = 'auto';
  
  for (const arg of args) {
    if (arg.startsWith('--range=')) {
      const rangeValue = arg.split('=')[1] as PortRange;
      if (['user', 'claude', 'auto'].includes(rangeValue)) {
        range = rangeValue;
      }
    }
  }
  
  const options: StartupOptions = {
    range,
    autoKill: true,    // Automatically kill safe development processes
    fallback: true,    // Fall back to alternative range if needed
    force: false       // Don't force kill unsafe processes
  };
  
  const starter = new SmartStarter();
  starter.run(options);
}