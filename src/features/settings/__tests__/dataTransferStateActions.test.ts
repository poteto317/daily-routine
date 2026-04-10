import { EMPTY_TRANSFER_OPTIONS } from "../state/constants";
import {
  resetTransferInputValue,
  runExportTransfer,
  runImportTransfer,
  triggerTransferFileSelection,
} from "../state/dataTransferStateActions";

describe("dataTransferStateActions", () => {
  it("エクスポート成功時は success を返す", () => {
    const createExportData = jest.fn(() => ({ test: true }));
    const downloadExportData = jest.fn();

    expect(
      runExportTransfer({
        exportOptions: EMPTY_TRANSFER_OPTIONS,
        createExportData,
        downloadExportData,
      }),
    ).toBe("success");
    expect(createExportData).toHaveBeenCalledWith(EMPTY_TRANSFER_OPTIONS);
    expect(downloadExportData).toHaveBeenCalledWith(EMPTY_TRANSFER_OPTIONS, {
      test: true,
    });
  });

  it("エクスポート失敗時は error を返す", () => {
    expect(
      runExportTransfer({
        exportOptions: EMPTY_TRANSFER_OPTIONS,
        createExportData: jest.fn(() => ({ test: true })),
        downloadExportData: jest.fn(() => {
          throw new Error("failed");
        }),
      }),
    ).toBe("error");
  });

  it("ファイル選択 input を開く", () => {
    const click = jest.fn();

    triggerTransferFileSelection({
      current: { click } as unknown as HTMLInputElement,
    });

    expect(click).toHaveBeenCalled();
  });

  it("file input がなければ何もしない", () => {
    expect(() => {
      triggerTransferFileSelection({ current: null });
    }).not.toThrow();
  });

  it("input value をリセットする", () => {
    const target = { value: "selected.json" };

    resetTransferInputValue(target);

    expect(target.value).toBe("");
  });

  it("ファイルがなければ何もしない", async () => {
    await expect(
      runImportTransfer({
        importOptions: EMPTY_TRANSFER_OPTIONS,
        alertNoSelectionMessage: "select",
        buildConfirmImportMessage: (types) => types.join(","),
        getSelectedTypeLabels: jest.fn(),
        importSelectedData: jest.fn(),
      }),
    ).resolves.toEqual({
      status: "idle",
      shouldReload: false,
      shouldClearInput: false,
    });
  });

  it("選択項目がなければ alert して終了する", async () => {
    const alertFn = jest.fn();

    await expect(
      runImportTransfer({
        file: { text: jest.fn().mockResolvedValue("{}") },
        importOptions: EMPTY_TRANSFER_OPTIONS,
        alertNoSelectionMessage: "select",
        buildConfirmImportMessage: (types) => types.join(","),
        getSelectedTypeLabels: jest.fn(() => []),
        importSelectedData: jest.fn(),
        alertFn,
      }),
    ).resolves.toEqual({
      status: "idle",
      shouldReload: false,
      shouldClearInput: true,
    });
    expect(alertFn).toHaveBeenCalledWith("select");
  });

  it("確認でキャンセルされたら終了する", async () => {
    await expect(
      runImportTransfer({
        file: { text: jest.fn().mockResolvedValue("{}") },
        importOptions: EMPTY_TRANSFER_OPTIONS,
        alertNoSelectionMessage: "select",
        buildConfirmImportMessage: (types) => `confirm:${types.join(",")}`,
        getSelectedTypeLabels: jest.fn(() => ["設定"]),
        importSelectedData: jest.fn(),
        confirmFn: jest.fn(() => false),
      }),
    ).resolves.toEqual({
      status: "idle",
      shouldReload: false,
      shouldClearInput: true,
    });
  });

  it("成功時は success と reload 指示を返す", async () => {
    const importSelectedData = jest.fn();

    await expect(
      runImportTransfer({
        file: { text: jest.fn().mockResolvedValue('{"ok":true}') },
        importOptions: EMPTY_TRANSFER_OPTIONS,
        alertNoSelectionMessage: "select",
        buildConfirmImportMessage: (types) => `confirm:${types.join(",")}`,
        getSelectedTypeLabels: jest.fn(() => ["設定"]),
        importSelectedData,
        confirmFn: jest.fn(() => true),
      }),
    ).resolves.toEqual({
      status: "success",
      shouldReload: true,
      shouldClearInput: true,
    });
    expect(importSelectedData).toHaveBeenCalledWith(
      { ok: true },
      EMPTY_TRANSFER_OPTIONS,
    );
  });

  it("例外時は error を返す", async () => {
    await expect(
      runImportTransfer({
        file: { text: jest.fn().mockResolvedValue("not-json") },
        importOptions: EMPTY_TRANSFER_OPTIONS,
        alertNoSelectionMessage: "select",
        buildConfirmImportMessage: (types) => `confirm:${types.join(",")}`,
        getSelectedTypeLabels: jest.fn(() => ["設定"]),
        importSelectedData: jest.fn(),
      }),
    ).resolves.toEqual({
      status: "error",
      shouldReload: false,
      shouldClearInput: true,
    });
  });
});
