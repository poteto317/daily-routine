jest.mock("workbox-expiration", () => ({
  ExpirationPlugin: jest.fn(),
}));
jest.mock("workbox-precaching", () => ({
  precacheAndRoute: jest.fn(),
}));
jest.mock("workbox-routing", () => ({
  registerRoute: jest.fn(),
}));
jest.mock("workbox-strategies", () => ({
  NetworkFirst: jest.fn(),
  StaleWhileRevalidate: jest.fn(),
}));
jest.mock("../custom-sw/logToClient", () => ({
  logToClient: jest.fn(),
}));
jest.mock("../custom-sw/schedulerControl", () => ({
  handleSchedulerMessage: jest.fn(),
}));
jest.mock("../custom-sw/notificationClickHandler", () => ({
  handleNotificationClick: jest.fn(),
}));
jest.mock("../custom-sw/warmDocumentCache", () => ({
  DOCUMENT_CACHE_NAME: "test-cache",
  warmDocumentCache: jest.fn().mockResolvedValue(undefined),
}));

import { precacheAndRoute } from "workbox-precaching";
import { registerRoute } from "workbox-routing";
import { handleSchedulerMessage } from "../custom-sw/schedulerControl";
import { handleNotificationClick } from "../custom-sw/notificationClickHandler";
import { warmDocumentCache } from "../custom-sw/warmDocumentCache";

describe("custom-sw", () => {
  let listeners = {};

  beforeEach(() => {
    listeners = {};
    global.self.addEventListener = jest.fn((event, handler) => {
      listeners[event] = handler;
    });
    global.self.skipWaiting = jest.fn();
    global.self.clients = {
      claim: jest.fn().mockResolvedValue(undefined),
    };
  });

  it("ルートの事前キャッシュとルーティングを設定し各イベントリスナーを登録する", async () => {
    // custom-sw.js を読み込む
    await import("../custom-sw.js");

    expect(precacheAndRoute).toHaveBeenCalled();
    expect(registerRoute).toHaveBeenCalled();
    expect(listeners.install).toBeDefined();
    expect(listeners.activate).toBeDefined();
    expect(listeners.message).toBeDefined();
    expect(listeners.notificationclick).toBe(handleNotificationClick);

    // install イベントをトリガー
    listeners.install();
    expect(global.self.skipWaiting).toHaveBeenCalled();

    // activate イベントをトリガー
    const mockWaitUntil = jest.fn();
    await listeners.activate({ waitUntil: mockWaitUntil });
    expect(mockWaitUntil).toHaveBeenCalled();
    await mockWaitUntil.mock.calls[0][0];
    expect(global.self.clients.claim).toHaveBeenCalled();
    expect(warmDocumentCache).toHaveBeenCalled();

    // message イベントをトリガー
    listeners.message({ data: { type: "TEST_MSG" } });
    expect(handleSchedulerMessage).toHaveBeenCalled();
  });
});
