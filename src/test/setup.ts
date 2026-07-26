/**
 * Global test setup for Vitest.
 * Mocks browser APIs that are unavailable in jsdom.
 */

// ---------------------------------------------------------------------------
// SpeechRecognition mock
// ---------------------------------------------------------------------------
class MockSpeechRecognition extends EventTarget {
  continuous = false;
  interimResults = false;
  lang = "";

  start() {}
  stop() {}
  abort() {}
}

Object.defineProperty(window, "SpeechRecognition", {
  writable: true,
  value: MockSpeechRecognition,
});

Object.defineProperty(window, "webkitSpeechRecognition", {
  writable: true,
  value: MockSpeechRecognition,
});

// ---------------------------------------------------------------------------
// SpeechSynthesis mock
// ---------------------------------------------------------------------------
const mockSpeechSynthesis = {
  speaking: false,
  pending: false,
  paused: false,
  speak: () => {},
  cancel: () => {},
  pause: () => {},
  resume: () => {},
  getVoices: () => [],
  addEventListener: () => {},
  removeEventListener: () => {},
  dispatchEvent: () => false,
};

Object.defineProperty(window, "speechSynthesis", {
  writable: true,
  value: mockSpeechSynthesis,
});

// ---------------------------------------------------------------------------
// localStorage mock
// ---------------------------------------------------------------------------
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem(key: string): string | null {
      return Object.prototype.hasOwnProperty.call(store, key)
        ? store[key]
        : null;
    },
    setItem(key: string, value: string): void {
      store[key] = String(value);
    },
    removeItem(key: string): void {
      delete store[key];
    },
    clear(): void {
      store = {};
    },
    get length(): number {
      return Object.keys(store).length;
    },
    key(index: number): string | null {
      return Object.keys(store)[index] ?? null;
    },
  };
})();

Object.defineProperty(window, "localStorage", {
  writable: true,
  value: localStorageMock,
});
