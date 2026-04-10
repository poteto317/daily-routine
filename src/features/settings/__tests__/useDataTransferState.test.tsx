import { act, renderHook } from "@testing-library/react";

jest.mock("../state/dataTransferHelpers", () => ({
  createExportData: jest.fn(() => ({ exported: true })),
  downloadExportData: jest.fn(),
  getSelectedTypeLabels: jest.fn(() => ["設定"]),
  importSelectedData: jest.fn(),
}));

import {
  downloadExportData,
  getSelectedTypeLabels,
  importSelectedData,
} from "../state/dataTransferHelpers";
import { useDataTransferState } from "../state/useDataTransferState";

describe("useDataTransferState", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    jest.spyOn(window, "confirm").mockReturnValue(true);
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it("エクスポート成功後に status を idle に戻す", () => {
    const { result } = renderHook(() => useDataTransferState());

    act(() => {
      result.current.handleExport();
    });

    expect(downloadExportData).toHaveBeenCalled();
    expect(result.current.exportStatus).toBe("success");

    act(() => {
      jest.advanceTimersByTime(3000);
    });

    expect(result.current.exportStatus).toBe("idle");
  });

  it("インポートボタン押下で file input をクリックする", () => {
    const { result } = renderHook(() => useDataTransferState());
    const click = jest.fn();
    result.current.fileInputRef.current = {
      click,
    } as unknown as HTMLInputElement;

    act(() => {
      result.current.handleImportClick();
    });

    expect(click).toHaveBeenCalled();
  });

  it("インポート成功時に status を success にし、input をリセットする", async () => {
    const { result } = renderHook(() => useDataTransferState());
    const target = {
      files: [
        {
          text: jest.fn().mockResolvedValue('{"settings":{}}'),
        },
      ],
      value: "import.json",
    };

    await act(async () => {
      await result.current.handleImport({ target } as never);
    });

    expect(importSelectedData).toHaveBeenCalledWith(
      { settings: {} },
      result.current.importOptions,
    );
    expect(result.current.importStatus).toBe("success");
    expect(target.value).toBe("");
  });

  it("インポート失敗時に status を error にして idle に戻す", async () => {
    const { result } = renderHook(() => useDataTransferState());
    const target = {
      files: [
        {
          text: jest.fn().mockResolvedValue("not-json"),
        },
      ],
      value: "import.json",
    };

    await act(async () => {
      await result.current.handleImport({ target } as never);
    });

    expect(result.current.importStatus).toBe("error");
    expect(target.value).toBe("");

    act(() => {
      jest.advanceTimersByTime(3000);
    });

    expect(result.current.importStatus).toBe("idle");
  });

  it("ファイル未選択なら何もしない", async () => {
    const { result } = renderHook(() => useDataTransferState());
    const target = {
      files: [],
      value: "",
    };

    await act(async () => {
      await result.current.handleImport({ target } as never);
    });

    expect(result.current.importStatus).toBe("idle");
    expect(importSelectedData).not.toHaveBeenCalled();
  });

  it("選択項目がない場合は alert して import しない", async () => {
    const alertSpy = jest.spyOn(window, "alert").mockImplementation(() => {});
    (getSelectedTypeLabels as jest.Mock).mockReturnValueOnce([]);
    const { result } = renderHook(() => useDataTransferState());

    act(() => {
      result.current.setImportOptions({
        routines: false,
        progress: false,
        history: false,
        settings: false,
      });
    });

    const target = {
      files: [
        {
          text: jest.fn().mockResolvedValue('{"settings":{}}'),
        },
      ],
      value: "import.json",
    };

    await act(async () => {
      await result.current.handleImport({ target } as never);
    });

    expect(alertSpy).toHaveBeenCalled();
    expect(importSelectedData).not.toHaveBeenCalled();
    expect(result.current.importStatus).toBe("idle");
    expect(target.value).toBe("");
    alertSpy.mockRestore();
  });
});
