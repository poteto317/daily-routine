import { handleSchedulerMessage } from "../schedulerControl";
import {
  getCheckInterval,
  getSchedules,
  setCheckInterval,
} from "../notificationState";
import { checkAndSendNotifications } from "../checkAndSendNotifications";

jest.mock("../checkAndSendNotifications", () => ({
  checkAndSendNotifications: jest.fn().mockResolvedValue(undefined),
}));

jest.mock("../logToClient", () => ({
  logToClient: jest.fn(),
}));

describe("schedulerControl", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("dataが存在しないイベントは何もしない", () => {
    handleSchedulerMessage({});
    expect(checkAndSendNotifications).not.toHaveBeenCalled();
  });

  it("TEST タイプのイベントは何もしない", () => {
    handleSchedulerMessage({ data: { type: "TEST" } });
    expect(checkAndSendNotifications).not.toHaveBeenCalled();
  });

  it("SCHEDULE_NOTIFICATIONS でスケジュール登録とチェックを開始する", () => {
    const mockPostMessage = jest.fn();
    const event = {
      data: {
        type: "SCHEDULE_NOTIFICATIONS",
        schedules: [{ id: "sched-1", time: "10:00" }],
      },
      ports: [{ postMessage: mockPostMessage }],
    };

    handleSchedulerMessage(event);

    expect(getSchedules().size).toBe(1);
    expect(checkAndSendNotifications).toHaveBeenCalledTimes(1);
    expect(mockPostMessage).toHaveBeenCalledWith({
      success: true,
      count: 1,
    });
    expect(getCheckInterval()).not.toBeNull();

    // 1分後にインターバルタイマーで再度呼ばれる
    jest.advanceTimersByTime(60000);
    expect(checkAndSendNotifications).toHaveBeenCalledTimes(2);
  });

  it("既存のインターバルが動いている状態で SCHEDULE_NOTIFICATIONS が呼ばれたら既存インターバルをクリアして再開する", () => {
    const dummyInterval = setInterval(() => {}, 1000);
    setCheckInterval(dummyInterval);

    const event = {
      data: {
        type: "SCHEDULE_NOTIFICATIONS",
        schedules: [{ id: "sched-2", time: "11:00" }],
      },
    };

    handleSchedulerMessage(event);

    expect(getCheckInterval()).not.toBe(dummyInterval);
    expect(getCheckInterval()).not.toBeNull();
  });

  it("CLEAR_SCHEDULES でスケジュールを消去しインターバルを停止する", () => {
    const mockPostMessage = jest.fn();
    const event = {
      data: { type: "CLEAR_SCHEDULES" },
      ports: [{ postMessage: mockPostMessage }],
    };

    // 先にダミーインターバルを設定
    const dummyInterval = setInterval(() => {}, 1000);
    setCheckInterval(dummyInterval);

    handleSchedulerMessage(event);

    expect(getSchedules().size).toBe(0);
    expect(getCheckInterval()).toBeNull();
    expect(mockPostMessage).toHaveBeenCalledWith({ success: true });
  });

  it("CLEAR_SCHEDULES でインターバルが元々存在しない場合も正常終了する", () => {
    setCheckInterval(null);
    const event = {
      data: { type: "CLEAR_SCHEDULES" },
    };

    handleSchedulerMessage(event);
    expect(getCheckInterval()).toBeNull();
  });
});
