// Polyfills for browser environment
import { Buffer } from 'buffer';

// Make Buffer available globally for TON libraries
if (typeof window !== 'undefined') {
  window.Buffer = Buffer;
  (window as any).global = window;
}

