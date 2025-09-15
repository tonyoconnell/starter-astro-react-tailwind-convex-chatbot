// Polyfills for Cloudflare Workers runtime
// Must be imported before React DOM to prevent MessageChannel errors

if (typeof MessageChannel === 'undefined') {
  class MessagePortPolyfill extends EventTarget {
    private otherPort: MessagePortPolyfill | null = null;
    
    constructor() {
      super();
    }

    public setOtherPort(port: MessagePortPolyfill) {
      this.otherPort = port;
    }

    public postMessage(message: any, transfer?: Transferable[]): void {
      if (this.otherPort) {
        const event = new MessageEvent('message', { data: message });
        this.otherPort.dispatchEvent(event);
      }
    }

    public start(): void {
      // Implementation for compatibility
    }

    public close(): void {
      // Implementation for compatibility  
    }
  }

  class MessageChannelPolyfill {
    public port1: MessagePortPolyfill;
    public port2: MessagePortPolyfill;

    constructor() {
      this.port1 = new MessagePortPolyfill();
      this.port2 = new MessagePortPolyfill();
      
      this.port1.setOtherPort(this.port2);
      this.port2.setOtherPort(this.port1);
    }
  }

  (globalThis as any).MessageChannel = MessageChannelPolyfill;
  (globalThis as any).MessagePort = MessagePortPolyfill;
}

export {};