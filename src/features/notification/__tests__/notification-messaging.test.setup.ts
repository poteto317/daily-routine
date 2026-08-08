// jsdomテスト環境にはMessageChannelがグローバル定義されていないため、
// port1↔port2間で同期的にメッセージを受け渡す最小限のモックで補う
// （node:worker_threadsのMessageChannelはjestプロセスをハングさせるため使用しない）
class FakeMessagePort {
  onmessage: ((event: { data: unknown }) => void) | null = null;
  other: FakeMessagePort | null = null;

  postMessage(data: unknown): void {
    this.other?.onmessage?.({ data });
  }
}

class FakeMessageChannel {
  port1 = new FakeMessagePort();
  port2 = new FakeMessagePort();

  constructor() {
    this.port1.other = this.port2;
    this.port2.other = this.port1;
  }
}

const originalMessageChannel = global.MessageChannel;

global.MessageChannel =
  FakeMessageChannel as unknown as typeof globalThis.MessageChannel;

afterAll(() => {
  global.MessageChannel = originalMessageChannel;
});

export const setServiceWorker = (value: unknown) => {
  Object.defineProperty(global.navigator, "serviceWorker", {
    value,
    writable: true,
  });
};

export const originalServiceWorker = global.navigator.serviceWorker;
