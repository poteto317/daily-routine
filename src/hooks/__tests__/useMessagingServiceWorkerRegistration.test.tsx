import { act, renderHook } from "@testing-library/react";

jest.mock("../serviceWorkerRegistration", () => ({
  registerAppServiceWorkers: jest.fn(),
  isServiceWorkerSupported: jest.fn(() => true),
}));

import {
  isServiceWorkerSupported,
  registerAppServiceWorkers,
} from "../serviceWorkerRegistration";
import { useMessagingServiceWorkerRegistration } from "../useMessagingServiceWorkerRegistration";

describe("useMessagingServiceWorkerRegistration", () => {
  const originalReadyState = document.readyState;

  beforeEach(() => {
    jest.clearAllMocks();
    (isServiceWorkerSupported as jest.Mock).mockReturnValue(true);
    if ("serviceWorker" in navigator && navigator.serviceWorker) {
      (
        navigator.serviceWorker as unknown as { ready?: Promise<unknown> }
      ).ready = Promise.resolve();
    }
  });

  afterEach(() => {
    Object.defineProperty(document, "readyState", {
      configurable: true,
      value: originalReadyState,
    });
  });

  it("document complete なら即時に登録して callback を実行する", async () => {
    const onRegistered = jest.fn().mockResolvedValue(undefined);
    Object.defineProperty(document, "readyState", {
      configurable: true,
      value: "complete",
    });

    renderHook(() => useMessagingServiceWorkerRegistration(onRegistered));

    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(registerAppServiceWorkers).toHaveBeenCalled();
    expect(onRegistered).toHaveBeenCalled();
  });

  it("document loading 中は load event 後に登録する", async () => {
    const onRegistered = jest.fn().mockResolvedValue(undefined);
    Object.defineProperty(document, "readyState", {
      configurable: true,
      value: "loading",
    });

    renderHook(() => useMessagingServiceWorkerRegistration(onRegistered));

    await act(async () => {
      window.dispatchEvent(new Event("load"));
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(registerAppServiceWorkers).toHaveBeenCalled();
    expect(onRegistered).toHaveBeenCalled();
  });

  it("Service Worker を使えない環境では ready を待たずに何もしない", () => {
    // 使えるかどうかの判定は登録側と同じものを使う。別々に判定していると、
    // 片方が「使えない」と見なした後に、もう片方が navigator.serviceWorker へ
    // 触れて TypeError になる
    (isServiceWorkerSupported as jest.Mock).mockReturnValue(false);
    Object.defineProperty(document, "readyState", {
      configurable: true,
      value: "complete",
    });
    const onRegistered = jest.fn().mockResolvedValue(undefined);

    renderHook(() => useMessagingServiceWorkerRegistration(onRegistered));

    expect(registerAppServiceWorkers).not.toHaveBeenCalled();
    expect(onRegistered).not.toHaveBeenCalled();
  });
});
