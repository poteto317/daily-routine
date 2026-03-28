import { renderHook } from "@testing-library/react";

jest.mock("../state/notificationTestActionResult", () => ({
  createNotificationTestActionResult: jest.fn(),
}));

import { createNotificationTestActionResult } from "../state/notificationTestActionResult";
import { useNotificationTestAction } from "../state/useNotificationTestAction";

describe("useNotificationTestAction composition", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("公開 action shape を result builder に委譲する", () => {
    const resultShape = {
      notificationStatus: "idle",
      debugMessage: "",
      handleTestNotification: jest.fn(),
      composed: true,
    };
    (createNotificationTestActionResult as jest.Mock).mockReturnValue(
      resultShape,
    );

    const { result } = renderHook(() =>
      useNotificationTestAction({ startLogCapture: jest.fn() }),
    );

    expect(createNotificationTestActionResult).toHaveBeenCalledWith({
      notificationStatus: "idle",
      debugMessage: "",
      handleTestNotification: expect.any(Function),
    });
    expect(result.current).toBe(resultShape);
  });
});
