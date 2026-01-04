// Test environment setup: provide browser-like globals and common stubs
// Set up a simple in-memory localStorage for tests
class LocalStorageMock {
  store: Record<string, string> = {}
  clear() { this.store = {} }
  getItem(key: string) { return Object.prototype.hasOwnProperty.call(this.store, key) ? this.store[key] : null }
  setItem(key: string, value: string) { this.store[key] = String(value) }
  removeItem(key: string) { delete this.store[key] }
}

if (typeof globalThis.localStorage === 'undefined') {
  // @ts-ignore
  globalThis.localStorage = new LocalStorageMock()
}

// Provide minimal geolocation stub
if (typeof globalThis.navigator === 'undefined') {
  // @ts-ignore
  globalThis.navigator = {}
}
if (!globalThis.navigator.geolocation) {
  // @ts-ignore
  globalThis.navigator.geolocation = {
    getCurrentPosition: (cb: (pos: any) => void) => cb({ coords: { latitude: 0, longitude: 0 } }),
  }
}

// Provide a no-op matchMedia for components that use it
if (typeof globalThis.window !== 'undefined' && !globalThis.window.matchMedia) {
  // @ts-ignore
  globalThis.window.matchMedia = (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  })
}

// Provide basic globals if not injected
if (typeof globalThis.document === 'undefined') {
  // jsdom should provide this, but guard just in case
  // @ts-ignore
  const { JSDOM } = require('jsdom')
  // @ts-ignore
  const dom = new JSDOM('<!doctype html><html><body></body></html>')
  // @ts-ignore
  globalThis.window = dom.window
  // @ts-ignore
  globalThis.document = dom.window.document
  // @ts-ignore
  globalThis.navigator = dom.window.navigator
}

// Helpful: clear localStorage before each test
// @ts-ignore
globalThis.beforeEach?.(() => {
  // @ts-ignore
  globalThis.localStorage?.clear?.()
})
