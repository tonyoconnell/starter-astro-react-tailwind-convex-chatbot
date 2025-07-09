#!/usr/bin/env bun

/**
 * Port cleanup utility for development environment
 * Safely kills processes occupying development ports
 */

interface PortProcess {
  port: number;
  pid: string;
  processName: string;
  canKill: boolean;
  reason?: string;
}

type PortRange = 'user' | 'claude' | 'all';

class PortKiller {
  private readonly userPorts = [5000, 5001, 5002, 5003, 5004, 5005];
  private readonly claudePorts = [5100, 5101, 5102, 5103, 5104, 5105];
  
  // Processes that are generally safe to kill for development
  private readonly safeToKill = [
    'bun',
    'node',
    'npm',
    'yarn',
    'pnpm',
    'deno',
    'astro',
    'vite',
    'webpack',
    'next-server',
    'serve',
    'http-server',
    'live-server'
  ];

  // System processes that should NOT be killed
  private readonly unsafeToKill = [
    'launchd',
    'kernel_task',
    'Safari',
    'Chrome',
    'Firefox',
    'ControlCenter',
    'Dock',
    'Finder',
    'WindowServer',
    'loginwindow'
  ];

  private range: PortRange;

  constructor(range: PortRange = 'all') {
    this.range = range;
  }

  private get ports(): number[] {
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

  private async getPortProcess(port: number): Promise<PortProcess | null> {
    try {
      // Get PID using lsof
      const pidProc = Bun.spawn(['lsof', '-ti', `:${port}`], {
        stdout: 'pipe',
        stderr: 'ignore'
      });
      const pidOutput = await new Response(pidProc.stdout).text();
      const pid = pidOutput.trim();

      if (!pid) return null;

      // Get process name
      const nameProc = Bun.spawn(['ps', '-p', pid, '-o', 'comm='], {
        stdout: 'pipe',
        stderr: 'ignore'
      });
      const processName = (await new Response(nameProc.stdout).text()).trim();

      if (!processName) return null;

      // Determine if safe to kill
      const baseName = processName.split('/').pop()?.toLowerCase() || '';
      
      let canKill = false;
      let reason = '';

      if (this.unsafeToKill.some(unsafe => baseName.includes(unsafe.toLowerCase()))) {
        canKill = false;
        reason = 'System process - not safe to kill';
      } else if (this.safeToKill.some(safe => baseName.includes(safe))) {
        canKill = true;
        reason = 'Development process - safe to kill';
      } else {
        canKill = false;
        reason = 'Unknown process - manual review required';
      }

      return {
        port,
        pid,
        processName: baseName,
        canKill,
        reason
      };

    } catch (error) {
      return null;
    }
  }

  private async scanPorts(): Promise<PortProcess[]> {
    const results = await Promise.all(
      this.ports.map(port => this.getPortProcess(port))
    );
    
    return results.filter((result): result is PortProcess => result !== null);
  }

  private async killProcess(process: PortProcess, force: boolean = false): Promise<boolean> {
    if (!process.canKill && !force) {
      console.log(`⚠️  Skipping ${process.processName} (${process.pid}) on port ${process.port}: ${process.reason}`);
      return false;
    }

    try {
      console.log(`🔪 Killing ${process.processName} (${process.pid}) on port ${process.port}...`);
      
      // Try graceful termination first
      const killProc = Bun.spawn(['kill', process.pid], {
        stderr: 'ignore'
      });
      await killProc.exited;

      // Wait a moment for graceful shutdown
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Check if process is still running
      const checkProc = Bun.spawn(['ps', '-p', process.pid], {
        stdout: 'ignore',
        stderr: 'ignore'
      });
      await checkProc.exited;

      if (checkProc.exitCode === 0) {
        // Process still running, force kill
        console.log(`💀 Force killing ${process.processName} (${process.pid})...`);
        const forceKillProc = Bun.spawn(['kill', '-9', process.pid], {
          stderr: 'ignore'
        });
        await forceKillProc.exited;
      }

      console.log(`✅ Successfully killed ${process.processName} on port ${process.port}`);
      return true;

    } catch (error) {
      console.log(`❌ Failed to kill ${process.processName} (${process.pid}): ${error}`);
      return false;
    }
  }

  public async run(options: { force?: boolean; interactive?: boolean } = {}): Promise<void> {
    const { force = false, interactive = true } = options;
    
    const rangeText = this.range === 'user' ? 'User Development' : 
                     this.range === 'claude' ? 'Claude Testing' : 'All';
    
    console.log(`🔍 Scanning ${rangeText} ports for running processes...\n`);

    const processes = await this.scanPorts();

    if (processes.length === 0) {
      console.log('✅ No processes found on development ports!');
      return;
    }

    console.log('📋 Found running processes:');
    processes.forEach(proc => {
      const emoji = proc.canKill ? '🟢' : '🔴';
      const rangeEmoji = this.userPorts.includes(proc.port) ? '👤' : '🤖';
      console.log(`  ${emoji} ${rangeEmoji} Port ${proc.port}: ${proc.processName} (${proc.pid}) - ${proc.reason}`);
    });

    const killableProcesses = processes.filter(p => p.canKill);
    const unsafeProcesses = processes.filter(p => !p.canKill);

    if (killableProcesses.length === 0) {
      console.log('\n⚠️  No safe processes to kill automatically.');
      if (unsafeProcesses.length > 0) {
        console.log('\n🔧 Manual actions required:');
        unsafeProcesses.forEach(proc => {
          console.log(`  • Port ${proc.port}: ${proc.reason}`);
          console.log(`    Command: kill ${proc.pid} (review first!)`);
        });
      }
      return;
    }

    if (interactive && !force) {
      console.log(`\n❓ Kill ${killableProcesses.length} safe development processes? (y/N)`);
      // For non-interactive environments, we'll skip the prompt
      console.log('🤖 Running in non-interactive mode, proceeding with safe kills...');
    }

    console.log('\n🔪 Killing safe development processes...');
    
    let killedCount = 0;
    for (const process of killableProcesses) {
      const success = await this.killProcess(process, force);
      if (success) killedCount++;
    }

    console.log(`\n📊 Summary: ${killedCount}/${killableProcesses.length} processes killed`);
    
    if (unsafeProcesses.length > 0) {
      console.log(`⚠️  ${unsafeProcesses.length} processes require manual review`);
    }

    if (killedCount > 0) {
      console.log('\n✨ Ports should now be available for development!');
      console.log('   Run: bun ports:check to verify');
    }
  }
}

// Run port killer if this file is executed directly
if (import.meta.main) {
  // Parse command line arguments
  const args = process.argv.slice(2);
  let range: PortRange = 'all';
  let force = false;
  
  for (const arg of args) {
    if (arg.startsWith('--range=')) {
      const rangeValue = arg.split('=')[1] as PortRange;
      if (['user', 'claude', 'all'].includes(rangeValue)) {
        range = rangeValue;
      }
    }
    if (arg === '--force') {
      force = true;
    }
  }
  
  const killer = new PortKiller(range);
  killer.run({ force, interactive: false }).catch(error => {
    console.error('❌ Port killer failed:', error);
    process.exit(1);
  });
}