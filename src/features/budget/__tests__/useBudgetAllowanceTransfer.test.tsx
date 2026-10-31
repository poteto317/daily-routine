import { StrictMode, type ChangeEvent } from "react";
import { act, renderHook } from "@testing-library/react";
import { downloadJsonFile } from "@/lib/downloadJsonFile";
import { getTodayString } from "@/lib/storage/core";
import {
  buildBudgetAllowanceExport,
  getBudgetAllowanceExportFileName,
} from "../budgetAllowanceTransfer";
import {
  saveBudgetAllowanceItems,
  saveBudgetExpenseItems,
  saveBudgetIncomeItems,
} from "../storage";
import { useBudgetAllowanceTransfer } from "../useBudgetAllowanceTransfer";
import texts from "../locales/ja.json";

jest.mock("@/lib/downloadJsonFile", () => ({
  downloadJsonFile: jest.fn(),
}));
jest.mock("../storage", () => ({
  ...jest.requireActual("../storage"),
  saveBudgetAllowanceItems: jest.fn(),
}));

const mockDownloadJsonFile = downloadJsonFile as jest.MockedFunction<
  typeof downloadJsonFile
>;
const mockSaveBudgetAllowanceItems =
  saveBudgetAllowanceItems as jest.MockedFunction<
    typeof saveBudgetAllowanceItems
  >;

const transferTexts = texts.allowanceSettings.transfer;

const incomeItem = {
  id: "income-1",
  name: "給与",
  amount: 300000,
  createdAt: "2026-05-01T00:00:00.000Z",
};
const fixedItem = {
  id: "expense-1",
  name: "家賃",
  amount: 80000,
  kind: "fixed" as const,
  createdAt: "2026-05-01T00:00:00.000Z",
};
const variableItem = {
  id: "expense-2",
  name: "食費",
  amount: 30000,
  kind: "variable" as const,
  createdAt: "2026-05-01T00:00:00.000Z",
};

const validText = JSON.stringify(
  buildBudgetAllowanceExport(
    [incomeItem],
    [fixedItem, variableItem, { ...variableItem, id: "expense-3" }],
  ),
);
const emptyText = JSON.stringify(buildBudgetAllowanceExport([], []));

/** jest の jsdom には File#text が無いのでスタブにする */
const buildFile = (text: string, size = text.length) => ({
  size,
  text: jest.fn().mockResolvedValue(text),
});

/** text() の解決を遅らせ、読み込みの最中の状態を作る */
const buildPendingFile = () => {
  let resolve: (text: string) => void = () => {};
  const text = new Promise<string>((promiseResolve) => {
    resolve = promiseResolve;
  });
  return {
    file: { size: 1, text: jest.fn(() => text) },
    resolveText: (value: string) => resolve(value),
  };
};

const buildChangeEvent = (file?: { size: number; text: jest.Mock }) =>
  ({
    target: { files: file ? [file] : [], value: "C:\\fakepath\\a.json" },
  }) as unknown as ChangeEvent<HTMLInputElement>;

describe("useBudgetAllowanceTransfer", () => {
  const onImported = jest.fn();
  let confirmSpy: jest.SpyInstance;

  const renderTransfer = () =>
    renderHook(() => useBudgetAllowanceTransfer({ onImported }));

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    mockDownloadJsonFile.mockReset();
    mockSaveBudgetAllowanceItems.mockReset();
    mockSaveBudgetAllowanceItems.mockReturnValue("saved");
    confirmSpy = jest.spyOn(window, "confirm").mockReturnValue(true);
  });

  afterEach(() => {
    confirmSpy.mockRestore();
  });

  describe("handleExport", () => {
    it("保存済みの項目を書き出し、成功のメッセージを出す", () => {
      saveBudgetIncomeItems([incomeItem]);
      saveBudgetExpenseItems([fixedItem]);
      const { result } = renderTransfer();

      act(() => {
        result.current.handleExport();
      });

      expect(mockDownloadJsonFile).toHaveBeenCalledTimes(1);
      expect(mockDownloadJsonFile).toHaveBeenCalledWith(
        getBudgetAllowanceExportFileName(getTodayString()),
        {
          ...buildBudgetAllowanceExport([incomeItem], [fixedItem]),
          exportDate: expect.any(String),
        },
      );
      expect(result.current.status).toEqual({
        kind: "success",
        message: transferTexts.exportSuccess,
      });
    });

    it("項目が 0 件でも書き出せる", () => {
      const { result } = renderTransfer();

      act(() => {
        result.current.handleExport();
      });

      expect(mockDownloadJsonFile).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ incomeItems: [], expenseItems: [] }),
      );
      expect(result.current.status?.kind).toBe("success");
    });

    it("書き出しに失敗したらエラーのメッセージを出す", () => {
      mockDownloadJsonFile.mockImplementation(() => {
        throw new Error("failed");
      });
      const { result } = renderTransfer();

      act(() => {
        result.current.handleExport();
      });

      expect(result.current.status).toEqual({
        kind: "error",
        message: transferTexts.errors.exportFailed,
      });
    });
  });

  describe("handleImportClick", () => {
    it("隠したファイル入力を開く", () => {
      const { result } = renderTransfer();
      const click = jest.fn();
      result.current.fileInputRef.current = {
        click,
      } as unknown as HTMLInputElement;

      result.current.handleImportClick();

      expect(click).toHaveBeenCalledTimes(1);
    });
  });

  describe("handleFileChange", () => {
    it("件数つきで確認し、保存して onImported を呼び、成功のメッセージを出す", async () => {
      const { result } = renderTransfer();

      await act(async () => {
        await result.current.handleFileChange(
          buildChangeEvent(buildFile(validText)),
        );
      });

      const message = confirmSpy.mock.calls[0][0] as string;
      expect(message).toBe(
        "収入 1 件・固定費 1 件・変動費 2 件を読み込みます。今の項目はすべてファイルの内容に置き換わります。よろしいですか？",
      );
      expect(mockSaveBudgetAllowanceItems).toHaveBeenCalledTimes(1);
      expect(mockSaveBudgetAllowanceItems).toHaveBeenCalledWith(
        [incomeItem],
        [fixedItem, variableItem, { ...variableItem, id: "expense-3" }],
      );
      expect(onImported).toHaveBeenCalledTimes(1);
      expect(result.current.status).toEqual({
        kind: "success",
        message: "収入 1 件・固定費 1 件・変動費 2 件を読み込みました",
      });
    });

    it("確認でキャンセルしたら保存せず、メッセージも出さない", async () => {
      confirmSpy.mockReturnValue(false);
      const { result } = renderTransfer();

      await act(async () => {
        await result.current.handleFileChange(
          buildChangeEvent(buildFile(validText)),
        );
      });

      expect(mockSaveBudgetAllowanceItems).not.toHaveBeenCalled();
      expect(onImported).not.toHaveBeenCalled();
      expect(result.current.status).toBeNull();
    });

    it.each([
      ["不正なファイル", "not json", transferTexts.errors.invalidFormat],
      ["空のファイル", emptyText, transferTexts.errors.empty],
    ])("%s では確認も保存もしない", async (_label, text, message) => {
      const { result } = renderTransfer();

      await act(async () => {
        await result.current.handleFileChange(
          buildChangeEvent(buildFile(text)),
        );
      });

      expect(confirmSpy).not.toHaveBeenCalled();
      expect(mockSaveBudgetAllowanceItems).not.toHaveBeenCalled();
      expect(onImported).not.toHaveBeenCalled();
      expect(result.current.status).toEqual({ kind: "error", message });
    });

    it("1 MB を超えるファイルは読まない", async () => {
      const file = buildFile(validText, 1024 * 1024 + 1);
      const { result } = renderTransfer();

      await act(async () => {
        await result.current.handleFileChange(buildChangeEvent(file));
      });

      expect(file.text).not.toHaveBeenCalled();
      expect(result.current.status).toEqual({
        kind: "error",
        message: transferTexts.errors.tooLarge,
      });
    });

    it("ちょうど 1 MB のファイルは読む", async () => {
      const file = buildFile(validText, 1024 * 1024);
      const { result } = renderTransfer();

      await act(async () => {
        await result.current.handleFileChange(buildChangeEvent(file));
      });

      expect(file.text).toHaveBeenCalledTimes(1);
    });

    it("ファイルを読めなければエラーのメッセージを出す", async () => {
      const file = buildFile(validText);
      file.text.mockRejectedValue(new Error("failed"));
      const { result } = renderTransfer();

      await act(async () => {
        await result.current.handleFileChange(buildChangeEvent(file));
      });

      expect(confirmSpy).not.toHaveBeenCalled();
      expect(result.current.status).toEqual({
        kind: "error",
        message: transferTexts.errors.readFailed,
      });
    });

    it("保存に失敗したら onImported を呼ばず、エラーのメッセージを出す", async () => {
      mockSaveBudgetAllowanceItems.mockReturnValue("failed");
      const { result } = renderTransfer();

      await act(async () => {
        await result.current.handleFileChange(
          buildChangeEvent(buildFile(validText)),
        );
      });

      expect(onImported).not.toHaveBeenCalled();
      expect(result.current.status).toEqual({
        kind: "error",
        message: transferTexts.errors.saveFailed,
      });
    });

    it("書き戻しにも失敗したら一覧を読み直し、収入だけ置き換わった可能性を伝える", async () => {
      mockSaveBudgetAllowanceItems.mockReturnValue("rollbackFailed");
      const { result } = renderTransfer();

      await act(async () => {
        await result.current.handleFileChange(
          buildChangeEvent(buildFile(validText)),
        );
      });

      expect(onImported).toHaveBeenCalledTimes(1);
      expect(transferTexts.errors.partiallySaved).toEqual(expect.any(String));
      expect(result.current.status).toEqual({
        kind: "error",
        message: transferTexts.errors.partiallySaved,
      });
    });

    it("Strict Mode でも確認して保存する", async () => {
      const { result } = renderHook(
        () => useBudgetAllowanceTransfer({ onImported }),
        { wrapper: StrictMode },
      );

      await act(async () => {
        await result.current.handleFileChange(
          buildChangeEvent(buildFile(validText)),
        );
      });

      expect(confirmSpy).toHaveBeenCalledTimes(1);
      expect(mockSaveBudgetAllowanceItems).toHaveBeenCalledTimes(1);
    });

    it.each([
      ["成功", validText, true, "saved"],
      ["キャンセル", validText, false, "saved"],
      ["検証エラー", "not json", true, "saved"],
      ["保存失敗", validText, true, "failed"],
      ["書き戻し失敗", validText, true, "rollbackFailed"],
    ] as const)(
      "%s でも input の値を空に戻す",
      async (_label, text, confirmed, saveResult) => {
        confirmSpy.mockReturnValue(confirmed);
        mockSaveBudgetAllowanceItems.mockReturnValue(saveResult);
        const event = buildChangeEvent(buildFile(text));
        const { result } = renderTransfer();

        await act(async () => {
          await result.current.handleFileChange(event);
        });

        expect(event.target.value).toBe("");
      },
    );

    it("1 MB 超・読み込み失敗でも input の値を空に戻す", async () => {
      const tooLarge = buildChangeEvent(buildFile(validText, 1024 * 1024 + 1));
      const unreadableFile = buildFile(validText);
      unreadableFile.text.mockRejectedValue(new Error("failed"));
      const unreadable = buildChangeEvent(unreadableFile);
      const { result } = renderTransfer();

      await act(async () => {
        await result.current.handleFileChange(tooLarge);
        await result.current.handleFileChange(unreadable);
      });

      expect(tooLarge.target.value).toBe("");
      expect(unreadable.target.value).toBe("");
    });

    it("ファイルが選ばれていなければ何もしない", async () => {
      const { result } = renderTransfer();
      act(() => {
        result.current.handleExport();
      });
      const statusBefore = result.current.status;

      await act(async () => {
        await result.current.handleFileChange(buildChangeEvent());
      });

      expect(confirmSpy).not.toHaveBeenCalled();
      expect(mockSaveBudgetAllowanceItems).not.toHaveBeenCalled();
      expect(result.current.isImporting).toBe(false);
      expect(result.current.status).toBe(statusBefore);
    });

    it("前の操作のメッセージを処理の開始時に消す", async () => {
      const { file, resolveText } = buildPendingFile();
      const { result } = renderTransfer();
      act(() => {
        result.current.handleExport();
      });
      expect(result.current.status).not.toBeNull();

      let pending: Promise<void> = Promise.resolve();
      act(() => {
        pending = result.current.handleFileChange(buildChangeEvent(file));
      });

      expect(result.current.status).toBeNull();
      await act(async () => {
        resolveText(validText);
        await pending;
      });
    });

    it("読み込み中は isImporting が true で、終わると false に戻る", async () => {
      const { file, resolveText } = buildPendingFile();
      const { result } = renderTransfer();
      expect(result.current.isImporting).toBe(false);

      let pending: Promise<void> = Promise.resolve();
      act(() => {
        pending = result.current.handleFileChange(buildChangeEvent(file));
      });
      expect(result.current.isImporting).toBe(true);

      await act(async () => {
        resolveText(validText);
        await pending;
      });
      expect(result.current.isImporting).toBe(false);
    });

    it("読み込みの最中にアンマウントしたら、確認も保存もしない", async () => {
      const { file, resolveText } = buildPendingFile();
      const event = buildChangeEvent(file);
      const { result, unmount } = renderTransfer();

      let pending: Promise<void> = Promise.resolve();
      act(() => {
        pending = result.current.handleFileChange(event);
      });
      unmount();
      resolveText(validText);
      await pending;

      expect(confirmSpy).not.toHaveBeenCalled();
      expect(mockSaveBudgetAllowanceItems).not.toHaveBeenCalled();
      expect(onImported).not.toHaveBeenCalled();
      expect(event.target.value).toBe("");
    });
  });
});
