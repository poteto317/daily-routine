import * as notificationModule from "../index";

describe("notification index exports", () => {
  it("messaging and permission functions are exported", () => {
    expect(notificationModule.scheduleNotifications).toBeDefined();
    expect(notificationModule.clearNotificationSchedules).toBeDefined();
    expect(notificationModule.requestNotificationPermission).toBeDefined();
    expect(notificationModule.resolveNotificationPermission).toBeDefined();
    expect(notificationModule.hasNotificationPermission).toBeDefined();
    expect(notificationModule.createNotificationSchedules).toBeDefined();
  });
});
