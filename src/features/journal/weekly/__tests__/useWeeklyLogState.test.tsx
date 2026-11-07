import { act, renderHook } from "@testing-library/react";
import { useWeeklyLogState } from "../useWeeklyLogState";
import * as weeklyLogStorage from "../weeklyLogStorage";
import * as coreStorage from "@/lib/storage/core";
import journalTexts from "../../locales/ja.json";
import type { WeeklyLogEntry, WeeklyLogHistory } from "@/types/routine";

jest.mock("../weeklyLogStorage", () => ({
  ...jest.requireActual("../weeklyLogStorage"),
  getWeeklyLogHistory: jest.fn(),
  saveWeeklyLog: jest.fn(),
  deleteWeeklyLog: jest.fn(),
}));
jest.mock("@/lib/storage/core", () => ({
  ...jest.requireActual("@/lib/storage/core"),
  getTodayString: jest.fn(),
}));

const mockGetHistory = weeklyLogStorage.getWeeklyLogHistory as jest.Mock;
const mockSave = weeklyLogStorage.saveWeeklyLog as jest.Mock;
const mockDelete = weeklyLogStorage.deleteWeeklyLog as jest.Mock;
const mockToday = coreStorage.getTodayString as jest.Mock;

const entry = (weekStart: string, content = "内容"): WeeklyLogEntry => ({
  id: `w-${weekStart}`,
  weekStart,
  content,
  createdAt: "2026-11-06T12:00:00.000Z",
  updatedAt: "2026-11-06T12:00:00.000Z",
});

describe("useWeeklyLogState", () => {
  let history: WeeklyLogHistory;

  beforeEach(() => {
    jest.clearAllMocks();
    history = { "2026-10-26": entry("2026-10-26", "先週の内容") };
    mockGetHistory.mockImplementation(() => ({ ...history }));
    mockSave.mockReturnValue(true);
    mockDelete.mockReturnValue(true);
    mockToday.mockReturnValue("2026-11-07"); // 土曜
    jest.spyOn(window, "alert").mockImplementation(() => {});
    jest.spyOn(window, "confirm").mockReturnValue(true);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("最初は今週（月曜開始）を表示する", () => {
    const { result } = renderHook(() => useWeeklyLogState());
    expect(result.current.currentWeekStart).toBe("2026-11-02");
    expect(result.current.selectedWeekStart).toBe("2026-11-02");
    expect(result.current.selectedEntry).toBeNull();
    expect(result.current.canGoNext).toBe(false);
  });

  it("前の週へ移り、今週までは次の週へ戻れるが未来へは進めない", () => {
    const { result } = renderHook(() => useWeeklyLogState());

    act(() => result.current.goToPreviousWeek());
    expect(result.current.selectedWeekStart).toBe("2026-10-26");
    expect(result.current.selectedEntry?.content).toBe("先週の内容");
    expect(result.current.canGoNext).toBe(true);

    act(() => result.current.goToNextWeek());
    act(() => result.current.goToNextWeek());
    expect(result.current.selectedWeekStart).toBe("2026-11-02");
  });

  it("フォームを開いている間は週を切り替えない", () => {
    const { result } = renderHook(() => useWeeklyLogState());

    act(() => result.current.startEditing());
    expect(result.current.canNavigate).toBe(false);
    act(() => result.current.goToPreviousWeek());
    act(() => result.current.openWeek("2026-10-26"));
    expect(result.current.selectedWeekStart).toBe("2026-11-02");
  });

  it("編集を始めると既存の本文が入る", () => {
    const { result } = renderHook(() => useWeeklyLogState());
    act(() => result.current.openWeek("2026-10-26"));
    act(() => result.current.startEditing());
    expect(result.current.contentInput).toBe("先週の内容");
  });

  it("開いた週を編集して保存しても、その週を表示したままになる", () => {
    const { result } = renderHook(() => useWeeklyLogState());
    act(() => result.current.openWeek("2026-10-26"));
    act(() => result.current.startEditing());
    act(() => result.current.changeContent("書き直した内容"));
    act(() => result.current.save());

    expect(mockSave).toHaveBeenCalledWith("2026-10-26", "書き直した内容");
    expect(result.current.selectedWeekStart).toBe("2026-10-26");
  });

  it("空白だけの本文では保存しない", () => {
    const { result } = renderHook(() => useWeeklyLogState());
    act(() => result.current.startEditing());
    act(() => result.current.changeContent("  \n "));
    act(() => result.current.save());

    expect(window.alert).toHaveBeenCalledWith(
      journalTexts.weeklyLog.alertMissingContent,
    );
    expect(mockSave).not.toHaveBeenCalled();
    expect(result.current.isEditing).toBe(true);
  });

  it("保存に成功したら読み直してフォームを閉じる", () => {
    const { result } = renderHook(() => useWeeklyLogState());
    act(() => result.current.startEditing());
    act(() => result.current.changeContent("今週の内容"));
    history = { ...history, "2026-11-02": entry("2026-11-02", "今週の内容") };
    act(() => result.current.save());

    expect(mockSave).toHaveBeenCalledWith("2026-11-02", "今週の内容");
    expect(result.current.isEditing).toBe(false);
    expect(result.current.selectedEntry?.content).toBe("今週の内容");
    expect(result.current.entries.map((item) => item.weekStart)).toEqual([
      "2026-11-02",
      "2026-10-26",
    ]);
  });

  it("保存に失敗したらフォームを開いたまま入力を残し、読み直す", () => {
    mockSave.mockReturnValue(false);
    const { result } = renderHook(() => useWeeklyLogState());
    act(() => result.current.startEditing());
    act(() => result.current.changeContent("今週の内容"));
    const callsBefore = mockGetHistory.mock.calls.length;
    act(() => result.current.save());

    expect(result.current.isEditing).toBe(true);
    expect(result.current.contentInput).toBe("今週の内容");
    expect(mockGetHistory.mock.calls.length).toBeGreaterThan(callsBefore);
  });

  it("日をまたいで翌週になっても、書き始めた週へ保存する", () => {
    const { result, rerender } = renderHook(() => useWeeklyLogState());
    act(() => result.current.startEditing());
    mockToday.mockReturnValue("2026-11-09"); // 翌週の月曜
    rerender();
    act(() => result.current.changeContent("金曜に書き始めた内容"));
    act(() => result.current.save());

    expect(result.current.currentWeekStart).toBe("2026-11-09");
    expect(mockSave).toHaveBeenCalledWith("2026-11-02", "金曜に書き始めた内容");
  });

  it("前後の移動をせずに書き始め、日をまたいでキャンセルすると、新しい今週を選ぶ", () => {
    const { result, rerender } = renderHook(() => useWeeklyLogState());
    act(() => result.current.startEditing());
    mockToday.mockReturnValue("2026-11-09");
    rerender();
    expect(result.current.selectedWeekStart).toBe("2026-11-02");
    act(() => result.current.cancelEditing());

    expect(result.current.currentWeekStart).toBe("2026-11-09");
    expect(result.current.selectedWeekStart).toBe(
      result.current.currentWeekStart,
    );
  });

  it("前後の移動をせずに書き始め、日をまたいで保存すると、保存した週を表示したままにする", () => {
    const { result, rerender } = renderHook(() => useWeeklyLogState());
    act(() => result.current.startEditing());
    mockToday.mockReturnValue("2026-11-09");
    rerender();
    act(() => result.current.changeContent("金曜に書き始めた内容"));
    act(() => result.current.save());

    expect(mockSave).toHaveBeenCalledWith("2026-11-02", "金曜に書き始めた内容");
    expect(result.current.isEditing).toBe(false);
    expect(result.current.currentWeekStart).toBe("2026-11-09");
    expect(result.current.selectedWeekStart).toBe("2026-11-02");
  });

  it("再描画の無いまま日をまたいで保存しても、保存した週を表示したままにする", () => {
    const { result } = renderHook(() => useWeeklyLogState());
    act(() => result.current.startEditing());
    act(() => result.current.changeContent("日曜に書いた内容"));
    mockToday.mockReturnValue("2026-11-09"); // 再描画せずに翌週の月曜になる
    act(() => result.current.save());

    expect(mockSave).toHaveBeenCalledWith("2026-11-02", "日曜に書いた内容");
    expect(result.current.isEditing).toBe(false);
    expect(result.current.currentWeekStart).toBe("2026-11-09");
    expect(result.current.selectedWeekStart).toBe("2026-11-02");
  });

  it("日をまたいだ後の保存に失敗したら、フォームを開いたまま書いていた週を保つ", () => {
    mockSave.mockReturnValue(false);
    const { result, rerender } = renderHook(() => useWeeklyLogState());
    act(() => result.current.startEditing());
    mockToday.mockReturnValue("2026-11-09");
    rerender();
    act(() => result.current.changeContent("金曜に書き始めた内容"));
    act(() => result.current.save());

    expect(result.current.isEditing).toBe(true);
    expect(result.current.selectedWeekStart).toBe("2026-11-02");
  });

  it("今週分を保存したら、その後も今週に追従する", () => {
    const { result, rerender } = renderHook(() => useWeeklyLogState());
    act(() => result.current.startEditing());
    act(() => result.current.changeContent("今週の内容"));
    act(() => result.current.save());
    mockToday.mockReturnValue("2026-11-09");
    rerender();
    expect(result.current.selectedWeekStart).toBe("2026-11-09");
  });

  it("編集していなければ、日をまたいで翌週になったら新しい今週を選ぶ", () => {
    const { result, rerender } = renderHook(() => useWeeklyLogState());
    expect(result.current.selectedWeekStart).toBe("2026-11-02");
    mockToday.mockReturnValue("2026-11-09");
    rerender();
    expect(result.current.selectedWeekStart).toBe("2026-11-09");
    expect(result.current.currentWeekStart).toBe("2026-11-09");
  });

  it("削除の確認でキャンセルすると消さない", () => {
    (window.confirm as jest.Mock).mockReturnValue(false);
    const { result } = renderHook(() => useWeeklyLogState());
    act(() => result.current.openWeek("2026-10-26"));
    act(() => result.current.remove());
    expect(mockDelete).not.toHaveBeenCalled();
  });

  it("削除の確認で OK なら消して読み直す", () => {
    const { result } = renderHook(() => useWeeklyLogState());
    act(() => result.current.openWeek("2026-10-26"));
    history = {};
    act(() => result.current.remove());

    expect(window.confirm).toHaveBeenCalledWith(
      "2026年10月26日（月）開始の週の業務日誌を削除しますか？",
    );
    expect(mockDelete).toHaveBeenCalledWith("2026-10-26");
    expect(result.current.selectedEntry).toBeNull();
    expect(result.current.entries).toEqual([]);
  });

  it("キャンセルでフォームを閉じ、入力を捨てる", () => {
    const { result } = renderHook(() => useWeeklyLogState());
    act(() => result.current.startEditing());
    act(() => result.current.changeContent("書きかけ"));
    act(() => result.current.cancelEditing());
    expect(result.current.isEditing).toBe(false);
    expect(result.current.contentInput).toBe("");
  });
});
