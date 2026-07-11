import { NOTIFICATION_TEXTS } from "../notification-texts";

describe("NOTIFICATION_TEXTS", () => {
  it("iconとbadgeはPNGを参照する（SVGはAndroidのWebPush通知で表示されないため）", () => {
    expect(NOTIFICATION_TEXTS.icon).toBe("/icon-192.png");
    expect(NOTIFICATION_TEXTS.badge).toBe("/icon-192.png");
  });

  it("bodyはルーティンタイトルを埋め込んだ文言を生成する", () => {
    expect(NOTIFICATION_TEXTS.body("朝の運動")).toBe('"朝の運動" の時間です');
  });
});
