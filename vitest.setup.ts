import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

// jsdom does not implement these browser APIs
Element.prototype.scrollIntoView = vi.fn();
class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}
globalThis.ResizeObserver = ResizeObserverStub as unknown as typeof ResizeObserver;
