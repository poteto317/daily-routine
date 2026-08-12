import { act, renderHook } from "@testing-library/react";

jest.mock("../state/dataTransferHelpers", () => ({
  getSelectedTypeLabels: jest.fn(() => ["設定"]),
  importSelectedData: jest.fn(),
}));

import {
  getSelectedTypeLabels,
  importSelectedData,
} from "../state/dataTransferHelpers";
import { useImportTransferState } from "../state/useImportTransferState";
import { EMPTY_TRANSFER_OPTIONS } from "../state/constants";

describe("useImportTransferState", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    jest.spyOn(window, "confirm").mockReturnValue(true);
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it("インポートボタン押下で file input をクリックする", () => {
    const { result } = renderHook(() => useImportTransferState());
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
    const { result } = renderHook(() => useImportTransferState());
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
    const { result } = renderHook(() => useImportTransferState());
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

  it("選択項目がない場合は alert して import しない", async () => {
    const alertSpy = jest.spyOn(window, "alert").mockImplementation(() => {});
    (getSelectedTypeLabels as jest.Mock).mockReturnValueOnce([]);
    const { result } = renderHook(() => useImportTransferState());

    act(() => {
      result.current.setImportOptions(EMPTY_TRANSFER_OPTIONS);
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
