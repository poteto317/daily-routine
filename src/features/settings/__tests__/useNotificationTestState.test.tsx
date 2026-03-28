import { renderHook } from "@testing-library/react";

jest.mock("../state/useNotificationLogState", () => ({
  useNotificationLogState: jest.fn(),
}));

jest.mock("../state/useNotificationTestAction", () => ({
  useNotificationTestAction: jest.fn(),
}));

jest.mock("../state/notificationTestStateResult", () => ({
  createNotificationTestStateResult: jest.fn(),
}));

import { useNotificationLogState } from "../state/useNotificationLogState";
import { createNotificationTestStateResult } from "../state/notificationTestStateResult";
import { useNotificationTestAction } from "../state/useNotificationTestAction";
import { useNotificationTestState } from "../state/useNotificationTestState";

describe("useNotificationTestState", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (createNotificationTestStateResult as jest.Mock).mockImplementation(
      (args) => ({
        notificationStatus: args.notificationStatus,
        debugMessage: args.debugMessage,
        swLogs: args.swLogs,
        clearLogs: args.clearLogs,
        handleTestNotification: args.handleTestNotification,
      }),
    );
  });

  it("log state と action hook を compose し result builder へ委譲する", () => {
    const clearLogs = jest.fn();
    const handleTestNotification = jest.fn();
    const startLogCapture = jest.fn();

    (useNotificationLogState as jest.Mock).mockReturnValue({
      swLogs: ["10:00:00: hello"],
      startLogCapture,
      clearLogs,
    });
    (useNotificationTestAction as jest.Mock).mockReturnValue({
      notificationStatus: "success",
      debugMessage: "done",
      handleTestNotification,
    });

    const { result } = renderHook(() => useNotificationTestState());

    expect(useNotificationTestAction).toHaveBeenCalledWith({
      startLogCapture,
    });
    expect(createNotificationTestStateResult).toHaveBeenCalledWith({
      notificationStatus: "success",
      debugMessage: "done",
      swLogs: ["10:00:00: hello"],
      clearLogs,
      handleTestNotification,
    });
    expect(result.current).toEqual({
      notificationStatus: "success",
      debugMessage: "done",
      swLogs: ["10:00:00: hello"],
      clearLogs,
      handleTestNotification,
    });
  });
});
