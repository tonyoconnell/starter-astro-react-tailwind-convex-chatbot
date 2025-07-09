# Local Observability Server

A development-only Bun server that captures and displays log messages from the frontend application.

## Features

- **Real-time log forwarding**: Captures console messages from the frontend and displays them on the server
- **Batch processing**: Groups multiple log messages for efficient network usage
- **Health monitoring**: Provides server status and statistics
- **CORS support**: Configured for local development with multiple origins
- **File logging**: Optional persistent logging to file
- **Error handling**: Graceful handling of network failures and malformed requests

## Quick Start

1. **Start the server**:
   ```bash
   bun run log-server:dev
   ```

2. **Start the main application** (in another terminal):
   ```bash
   bun dev
   ```

3. **Or start both together**:
   ```bash
   bun run dev:with-logs
   ```

4. **Check server health**:
   ```bash
   curl http://localhost:3002/health
   ```

## Configuration

Environment variables can be set in `.env` file or passed directly:

```bash
# Server port (default: 3001, but we recommend 3002)
LOG_SERVER_PORT=3002

# Enable file logging (default: false)
ENABLE_FILE_LOGGING=true

# Log file path (default: local-server/logs.txt)
LOG_FILE=local-server/logs.txt

# CORS origins (comma-separated)
CORS_ORIGINS=http://localhost:4321,http://localhost:3000

# Maximum log message size (default: 1000)
MAX_LOG_SIZE=1000
```

## API Endpoints

### Health Check
```bash
GET /health
```
Returns server status, uptime, and statistics.

### Log Forwarding
```bash
POST /log
```
Accepts single log messages or batches of log messages.

**Single message format:**
```json
{
  "level": "info",
  "message": "User logged in",
  "timestamp": "2025-07-09T10:00:00.000Z",
  "source": "auth.ts:42",
  "url": "http://localhost:4321/dashboard"
}
```

**Batch format:**
```json
{
  "messages": [
    {
      "level": "log",
      "message": "Component mounted",
      "timestamp": "2025-07-09T10:00:00.000Z"
    },
    {
      "level": "error",
      "message": "API call failed",
      "timestamp": "2025-07-09T10:00:01.000Z"
    }
  ],
  "batchId": "batch_1234567890_abc",
  "timestamp": "2025-07-09T10:00:01.000Z"
}
```

## Frontend Integration

The log forwarder is automatically initialized in development mode through the main layout. You can also access it programmatically:

```typescript
import { logForwarder, useLogForwarder } from '@starter/lib';

// Get current stats
const stats = logForwarder.getStats();

// Update configuration
logForwarder.updateConfig({
  enabled: true,
  batchSize: 5
});

// Use in React components
function MyComponent() {
  const { stats, isEnabled } = useLogForwarder();
  
  return (
    <div>
      Log forwarding: {isEnabled ? 'Active' : 'Inactive'}
    </div>
  );
}
```

## Development Controls

- **Keyboard shortcut**: Press `Ctrl+Shift+L` to toggle the debug panel
- **Status indicator**: Green dot in bottom-right corner when active
- **Debug panel**: Shows real-time stats and configuration

## Scripts

Available commands from the root directory:

```bash
# Start log server only
bun run log-server

# Start log server in watch mode
bun run log-server:dev

# Start main app + log server together
bun run dev:with-logs

# Start main app only
bun dev
```

## Troubleshooting

### Port Conflicts
If port 3001 is in use, set a different port:
```bash
LOG_SERVER_PORT=3002 bun run log-server:dev
```

### Frontend Not Connecting
1. Check that CORS origins match your frontend URL
2. Verify the frontend is configured with the correct server URL
3. Ensure both servers are running

### Missing Logs
1. Check browser console for connection errors
2. Verify log forwarder is enabled (look for green status dot)
3. Press `Ctrl+Shift+L` to see debug panel

### Performance Impact
The log forwarder is designed to have minimal performance impact:
- Batching reduces network requests
- Asynchronous sending doesn't block UI
- Graceful fallback when server unavailable
- Disabled by default in production

## Architecture

The observability pipeline consists of:

1. **Frontend Log Interceptor** (`packages/lib/src/utils/log-forwarder.ts`)
   - Intercepts console methods
   - Batches and throttles log messages
   - Handles network failures gracefully

2. **React Component** (`apps/web/src/components/LogForwarder.tsx`)
   - Provides UI controls and status display
   - Initializes log forwarder in development
   - Shows debug information and stats

3. **Local Server** (`local-server/server.ts`)
   - Receives and validates log messages
   - Displays formatted logs in terminal
   - Provides health check and statistics

This system provides real-time visibility into frontend behavior during development while remaining completely isolated from production builds.