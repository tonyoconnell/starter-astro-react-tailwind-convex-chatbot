export interface LogMessage {
  level: 'log' | 'info' | 'warn' | 'error' | 'debug';
  message: string;
  timestamp: string;
  source?: string;
  url?: string;
  userAgent?: string;
  sessionId?: string;
  args?: any[];
}

export interface LogBatch {
  messages: LogMessage[];
  batchId: string;
  timestamp: string;
}

export interface ServerConfig {
  port: number;
  enableFileLogging: boolean;
  logFile?: string;
  corsOrigins: string[];
  maxLogSize: number;
}

export interface HealthCheckResponse {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  uptime: number;
  version: string;
  logsReceived: number;
}