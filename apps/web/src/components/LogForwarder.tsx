import { useEffect, useState } from 'react';
import { logForwarder, getLogConfig, shouldEnableLogForwarding, getLogServerUrl } from '@starter/lib';

interface LogForwarderProps {
  enabled?: boolean;
  serverUrl?: string;
  environment?: string;
}

interface LogForwarderStats {
  enabled: boolean;
  installed: boolean;
  pendingLogs: number;
  sessionId: string;
}

export function LogForwarder({ 
  enabled, 
  serverUrl, 
  environment 
}: LogForwarderProps) {
  const [stats, setStats] = useState<LogForwarderStats | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Determine if log forwarding should be enabled
    const shouldEnable = enabled ?? shouldEnableLogForwarding();
    
    if (!shouldEnable) {
      console.info('LogForwarder: Disabled for this environment');
      return;
    }

    // Configure log forwarder
    const config = getLogConfig(environment);
    if (serverUrl) {
      config.serverUrl = serverUrl;
    } else {
      config.serverUrl = getLogServerUrl();
    }
    
    config.enabled = shouldEnable;

    // Update configuration and install
    logForwarder.updateConfig(config);
    logForwarder.install();

    // Update stats
    const updateStats = () => {
      const currentStats = logForwarder.getStats();
      setStats({
        enabled: currentStats.enabled,
        installed: currentStats.installed,
        pendingLogs: currentStats.pendingLogs,
        sessionId: currentStats.sessionId
      });
    };

    updateStats();

    // Update stats periodically
    const interval = setInterval(updateStats, 5000);

    // Test the log forwarding with a welcome message
    console.log('🚀 LogForwarder initialized successfully');
    console.info('Session ID:', logForwarder.getStats().sessionId);

    // Cleanup on unmount
    return () => {
      clearInterval(interval);
      // Note: We don't uninstall here to avoid disrupting logs
      // LogForwarder will be uninstalled when the page unloads
    };
  }, [enabled, serverUrl, environment]);

  // Add keyboard shortcut to toggle visibility (Ctrl+Shift+L)
  useEffect(() => {
    const handleKeydown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.shiftKey && event.key === 'L') {
        event.preventDefault();
        setIsVisible(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  }, []);

  // Don't render anything if not enabled or no stats
  if (!stats?.enabled) {
    return null;
  }

  return (
    <>
      {/* Debug panel (hidden by default, toggle with Ctrl+Shift+L) */}
      {isVisible && (
        <div 
          className="fixed bottom-4 right-4 bg-black bg-opacity-90 text-green-400 text-xs p-3 rounded-lg border border-green-500 z-50 font-mono"
          style={{ minWidth: '250px' }}
        >
          <div className="flex justify-between items-center mb-2">
            <span className="font-bold text-green-300">📡 Log Forwarder</span>
            <button
              onClick={() => setIsVisible(false)}
              className="text-green-400 hover:text-green-300 text-lg leading-none"
              title="Close (or press Ctrl+Shift+L)"
            >
              ×
            </button>
          </div>
          <div className="space-y-1 text-xs">
            <div>Status: <span className={stats.installed ? 'text-green-400' : 'text-red-400'}>
              {stats.installed ? 'Active' : 'Inactive'}
            </span></div>
            <div>Pending: <span className="text-yellow-400">{stats.pendingLogs}</span></div>
            <div>Session: <span className="text-blue-400">{stats.sessionId.split('_')[2]}</span></div>
            <div className="pt-2 border-t border-green-800">
              <div className="text-green-600">Press Ctrl+Shift+L to toggle</div>
            </div>
          </div>
        </div>
      )}
      
      {/* Invisible status indicator for development */}
      <div 
        className="fixed bottom-2 right-2 w-2 h-2 rounded-full z-40 cursor-pointer"
        style={{ 
          backgroundColor: stats.installed ? '#10b981' : '#ef4444',
          opacity: 0.7 
        }}
        onClick={() => setIsVisible(true)}
        title={`Log Forwarder: ${stats.installed ? 'Active' : 'Inactive'} (Click or Ctrl+Shift+L for details)`}
      />
    </>
  );
}

// Hook for accessing log forwarder in other components
export function useLogForwarder() {
  return {
    stats: logForwarder.getStats(),
    isEnabled: logForwarder.isEnabled(),
    updateConfig: logForwarder.updateConfig.bind(logForwarder),
    install: logForwarder.install.bind(logForwarder),
    uninstall: logForwarder.uninstall.bind(logForwarder)
  };
}