import { createNotificationLogStateResult } from "../state/notificationLogStateResult";

describe("createNotificationLogStateResult", () => {
  it("notification log state の公開 shape を返す", () => {
    const startLogCapture = jest.fn();
    const clearLogs = jest.fn();

    expect(
      createNotificationLogStateResult({
        swLogs: ["10:00:00: hello"],
        startLogCapture,
        clearLogs,
      }),
    ).toEqual({
      swLogs: ["10:00:00: hello"],
      startLogCapture,
      clearLogs,
    });
  });
});
