import { createNotificationTestActionResult } from "../state/notificationTestActionResult";

describe("notificationTestActionResult", () => {
  it("notification test action の公開 shape を組み立てる", () => {
    const handleTestNotification = jest.fn() as unknown as () => Promise<void>;

    expect(
      createNotificationTestActionResult({
        notificationStatus: "success",
        debugMessage: "done",
        handleTestNotification,
      }),
    ).toEqual({
      notificationStatus: "success",
      debugMessage: "done",
      handleTestNotification,
    });
  });
});
