import {
  getPomodoroHistory,
  savePomodoroHistory,
  getTodayPomodoros,
  incrementTodayPomodoros,
} from "../storage";
import * as coreStorage from "@/lib/storage/core";

jest.mock("@/lib/storage/core");

const mockGetStorageItem = coreStorage.getStorageItem as jest.MockedFunction<
  typeof coreStorage.getStorageItem
>;
const mockSetStorageItem = coreStorage.setStorageItem as jest.MockedFunction<
  typeof coreStorage.setStorageItem
>;
const mockGetTodayString = coreStorage.getTodayString as jest.MockedFunction<
  typeof coreStorage.getTodayString
>;

describe("pomodoro storage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetTodayString.mockReturnValue("2026-02-12");
  });

  it("getPomodoroHistoryは履歴を取得する", () => {
    const history = {
      "2026-02-12": { date: "2026-02-12", completedPomodoros: 2 },
    };
    mockGetStorageItem.mockReturnValue(history as never);

    const result = getPomodoroHistory();

    expect(result).toEqual(history);
    expect(mockGetStorageItem).toHaveBeenCalledWith("pomodoro-history", {});
  });

  it("savePomodoroHistoryは履歴を保存する", () => {
    const history = {
      "2026-02-12": { date: "2026-02-12", completedPomodoros: 3 },
    };

    savePomodoroHistory(history);

    expect(mockSetStorageItem).toHaveBeenCalledWith(
      "pomodoro-history",
      history,
    );
  });

  it("getTodayPomodorosは当日の件数を返す", () => {
    mockGetStorageItem.mockReturnValue({
      "2026-02-12": { date: "2026-02-12", completedPomodoros: 4 },
    } as never);

    const result = getTodayPomodoros();

    expect(result).toBe(4);
  });

  it("getTodayPomodorosは当日件数が未登録の場合0を返す", () => {
    mockGetStorageItem.mockReturnValue({} as never);

    const result = getTodayPomodoros();

    expect(result).toBe(0);
  });

  it("incrementTodayPomodorosは当日件数を+1して保存する", () => {
    mockGetStorageItem.mockReturnValue({
      "2026-02-12": { date: "2026-02-12", completedPomodoros: 1 },
    } as never);

    const result = incrementTodayPomodoros();

    expect(result).toBe(2);
    expect(mockSetStorageItem).toHaveBeenCalledWith("pomodoro-history", {
      "2026-02-12": { date: "2026-02-12", completedPomodoros: 2 },
    });
  });

  it("incrementTodayPomodorosは当日件数が未登録の場合1で初期化して保存する", () => {
    mockGetStorageItem.mockReturnValue({} as never);

    const result = incrementTodayPomodoros();

    expect(result).toBe(1);
    expect(mockSetStorageItem).toHaveBeenCalledWith("pomodoro-history", {
      "2026-02-12": { date: "2026-02-12", completedPomodoros: 1 },
    });
  });
});
