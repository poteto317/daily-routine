import { act, renderHook } from "@testing-library/react";

jest.mock("../state/dataTransferHelpers", () => ({
  createExportData: jest.fn(() => ({ exported: true })),
}));
jest.mock("../state/exportFileDownload", () => ({
  downloadExportData: jest.fn(),
}));

import { downloadExportData } from "../state/exportFileDownload";
import { ALL_TRANSFER_OPTIONS } from "../state/constants";
import { useExportTransferAction } from "../state/useExportTransferAction";

describe("useExportTransferAction", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("エクスポート成功後に success を設定して idle に戻す", () => {
    const setExportStatus = jest.fn();
    const { result } = renderHook(() =>
      useExportTransferAction({
        exportOptions: ALL_TRANSFER_OPTIONS,
        setExportStatus,
      }),
    );

    act(() => {
      result.current();
    });

    expect(downloadExportData).toHaveBeenCalled();
    expect(setExportStatus).toHaveBeenCalledWith("success");

    act(() => {
      jest.advanceTimersByTime(3000);
    });

    expect(setExportStatus).toHaveBeenCalledWith("idle");
  });

  it("エクスポート失敗時に error を設定して idle に戻す", () => {
    (downloadExportData as jest.Mock).mockImplementationOnce(() => {
      throw new Error("failed");
    });
    const setExportStatus = jest.fn();
    const { result } = renderHook(() =>
      useExportTransferAction({
        exportOptions: ALL_TRANSFER_OPTIONS,
        setExportStatus,
      }),
    );

    act(() => {
      result.current();
    });

    expect(setExportStatus).toHaveBeenCalledWith("error");

    act(() => {
      jest.advanceTimersByTime(3000);
    });

    expect(setExportStatus).toHaveBeenCalledWith("idle");
  });
});
