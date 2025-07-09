import type { LogMessage, LogBatch, ServerConfig, HealthCheckResponse } from './types';
import { PortRegistryUtils } from '../scripts/port-registry';

class LocalObservabilityServer {
  private config: ServerConfig;
  private startTime: number;
  private logsReceived: number = 0;

  constructor() {
    // Use port registry as fallback defaults
    const defaultLogPort = PortRegistryUtils.getLogServerPort('user');
    const defaultAstroPort = PortRegistryUtils.getAstroPort('user');
    
    this.config = {
      port: parseInt(process.env.LOG_SERVER_PORT || defaultLogPort.toString()),
      enableFileLogging: process.env.ENABLE_FILE_LOGGING === 'true',
      logFile: process.env.LOG_FILE || 'local-server/logs.txt',
      corsOrigins: (process.env.CORS_ORIGINS || `http://localhost:${defaultAstroPort},http://localhost:3000`).split(','),
      maxLogSize: parseInt(process.env.MAX_LOG_SIZE || '1000')
    };
    this.startTime = Date.now();
  }

  private formatLogMessage(log: LogMessage): string {
    // Handle various timestamp formats more robustly
    let timestamp: string;
    try {
      const date = new Date(log.timestamp);
      if (isNaN(date.getTime())) {
        timestamp = new Date().toISOString();
      } else {
        timestamp = date.toISOString();
      }
    } catch (error) {
      timestamp = new Date().toISOString();
    }
    
    const level = log.level.toUpperCase().padEnd(5);
    const source = log.source ? ` [${log.source}]` : '';
    const url = log.url ? ` (${log.url})` : '';
    
    return `${timestamp} ${level}${source}${url} ${log.message}`;
  }

  private async writeToFile(message: string): Promise<void> {
    if (!this.config.enableFileLogging) return;
    
    try {
      const file = Bun.file(this.config.logFile!);
      const existingContent = await file.exists() ? await file.text() : '';
      await Bun.write(this.config.logFile!, existingContent + message + '\n');
    } catch (error) {
      console.error('Failed to write to log file:', error);
    }
  }

  private validateLogMessage(data: any): LogMessage | null {
    if (!data || typeof data !== 'object') return null;
    
    const { level, message, timestamp, source, url, userAgent, sessionId, args } = data;
    
    if (!level || !message || !timestamp) return null;
    if (!['log', 'info', 'warn', 'error', 'debug'].includes(level)) return null;
    if (typeof message !== 'string' || message.length > this.config.maxLogSize) return null;
    
    return {
      level,
      message: message.substring(0, this.config.maxLogSize),
      timestamp,
      source: typeof source === 'string' ? source : undefined,
      url: typeof url === 'string' ? url : undefined,
      userAgent: typeof userAgent === 'string' ? userAgent : undefined,
      sessionId: typeof sessionId === 'string' ? sessionId : undefined,
      args: Array.isArray(args) ? args : undefined
    };
  }

  private async handleLogEndpoint(request: Request): Promise<Response> {
    try {
      const data = await request.json();
      
      // Handle single log message
      if (data.level) {
        const logMessage = this.validateLogMessage(data);
        if (!logMessage) {
          return new Response('Invalid log message format', { status: 400 });
        }
        
        const formatted = this.formatLogMessage(logMessage);
        console.log(`📡 ${formatted}`);
        await this.writeToFile(formatted);
        this.logsReceived++;
        
        return new Response('Log received', { status: 200 });
      }
      
      // Handle batch of log messages
      if (data.messages && Array.isArray(data.messages)) {
        const batch = data as LogBatch;
        let processedCount = 0;
        
        for (const message of batch.messages) {
          const logMessage = this.validateLogMessage(message);
          if (logMessage) {
            const formatted = this.formatLogMessage(logMessage);
            console.log(`📡 [${batch.batchId}] ${formatted}`);
            await this.writeToFile(`[${batch.batchId}] ${formatted}`);
            processedCount++;
          }
        }
        
        this.logsReceived += processedCount;
        return new Response(`Batch processed: ${processedCount}/${batch.messages.length} messages`, { status: 200 });
      }
      
      return new Response('Invalid request format', { status: 400 });
    } catch (error) {
      console.error('Error processing log request:', error);
      return new Response('Internal server error', { status: 500 });
    }
  }

  private handleHealthCheck(): Response {
    const health: HealthCheckResponse = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: Date.now() - this.startTime,
      version: '1.0.0',
      logsReceived: this.logsReceived
    };
    
    return new Response(JSON.stringify(health, null, 2), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  private setCorsHeaders(response: Response): Response {
    const headers = new Headers(response.headers);
    headers.set('Access-Control-Allow-Origin', '*');
    headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers
    });
  }

  private async handleRequest(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const method = request.method;

    // Handle CORS preflight
    if (method === 'OPTIONS') {
      return this.setCorsHeaders(new Response(null, { status: 204 }));
    }

    let response: Response;

    if (url.pathname === '/log' && method === 'POST') {
      response = await this.handleLogEndpoint(request);
    } else if (url.pathname === '/health' && method === 'GET') {
      response = this.handleHealthCheck();
    } else {
      response = new Response('Not found', { status: 404 });
    }

    return this.setCorsHeaders(response);
  }

  public start(): void {
    const server = Bun.serve({
      port: this.config.port,
      fetch: (request) => this.handleRequest(request),
      error: (error) => {
        console.error('Server error:', error);
        return new Response('Internal Server Error', { status: 500 });
      }
    });

    console.log(`🚀 Local Observability Server running on http://localhost:${this.config.port}`);
    console.log(`📁 File logging: ${this.config.enableFileLogging ? 'enabled' : 'disabled'}`);
    console.log(`🌐 CORS origins: ${this.config.corsOrigins.join(', ')}`);
    console.log(`📊 Health check: http://localhost:${this.config.port}/health`);
    console.log(`📡 Log endpoint: http://localhost:${this.config.port}/log`);
    console.log('');
    console.log('Waiting for log messages...');
  }
}

// Start the server
const server = new LocalObservabilityServer();
server.start();