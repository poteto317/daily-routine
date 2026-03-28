import { createNotificationTestStateResult } from "../state/notificationTestStateResult";

describe("notificationTestStateResult", () => {
  it("notification test state の公開 shape を組み立てる", () => {
    const clearLogs = jest.fn();
    const handleTestNotification = jest.fn() as unknown as () => Promise<void>;

    expect(
      createNotificationTestStateResult({
        notificationStatus: "success",
        debugMessage: "done",
        swLogs: ["10:00:00: hello"],
        clearLogs,
        handleTestNotification,
      }),
    ).toEqual({
      notificationStatus: "success",
      debugMessage: "done",
      swLogs: ["10:00:00: hello"],
      clearLogs,
      handleTestNotification,
    });
  });
});
