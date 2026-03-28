import {
  getDebugMessageClassName,
  getNotificationButtonViewModel,
  getRoutineNotificationCounts,
} from "../helpers/notificationTest";
import type { Routine } from "@/types/routine";

describe("settings notification helpers", () => {
  it("通知ボタンの状態を status ごとに返す", () => {
    expect(getNotificationButtonViewModel("idle")).toEqual({
      disabled: false,
      className: "bg-blue-600 text-white hover:bg-blue-700",
      label: "🔔 通知をテスト",
    });

    expect(getNotificationButtonViewModel("testing")).toEqual({
      disabled: true,
      className: "bg-gray-400 text-white cursor-wait",
      label: "🔔 テスト中...",
    });

    expect(getNotificationButtonViewModel("success")).toEqual({
      disabled: false,
      className: "bg-green-600 text-white",
      label: "✓ 通知が送信されました！",
    });

    expect(getNotificationButtonViewModel("error")).toEqual({
      disabled: false,
      className: "bg-red-600 text-white",
      label: "✗ 通知の許可が必要です",
    });
  });

  it("debug message の class を error だけ切り替える", () => {
    expect(getDebugMessageClassName("error")).toContain("text-red-800");
    expect(getDebugMessageClassName("idle")).toContain("text-blue-800");
  });

  it("通知対象ルーティン数を集計する", () => {
    const routines = [
      { notificationMinutes: 0 },
      { notificationMinutes: 5 },
      {},
    ] as Routine[];

    expect(getRoutineNotificationCounts(routines)).toEqual({
      totalRoutines: 3,
      activeNotificationRoutines: 1,
    });
  });
});
