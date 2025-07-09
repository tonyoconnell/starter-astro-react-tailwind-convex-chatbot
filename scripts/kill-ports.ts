#!/usr/bin/env bun

/**
 * Port killer for development server ports
 * Uses central port registry for dynamic configuration
 */

import { PortRegistryUtils } from './port-registry';

interface PortProcess {
  port: number;
  pid: string;
  processName: string;
  canKill: boolean;
  reason: string;
}

type PortRange = 'user' | 'claude' | 'all';

class PortKiller {
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
    'rollup',
    'parcel',
    'esbuild',
    'turbo',
    'next',
    'nuxt',
    'react-scripts',
    'vue-cli-service',
    'ng',
    'grunt',
    'gulp',
    'nodemon',
    'pm2',
    'forever',
    'concurrently'
  ];

  // Processes that should not be killed automatically
  private readonly unsafeToKill = [
    'kernel',
    'launchd',
    'systemd',
    'init',
    'kthreadd',
    'ksoftirqd',
    'migration',
    'rcu_',
    'watchdog',
    'sshd',
    'networkd',
    'systemd-',
    'dbus',
    'avahi',
    'cups',
    'bluetooth',
    'networkmanager',
    'wpa_supplicant',
    'dhcpcd',
    'ntpd',
    'chronyd',
    'rsyslog',
    'cron',
    'atd',
    'gdm',
    'lightdm',
    'xorg',
    'wayland',
    'pulseaudio',
    'pipewire',
    'alsa',
    'udev',
    'polkit',
    'accountsservice',
    'udisks',
    'colord',
    'rtkit',
    'controlcenter',
    'control center',
    'finder',
    'dock',
    'windowserver',
    'loginwindow'
  ];

  private range: PortRange;

  constructor(range: PortRange = 'all') {
    this.range = range;
  }

  private get ports(): number[] {
    switch (this.range) {
      case 'user':
        return PortRegistryUtils.getPortNumbersForRange('user');
      case 'claude':
        return PortRegistryUtils.getPortNumbersForRange('claude');
      case 'all':
      default:
        return [
          ...PortRegistryUtils.getPortNumbersForRange('user'),
          ...PortRegistryUtils.getPortNumbersForRange('claude')
        ];
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

      // Get process name using ps
      const nameProc = Bun.spawn(['ps', '-p', pid, '-o', 'command='], {
        stdout: 'pipe',
        stderr: 'ignore'
      });
      const processCommand = (await new Response(nameProc.stdout).text()).trim();
      const processName = processCommand.split(' ')[0].split('/').pop() || '';

      if (!processName) return null;

      // Determine if safe to kill
      const baseName = processName.toLowerCase();
      
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

  private async killProcess(pid: string): Promise<boolean> {
    try {
      console.log(`🔪 Killing process ${pid}...`);
      
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
      console.log(`❌ Failed to kill process ${pid}: ${error}`);
      return false;
    }
  }

  public async run(): Promise<void> {
    const rangeText = this.range === 'user' ? 'User Development' : 
                     this.range === 'claude' ? 'Claude Testing' : 'All';
    
    console.log(`🔍 Scanning ${rangeText} ports for running processes...\n`);

    // Get all port processes
    const processes = await Promise.all(
      this.ports.map(port => this.getPortProcess(port))
    );

    const runningProcesses = processes.filter(p => p !== null) as PortProcess[];

    if (runningProcesses.length === 0) {
      console.log(`✅ No processes found running on ${rangeText.toLowerCase()} ports.`);
      return;
    }

    // Show found processes
    console.log('📋 Found running processes:');
    runningProcesses.forEach(proc => {
      const rangeInfo = this.range === 'user' 
        ? PortRegistryUtils.getRange('user')
        : this.range === 'claude' 
        ? PortRegistryUtils.getRange('claude')
        : proc.port >= 5160 
        ? PortRegistryUtils.getRange('claude') 
        : PortRegistryUtils.getRange('user');
      
      const emoji = rangeInfo.emoji;
      const statusIcon = proc.canKill ? '✅' : '🔴';
      console.log(`  ${statusIcon} ${emoji} Port ${proc.port}: ${proc.processName} (${proc.pid}) - ${proc.reason}`);
    });

    // Separate safe and unsafe processes
    const safeProcesses = runningProcesses.filter(p => p.canKill);
    const unsafeProcesses = runningProcesses.filter(p => !p.canKill);

    if (safeProcesses.length === 0) {
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

    // Kill safe processes
    console.log(`\n🔪 Killing ${safeProcesses.length} safe development process${safeProcesses.length > 1 ? 'es' : ''}...`);
    
    const killResults = await Promise.all(
      safeProcesses.map(proc => this.killProcess(proc.pid))
    );

    const successCount = killResults.filter(r => r).length;
    const failCount = killResults.filter(r => !r).length;

    console.log(`\n📊 Results:`);
    console.log(`  ✅ Successfully killed: ${successCount} processes`);
    if (failCount > 0) {
      console.log(`  ❌ Failed to kill: ${failCount} processes`);
    }

    if (unsafeProcesses.length > 0) {
      console.log(`\n⚠️  ${unsafeProcesses.length} unsafe process${unsafeProcesses.length > 1 ? 'es' : ''} left running:`);
      unsafeProcesses.forEach(proc => {
        console.log(`  • Port ${proc.port}: ${proc.processName} (${proc.pid}) - ${proc.reason}`);
      });
      console.log('\n💡 Review these processes manually before killing them.');
    }
  }
}

// Run port killer if this file is executed directly
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
  
  const killer = new PortKiller(range);
  killer.run();
}