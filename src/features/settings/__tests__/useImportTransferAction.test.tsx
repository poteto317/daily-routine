import { act, renderHook } from "@testing-library/react";

jest.mock("../state/dataTransferHelpers", () => ({
  getSelectedTypeLabels: jest.fn(() => ["設定"]),
  importSelectedData: jest.fn(),
}));

import {
  getSelectedTypeLabels,
  importSelectedData,
} from "../state/dataTransferHelpers";
import { ALL_TRANSFER_OPTIONS } from "../state/constants";
import { useImportTransferAction } from "../state/useImportTransferAction";
import { EMPTY_TRANSFER_OPTIONS } from "../state/constants";

describe("useImportTransferAction", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    jest.spyOn(window, "confirm").mockReturnValue(true);
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it("成功時に success を設定して input をクリアする", async () => {
    const setImportStatus = jest.fn();
    const { result } = renderHook(() =>
      useImportTransferAction({
        importOptions: ALL_TRANSFER_OPTIONS,
        setImportStatus,
      }),
    );
    const target = {
      files: [
        {
          text: jest.fn().mockResolvedValue('{"settings":{}}'),
        },
      ],
      value: "import.json",
    };

    await act(async () => {
      await result.current({ target } as never);
    });

    expect(importSelectedData).toHaveBeenCalledWith(
      { settings: {} },
      ALL_TRANSFER_OPTIONS,
    );
    expect(setImportStatus).toHaveBeenCalledWith("success");
    expect(target.value).toBe("");
  });

  it("失敗時に error を設定し、後で idle に戻す", async () => {
    const setImportStatus = jest.fn();
    const { result } = renderHook(() =>
      useImportTransferAction({
        importOptions: ALL_TRANSFER_OPTIONS,
        setImportStatus,
      }),
    );
    const target = {
      files: [
        {
          text: jest.fn().mockResolvedValue("not-json"),
        },
      ],
      value: "import.json",
    };

    await act(async () => {
      await result.current({ target } as never);
    });

    expect(setImportStatus).toHaveBeenCalledWith("error");
    expect(target.value).toBe("");

    act(() => {
      jest.advanceTimersByTime(3000);
    });

    expect(setImportStatus).toHaveBeenCalledWith("idle");
  });

  it("選択項目がないときは alert して import しない", async () => {
    const alertSpy = jest.spyOn(window, "alert").mockImplementation(() => {});
    const setImportStatus = jest.fn();
    (getSelectedTypeLabels as jest.Mock).mockReturnValueOnce([]);
    const { result } = renderHook(() =>
      useImportTransferAction({
        importOptions: EMPTY_TRANSFER_OPTIONS,
        setImportStatus,
      }),
    );
    const target = {
      files: [
        {
          text: jest.fn().mockResolvedValue('{"settings":{}}'),
        },
      ],
      value: "import.json",
    };

    await act(async () => {
      await result.current({ target } as never);
    });

    expect(alertSpy).toHaveBeenCalled();
    expect(importSelectedData).not.toHaveBeenCalled();
    expect(setImportStatus).not.toHaveBeenCalled();
    expect(target.value).toBe("");
  });
});
