import "@testing-library/jest-dom";

// Response のグローバル定義（Firebase Auth用）
if (typeof Response === "undefined") {
  global.Response = class Response {
    body: ReadableStream | null = null;
    bodyUsed = false;
    headers = new Headers();
    ok = true;
    redirected = false;
    status = 200;
    statusText = "OK";
    type: ResponseType = "basic";
    url = "";

    constructor(body?: BodyInit | null, init?: ResponseInit) {
      if (init) {
        this.status = init.status || 200;
        this.statusText = init.statusText || "OK";
        this.ok = this.status >= 200 && this.status < 300;
        this.headers = new Headers(init.headers);
      }
    }

    clone(): Response {
      return this;
    }
    arrayBuffer(): Promise<ArrayBuffer> {
      return Promise.resolve(new ArrayBuffer(0));
    }
    blob(): Promise<Blob> {
      return Promise.resolve(new Blob());
    }
    formData(): Promise<FormData> {
      return Promise.resolve(new FormData());
    }
    json(): Promise<unknown> {
      return Promise.resolve({});
    }
    text(): Promise<string> {
      return Promise.resolve("");
    }
  } as unknown as typeof Response;
}

// Headers のグローバル定義
if (typeof Headers === "undefined") {
  global.Headers = class Headers {
    private headers: Record<string, string> = {};
    append(name: string, value: string): void {
      this.headers[name.toLowerCase()] = value;
    }
    delete(name: string): void {
      delete this.headers[name.toLowerCase()];
    }
    get(name: string): string | null {
      return this.headers[name.toLowerCase()] || null;
    }
    has(name: string): boolean {
      return name.toLowerCase() in this.headers;
    }
    set(name: string, value: string): void {
      this.headers[name.toLowerCase()] = value;
    }
    forEach(callback: (value: string, key: string) => void): void {
      Object.entries(this.headers).forEach(([key, value]) =>
        callback(value, key),
      );
    }
  } as unknown as typeof Headers;
}

// fetch のグローバルモック
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    status: 200,
    json: () => Promise.resolve({}),
    text: () => Promise.resolve(""),
    headers: new Headers(),
  } as Response),
);

// LocalStorage のモック
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  length: 0,
  key: jest.fn(),
};
global.localStorage = localStorageMock as Storage;

// SessionStorage のモック
const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  length: 0,
  key: jest.fn(),
};
global.sessionStorage = sessionStorageMock as Storage;

// Notification API のモック
global.Notification = {
  permission: "default" as NotificationPermission,
  requestPermission: jest.fn(() =>
    Promise.resolve("granted" as NotificationPermission),
  ),
} as unknown as typeof Notification;

// Service Worker のモック
Object.defineProperty(global.navigator, "serviceWorker", {
  value: {
    register: jest.fn(() =>
      Promise.resolve({
        active: {},
        installing: null,
        waiting: null,
      }),
    ),
    ready: Promise.resolve({
      active: {},
      pushManager: {
        subscribe: jest.fn(),
      },
    }),
  },
  writable: true,
});

// matchMedia のモック（ダークモード対応）
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});
