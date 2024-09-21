if (typeof window !== 'undefined') {
    window.global = window;
    window.process = {
      env: { DEBUG: undefined },
      version: '',
      nextTick: require('next/dist/compiled/process/browser').nextTick,
    };
    window.Buffer = require('buffer').Buffer;
  }