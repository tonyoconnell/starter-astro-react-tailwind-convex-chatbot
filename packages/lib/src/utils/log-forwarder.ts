interface LogMessage {
  level: 'log' | 'info' | 'warn' | 'error' | 'debug';
  message: string;
  timestamp: string;
  source?: string;
  url?: string;
  userAgent?: string;
  sessionId?: string;
  args?: any[];
}

interface LogBatch {
  messages: LogMessage[];
  batchId: string;
  timestamp: string;
}

interface LogForwarderConfig {
  serverUrl: string;
  enabled: boolean;
  batchSize: number;
  batchTimeout: number;
  maxRetries: number;
  includeUserAgent: boolean;
  includeUrl: boolean;
  logLevels: ('log' | 'info' | 'warn' | 'error' | 'debug')[];
}

class LogForwarder {
  private config: LogForwarderConfig;
  private pendingLogs: LogMessage[] = [];
  private batchTimer: number | null = null;
  private sessionId: string;
  private originalConsole: {
    log: typeof console.log;
    info: typeof console.info;
    warn: typeof console.warn;
    error: typeof console.error;
    debug: typeof console.debug;
  };
  private isInstalled = false;

  constructor(config: Partial<LogForwarderConfig> = {}) {
    this.config = {
      serverUrl: 'http://localhost:3001/log',
      enabled: true,
      batchSize: 10,
      batchTimeout: 2000,
      maxRetries: 3,
      includeUserAgent: true,
      includeUrl: true,
      logLevels: ['log', 'info', 'warn', 'error', 'debug'],
      ...config
    };

    this.sessionId = this.generateSessionId();
    
    // Store original console methods
    this.originalConsole = {
      log: console.log.bind(console),
      info: console.info.bind(console),
      warn: console.warn.bind(console),
      error: console.error.bind(console),
      debug: console.debug.bind(console)
    };
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private createLogMessage(
    level: LogMessage['level'],
    message: string,
    args?: any[]
  ): LogMessage {
    return {
      level,
      message,
      timestamp: new Date().toISOString(),
      source: this.getSource(),
      url: this.config.includeUrl ? window.location.href : undefined,
      userAgent: this.config.includeUserAgent ? navigator.userAgent : undefined,
      sessionId: this.sessionId,
      args: args && args.length > 0 ? args : undefined
    };
  }

  private getSource(): string {
    try {
      const stack = new Error().stack;
      if (!stack) return 'unknown';
      
      const lines = stack.split('\n');
      // Find the first line that's not from this file or console methods
      for (let i = 3; i < lines.length; i++) {
        const line = lines[i];
        if (line && !line.includes('log-forwarder') && !line.includes('console')) {
          const match = line.match(/at\s+(.+?)\s+\((.+):(\d+):(\d+)\)/);
          if (match) {
            const [, func, file, lineNum] = match;
            const fileName = file.split('/').pop();
            return `${func} (${fileName}:${lineNum})`;
          }
        }
      }
      return 'unknown';
    } catch {
      return 'unknown';
    }
  }

  private async sendBatch(messages: LogMessage[]): Promise<void> {
    if (!this.config.enabled || messages.length === 0) return;

    const batch: LogBatch = {
      messages,
      batchId: `batch_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      timestamp: new Date().toISOString()
    };

    let retries = 0;
    while (retries < this.config.maxRetries) {
      try {
        const response = await fetch(this.config.serverUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(batch)
        });

        if (response.ok) {
          return; // Success
        } else {
          throw new Error(`Server responded with ${response.status}`);
        }
      } catch (error) {
        retries++;
        if (retries >= this.config.maxRetries) {
          // Silently fail on final retry to avoid infinite loops
          this.originalConsole.warn(`Failed to forward logs after ${this.config.maxRetries} retries:`, error);
          return;
        }
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, 1000 * retries));
      }
    }
  }

  private flushBatch(): void {
    if (this.pendingLogs.length === 0) return;

    const logsToSend = [...this.pendingLogs];
    this.pendingLogs = [];
    
    // Send asynchronously without blocking
    this.sendBatch(logsToSend).catch(() => {
      // Silently fail - already handled in sendBatch
    });
  }

  private scheduleBatchFlush(): void {
    if (this.batchTimer) {
      clearTimeout(this.batchTimer);
    }

    this.batchTimer = window.setTimeout(() => {
      this.flushBatch();
      this.batchTimer = null;
    }, this.config.batchTimeout);
  }

  private addLogMessage(level: LogMessage['level'], message: string, args?: any[]): void {
    if (!this.config.enabled || !this.config.logLevels.includes(level)) {
      return;
    }

    const logMessage = this.createLogMessage(level, message, args);
    this.pendingLogs.push(logMessage);

    // Flush immediately if batch is full
    if (this.pendingLogs.length >= this.config.batchSize) {
      this.flushBatch();
    } else {
      this.scheduleBatchFlush();
    }
  }

  private createInterceptor(level: LogMessage['level'], originalMethod: Function) {
    return (...args: any[]) => {
      // Call original console method first
      originalMethod(...args);

      // Convert arguments to string message
      const message = args
        .map(arg => {
          if (typeof arg === 'string') return arg;
          if (arg instanceof Error) return `${arg.name}: ${arg.message}`;
          try {
            return JSON.stringify(arg);
          } catch {
            return String(arg);
          }
        })
        .join(' ');

      // Forward to server
      this.addLogMessage(level, message, args);
    };
  }

  public install(): void {
    if (this.isInstalled) {
      this.originalConsole.warn('LogForwarder is already installed');
      return;
    }

    if (!this.config.enabled) {
      this.originalConsole.info('LogForwarder is disabled');
      return;
    }

    // Check if we're in a browser environment
    if (typeof window === 'undefined' || typeof console === 'undefined') {
      return;
    }

    // Install interceptors
    console.log = this.createInterceptor('log', this.originalConsole.log);
    console.info = this.createInterceptor('info', this.originalConsole.info);
    console.warn = this.createInterceptor('warn', this.originalConsole.warn);
    console.error = this.createInterceptor('error', this.originalConsole.error);
    console.debug = this.createInterceptor('debug', this.originalConsole.debug);

    this.isInstalled = true;
    this.originalConsole.info('🚀 LogForwarder installed successfully');
  }

  public uninstall(): void {
    if (!this.isInstalled) return;

    // Restore original console methods
    console.log = this.originalConsole.log;
    console.info = this.originalConsole.info;
    console.warn = this.originalConsole.warn;
    console.error = this.originalConsole.error;
    console.debug = this.originalConsole.debug;

    // Flush any pending logs
    this.flushBatch();

    // Clear timer
    if (this.batchTimer) {
      clearTimeout(this.batchTimer);
      this.batchTimer = null;
    }

    this.isInstalled = false;
    this.originalConsole.info('📴 LogForwarder uninstalled');
  }

  public updateConfig(newConfig: Partial<LogForwarderConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  public isEnabled(): boolean {
    return this.config.enabled && this.isInstalled;
  }

  public getStats(): {
    enabled: boolean;
    installed: boolean;
    pendingLogs: number;
    sessionId: string;
    config: LogForwarderConfig;
  } {
    return {
      enabled: this.config.enabled,
      installed: this.isInstalled,
      pendingLogs: this.pendingLogs.length,
      sessionId: this.sessionId,
      config: { ...this.config }
    };
  }
}

// Create and export singleton instance
export const logForwarder = new LogForwarder();

// Export class for custom instances
export { LogForwarder };
export type { LogForwarderConfig, LogMessage };