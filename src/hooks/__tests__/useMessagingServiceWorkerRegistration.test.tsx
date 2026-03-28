import { act, renderHook } from "@testing-library/react";

jest.mock("../pwaInstallerActions", () => ({
  registerMessagingServiceWorkerOnce: jest.fn(),
}));

import { registerMessagingServiceWorkerOnce } from "../pwaInstallerActions";
import { useMessagingServiceWorkerRegistration } from "../useMessagingServiceWorkerRegistration";

describe("useMessagingServiceWorkerRegistration", () => {
  const originalReadyState = document.readyState;

  beforeEach(() => {
    jest.clearAllMocks();
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

    expect(registerMessagingServiceWorkerOnce).toHaveBeenCalled();
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

    expect(registerMessagingServiceWorkerOnce).toHaveBeenCalled();
    expect(onRegistered).toHaveBeenCalled();
  });
});
