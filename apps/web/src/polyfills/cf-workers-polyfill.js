// Cloudflare Workers MessageChannel polyfill for React 19 SSR
// This must be loaded before any React DOM imports

if (typeof MessageChannel === 'undefined') {
  console.log('[CF-Workers-Polyfill] Adding MessageChannel polyfill for React 19 SSR');
  
  class MessagePortPolyfill extends EventTarget {
    constructor() {
      super();
      this.otherPort = null;
      this._onmessage = null;
      this._onmessageerror = null;
    }

    setOtherPort(port) {
      this.otherPort = port;
    }

    postMessage(message, transfer) {
      if (this.otherPort) {
        // Simulate async message passing
        setTimeout(() => {
          const event = new MessageEvent('message', { 
            data: message,
            ports: transfer || []
          });
          this.otherPort.dispatchEvent(event);
          
          // Call onmessage handler if set
          if (this.otherPort._onmessage) {
            this.otherPort._onmessage(event);
          }
        }, 0);
      }
    }

    start() {
      // MessagePort start method - no-op for polyfill
    }

    close() {
      // MessagePort close method
      this.otherPort = null;
    }

    get onmessage() {
      return this._onmessage;
    }

    set onmessage(handler) {
      this._onmessage = handler;
      if (handler) {
        this.addEventListener('message', handler);
      }
    }

    get onmessageerror() {
      return this._onmessageerror;
    }

    set onmessageerror(handler) {
      this._onmessageerror = handler;
      if (handler) {
        this.addEventListener('messageerror', handler);
      }
    }
  }

  class MessageChannelPolyfill {
    constructor() {
      this.port1 = new MessagePortPolyfill();
      this.port2 = new MessagePortPolyfill();
      
      this.port1.setOtherPort(this.port2);
      this.port2.setOtherPort(this.port1);
    }
  }

  // Assign to globalThis to make available in Workers runtime
  globalThis.MessageChannel = MessageChannelPolyfill;
  globalThis.MessagePort = MessagePortPolyfill;
  
  console.log('[CF-Workers-Polyfill] MessageChannel polyfill installed successfully');
}