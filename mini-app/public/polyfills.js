// Browser polyfills for TON libraries
// This file is loaded as a plain JS file before React hydrates

// Import buffer from CDN (jsdelivr serves npm packages)
import { Buffer } from 'https://esm.sh/buffer@6.0.3';

// Make Buffer available globally
window.Buffer = Buffer;
globalThis.Buffer = Buffer;

// Add other Node.js globals
window.global = window;
window.process = { env: {}, browser: true };
globalThis.process = { env: {}, browser: true };

console.log('[Polyfills] Buffer and globals loaded successfully');

