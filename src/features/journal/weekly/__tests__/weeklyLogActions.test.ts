import journalTexts from "../../locales/ja.json";
import {
  deleteWeeklyLogAndReload,
  saveWeeklyLogAndReload,
} from "../weeklyLogActions";
import { buildWeeklyLogDeleteConfirmMessage } from "../weeklyLogTexts";

const WEEK = "2026-11-02";

describe("saveWeeklyLogAndReload", () => {
  const setup = (saved: boolean) => ({
    reloadData: jest.fn(),
    closeForm: jest.fn(),
    saveLog: jest.fn(() => saved),
    alertFn: jest.fn(),
  });

  it.each(["", "   ", "\n\t "])(
    "内容が空白のみ(%j)なら警告して保存も再読み込みもしない",
    (content) => {
      const deps = setup(true);
      const result = saveWeeklyLogAndReload({
        weekStart: WEEK,
        content,
        ...deps,
      });
      expect(result).toBe(false);
      expect(deps.alertFn).toHaveBeenCalledWith(
        journalTexts.weeklyLog.alertMissingContent,
      );
      expect(deps.saveLog).not.toHaveBeenCalled();
      expect(deps.reloadData).not.toHaveBeenCalled();
      expect(deps.closeForm).not.toHaveBeenCalled();
    },
  );

  it("保存に成功したら再読み込みしてフォームを閉じ true を返す", () => {
    const deps = setup(true);
    const result = saveWeeklyLogAndReload({
      weekStart: WEEK,
      content: "内容",
      ...deps,
    });
    expect(result).toBe(true);
    expect(deps.saveLog).toHaveBeenCalledWith(WEEK, "内容");
    expect(deps.reloadData).toHaveBeenCalledTimes(1);
    expect(deps.closeForm).toHaveBeenCalledTimes(1);
    expect(deps.alertFn).not.toHaveBeenCalled();
  });

  it("保存に失敗しても再読み込みするがフォームは閉じず false を返す", () => {
    const deps = setup(false);
    const result = saveWeeklyLogAndReload({
      weekStart: WEEK,
      content: "内容",
      ...deps,
    });
    expect(result).toBe(false);
    expect(deps.reloadData).toHaveBeenCalledTimes(1);
    expect(deps.closeForm).not.toHaveBeenCalled();
  });
});

describe("deleteWeeklyLogAndReload", () => {
  it("確認をキャンセルしたら削除も再読み込みもしない", () => {
    const reloadData = jest.fn();
    const deleteLog = jest.fn(() => true);
    const confirmFn = jest.fn(() => false);
    const result = deleteWeeklyLogAndReload({
      weekStart: WEEK,
      reloadData,
      deleteLog,
      confirmFn,
    });
    expect(result).toBe(false);
    expect(confirmFn).toHaveBeenCalledWith(
      buildWeeklyLogDeleteConfirmMessage(WEEK),
    );
    expect(deleteLog).not.toHaveBeenCalled();
    expect(reloadData).not.toHaveBeenCalled();
  });

  it("確認したら対象の週を削除して再読み込みし true を返す", () => {
    const reloadData = jest.fn();
    const deleteLog = jest.fn(() => true);
    const result = deleteWeeklyLogAndReload({
      weekStart: WEEK,
      reloadData,
      deleteLog,
      confirmFn: () => true,
    });
    expect(result).toBe(true);
    expect(deleteLog).toHaveBeenCalledWith(WEEK);
    expect(reloadData).toHaveBeenCalledTimes(1);
  });

  it("削除に失敗しても再読み込みし false を返す", () => {
    const reloadData = jest.fn();
    const result = deleteWeeklyLogAndReload({
      weekStart: WEEK,
      reloadData,
      deleteLog: () => false,
      confirmFn: () => true,
    });
    expect(result).toBe(false);
    expect(reloadData).toHaveBeenCalledTimes(1);
  });
});
