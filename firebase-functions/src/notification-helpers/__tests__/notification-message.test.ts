import { buildRoutineNotificationMessage } from "../notification-message";
import { NOTIFICATION_TEXTS } from "../notification-texts";
import type { Routine } from "../../types";

describe("buildRoutineNotificationMessage", () => {
  const routine: Routine = {
    id: "routine-1",
    title: "朝の運動",
    startTime: "09:00",
    daysOfWeek: [1, 2, 3, 4, 5],
    isActive: true,
  };

  it("webpush通知のiconとbadgeはNOTIFICATION_TEXTSのPNGパスを使う（SVGはFCM経由でも表示されないため）", () => {
    const message = buildRoutineNotificationMessage("token-abc", routine);

    expect(message.webpush?.notification?.icon).toBe(NOTIFICATION_TEXTS.icon);
    expect(message.webpush?.notification?.badge).toBe(NOTIFICATION_TEXTS.badge);
    expect(message.webpush?.notification?.icon).toMatch(/\.png$/);
    expect(message.webpush?.notification?.badge).toMatch(/\.png$/);
  });

  it("タイトル・本文・宛先トークンが正しく設定される", () => {
    const message = buildRoutineNotificationMessage("token-abc", routine);

    expect(message.token).toBe("token-abc");
    expect(message.notification?.title).toBe(NOTIFICATION_TEXTS.title);
    expect(message.notification?.body).toBe('"朝の運動" の時間です');
  });

  it("webpush通知のtagはルーティンIDと一致し、requireInteractionはfalse", () => {
    const message = buildRoutineNotificationMessage("token-abc", routine);

    expect(message.webpush?.notification?.tag).toBe("routine-1");
    expect(message.webpush?.notification?.requireInteraction).toBe(false);
  });
});
