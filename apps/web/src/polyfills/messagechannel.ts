// MessageChannel polyfill for Cloudflare Workers runtime
// This fixes React 19 SSR compatibility issues

if (typeof MessageChannel === 'undefined') {
  class MessagePortPolyfill extends EventTarget {
    private otherPort: MessagePortPolyfill | null = null;
    
    constructor() {
      super();
    }
    
    setOtherPort(port: MessagePortPolyfill) {
      this.otherPort = port;
    }
    
    postMessage(data: any) {
      if (this.otherPort) {
        // Use setTimeout to make it async like real MessageChannel
        setTimeout(() => {
          if (this.otherPort) {
            const event = new MessageEvent('message', { data });
            this.otherPort.dispatchEvent(event);
            // Also trigger onmessage if it exists
            if (typeof (this.otherPort as any).onmessage === 'function') {
              (this.otherPort as any).onmessage(event);
            }
          }
        }, 0);
      }
    }
    
    start() {
      // No-op for compatibility
    }
    
    close() {
      this.otherPort = null;
    }
  }
  
  class MessageChannelPolyfill {
    port1: MessagePortPolyfill;
    port2: MessagePortPolyfill;
    
    constructor() {
      this.port1 = new MessagePortPolyfill();
      this.port2 = new MessagePortPolyfill();
      
      // Set up the connection between ports
      this.port1.setOtherPort(this.port2);
      this.port2.setOtherPort(this.port1);
    }
  }
  
  // Add to global scope
  (globalThis as any).MessageChannel = MessageChannelPolyfill;
  (globalThis as any).MessagePort = MessagePortPolyfill;
}

export {};