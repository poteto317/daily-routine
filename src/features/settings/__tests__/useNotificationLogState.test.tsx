import { act, renderHook } from "@testing-library/react";
import { createNotificationLogStateResult } from "../state/notificationLogStateResult";

import { useNotificationLogState } from "../state/useNotificationLogState";

jest.mock("../state/notificationLogStateResult", () => ({
  createNotificationLogStateResult: jest.fn(),
}));

describe("useNotificationLogState", () => {
  const originalServiceWorker = navigator.serviceWorker;

  const setServiceWorker = (serviceWorker: unknown) => {
    Reflect.set(navigator, "serviceWorker", serviceWorker);
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    jest
      .spyOn(Date.prototype, "toLocaleTimeString")
      .mockReturnValue("10:00:00");
    (createNotificationLogStateResult as jest.Mock).mockImplementation(
      (args) => args,
    );
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
    setServiceWorker(originalServiceWorker);
  });

  it("service worker log を収集して clear できる", () => {
    let messageListener:
      | ((event: { data?: { type?: string; message?: string } }) => void)
      | undefined;

    setServiceWorker({
      addEventListener: (_type: string, listener: typeof messageListener) => {
        messageListener = listener;
      },
    });

    const { result } = renderHook(() => useNotificationLogState());

    expect(createNotificationLogStateResult).toHaveBeenCalledWith({
      swLogs: [],
      startLogCapture: expect.any(Function),
      clearLogs: expect.any(Function),
    });

    act(() => {
      result.current.startLogCapture();
    });

    act(() => {
      messageListener?.({ data: { type: "SW_LOG", message: "hello" } });
    });

    expect(result.current.swLogs).toEqual(["10:00:00: hello"]);
    expect(createNotificationLogStateResult).toHaveBeenLastCalledWith({
      swLogs: ["10:00:00: hello"],
      startLogCapture: expect.any(Function),
      clearLogs: expect.any(Function),
    });

    act(() => {
      result.current.clearLogs();
    });

    expect(result.current.swLogs).toEqual([]);
    expect(createNotificationLogStateResult).toHaveBeenLastCalledWith({
      swLogs: [],
      startLogCapture: expect.any(Function),
      clearLogs: expect.any(Function),
    });
  });

  it("window が使えない環境でも startLogCapture で落ちない", () => {
    const { result } = renderHook(() => useNotificationLogState());

    expect(() => {
      result.current.startLogCapture();
    }).not.toThrow();
  });
});
