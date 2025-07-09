#!/usr/bin/env bun

/**
 * Simple test for the Local Observability Server
 * Run with: bun test.ts
 */

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
}

class TestRunner {
  private results: TestResult[] = [];
  private serverUrl = 'http://localhost:3002';

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async startServer(): Promise<() => void> {
    console.log('🚀 Starting test server...');
    
    // Start server in background
    const proc = Bun.spawn(['bun', 'server.ts'], {
      env: { ...process.env, LOG_SERVER_PORT: '3002' },
      cwd: process.cwd()
    });

    // Wait for server to start
    await this.delay(2000);

    // Return cleanup function
    return () => {
      proc.kill();
    };
  }

  private async testHealthEndpoint(): Promise<TestResult> {
    try {
      const response = await fetch(`${this.serverUrl}/health`);
      
      if (!response.ok) {
        return { name: 'Health Endpoint', passed: false, error: `HTTP ${response.status}` };
      }

      const data = await response.json();
      
      if (data.status !== 'healthy' || typeof data.uptime !== 'number') {
        return { name: 'Health Endpoint', passed: false, error: 'Invalid health response format' };
      }

      return { name: 'Health Endpoint', passed: true };
    } catch (error) {
      return { name: 'Health Endpoint', passed: false, error: String(error) };
    }
  }

  private async testLogEndpoint(): Promise<TestResult> {
    try {
      const logMessage = {
        level: 'info',
        message: 'Test message from automated test',
        timestamp: new Date().toISOString(),
        source: 'test.ts'
      };

      const response = await fetch(`${this.serverUrl}/log`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(logMessage)
      });

      if (!response.ok) {
        return { name: 'Log Endpoint', passed: false, error: `HTTP ${response.status}` };
      }

      const text = await response.text();
      
      if (!text.includes('Log received')) {
        return { name: 'Log Endpoint', passed: false, error: 'Unexpected response text' };
      }

      return { name: 'Log Endpoint', passed: true };
    } catch (error) {
      return { name: 'Log Endpoint', passed: false, error: String(error) };
    }
  }

  private async testBatchLogEndpoint(): Promise<TestResult> {
    try {
      const batch = {
        messages: [
          {
            level: 'log' as const,
            message: 'Batch test message 1',
            timestamp: new Date().toISOString()
          },
          {
            level: 'warn' as const,
            message: 'Batch test message 2',
            timestamp: new Date().toISOString()
          }
        ],
        batchId: `test_batch_${Date.now()}`,
        timestamp: new Date().toISOString()
      };

      const response = await fetch(`${this.serverUrl}/log`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(batch)
      });

      if (!response.ok) {
        return { name: 'Batch Log Endpoint', passed: false, error: `HTTP ${response.status}` };
      }

      const text = await response.text();
      
      if (!text.includes('Batch processed')) {
        return { name: 'Batch Log Endpoint', passed: false, error: 'Unexpected response text' };
      }

      return { name: 'Batch Log Endpoint', passed: true };
    } catch (error) {
      return { name: 'Batch Log Endpoint', passed: false, error: String(error) };
    }
  }

  private async testCorsSupport(): Promise<TestResult> {
    try {
      const response = await fetch(`${this.serverUrl}/health`, {
        method: 'GET',
        headers: { 'Origin': 'http://localhost:4321' }
      });

      if (!response.ok) {
        return { name: 'CORS Support', passed: false, error: `HTTP ${response.status}` };
      }

      const corsHeader = response.headers.get('Access-Control-Allow-Origin');
      
      if (corsHeader !== '*') {
        return { name: 'CORS Support', passed: false, error: 'Missing or incorrect CORS headers' };
      }

      return { name: 'CORS Support', passed: true };
    } catch (error) {
      return { name: 'CORS Support', passed: false, error: String(error) };
    }
  }

  private async testInvalidRequests(): Promise<TestResult> {
    try {
      // Test invalid log message
      const response1 = await fetch(`${this.serverUrl}/log`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invalid: 'data' })
      });

      if (response1.status !== 400) {
        return { name: 'Invalid Request Handling', passed: false, error: 'Should return 400 for invalid data' };
      }

      // Test non-existent endpoint
      const response2 = await fetch(`${this.serverUrl}/nonexistent`);

      if (response2.status !== 404) {
        return { name: 'Invalid Request Handling', passed: false, error: 'Should return 404 for non-existent endpoints' };
      }

      return { name: 'Invalid Request Handling', passed: true };
    } catch (error) {
      return { name: 'Invalid Request Handling', passed: false, error: String(error) };
    }
  }

  public async runAllTests(): Promise<void> {
    console.log('🧪 Starting Local Observability Server Tests\n');

    let cleanup: (() => void) | null = null;

    try {
      // Start server
      cleanup = await this.startServer();

      // Run tests
      console.log('📋 Running tests...\n');

      this.results.push(await this.testHealthEndpoint());
      this.results.push(await this.testLogEndpoint());
      this.results.push(await this.testBatchLogEndpoint());
      this.results.push(await this.testCorsSupport());
      this.results.push(await this.testInvalidRequests());

      // Report results
      console.log('📊 Test Results:');
      console.log('================\n');

      const passed = this.results.filter(r => r.passed).length;
      const total = this.results.length;

      this.results.forEach(result => {
        const status = result.passed ? '✅' : '❌';
        const error = result.error ? ` (${result.error})` : '';
        console.log(`${status} ${result.name}${error}`);
      });

      console.log(`\n📈 Summary: ${passed}/${total} tests passed`);

      if (passed === total) {
        console.log('🎉 All tests passed! Local Observability Server is working correctly.');
        process.exit(0);
      } else {
        console.log('❌ Some tests failed. Please check the errors above.');
        process.exit(1);
      }

    } catch (error) {
      console.error('💥 Test runner error:', error);
      process.exit(1);
    } finally {
      // Cleanup
      if (cleanup) {
        console.log('\n🧹 Cleaning up...');
        cleanup();
        await this.delay(1000);
      }
    }
  }
}

// Run tests if this file is executed directly
if (import.meta.main) {
  const runner = new TestRunner();
  runner.runAllTests();
}