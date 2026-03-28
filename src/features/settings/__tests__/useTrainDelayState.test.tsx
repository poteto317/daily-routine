import { act, renderHook } from "@testing-library/react";

jest.mock("@/features/settings/storage", () => ({
  getSettings: jest.fn(),
}));

jest.mock("../state/trainDelayStateResult", () => ({
  createTrainDelayStateResult: jest.fn(),
}));

import { getSettings } from "@/features/settings/storage";
import { createTrainDelayStateResult } from "../state/trainDelayStateResult";
import { useTrainDelayState } from "../state/useTrainDelayState";

describe("useTrainDelayState", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (createTrainDelayStateResult as jest.Mock).mockImplementation((args) => ({
      trainDelayEnabled: args.trainDelayEnabled,
      setTrainDelayEnabled: args.setTrainDelayEnabled,
      selectedLineInput: args.selectedLineInput,
      setSelectedLineInput: args.setSelectedLineInput,
      monitoredLines: args.monitoredLines,
      handleAddLine: args.handleAddLine,
      handleRemoveLine: args.handleRemoveLine,
      availableLines: args.availableLines,
    }));
    (getSettings as jest.Mock).mockReturnValue({
      defaultDurationMinutes: 30,
      defaultNotificationMinutes: 0,
      theme: "light",
      swipeAction: "delete",
      pomodoroFocusMinutes: 25,
      pomodoroBreakMinutes: 5,
      trainDelay: {
        enabled: false,
        monitoredLines: [],
      },
    });
  });

  it("初期値をsettingsから読み込む", () => {
    (getSettings as jest.Mock).mockReturnValue({
      defaultDurationMinutes: 30,
      defaultNotificationMinutes: 0,
      theme: "light",
      swipeAction: "delete",
      pomodoroFocusMinutes: 25,
      pomodoroBreakMinutes: 5,
      trainDelay: {
        enabled: true,
        monitoredLines: [
          {
            lineId: "yamanote",
            lineName: "山手線",
            company: "JR東日本",
          },
        ],
      },
    });

    const { result } = renderHook(() => useTrainDelayState());

    expect(result.current.trainDelayEnabled).toBe(true);
    expect(result.current.monitoredLines).toEqual([
      {
        lineId: "yamanote",
        lineName: "山手線",
        company: "JR東日本",
      },
    ]);
    expect(createTrainDelayStateResult).toHaveBeenCalledWith(
      expect.objectContaining({
        trainDelayEnabled: true,
        monitoredLines: [
          {
            lineId: "yamanote",
            lineName: "山手線",
            company: "JR東日本",
          },
        ],
      }),
    );
  });

  it("路線追加で監視対象に入り入力が空になる", () => {
    const { result } = renderHook(() => useTrainDelayState());

    act(() => {
      result.current.setSelectedLineInput("yamanote");
    });

    act(() => {
      result.current.handleAddLine();
    });

    expect(result.current.monitoredLines).toEqual([
      {
        lineId: "yamanote",
        lineName: "山手線",
        company: "JR東日本",
      },
    ]);
    expect(result.current.selectedLineInput).toBe("");
    expect(createTrainDelayStateResult).toHaveBeenLastCalledWith(
      expect.objectContaining({
        monitoredLines: [
          {
            lineId: "yamanote",
            lineName: "山手線",
            company: "JR東日本",
          },
        ],
        selectedLineInput: "",
      }),
    );
  });

  it("重複路線追加時は alert して追加しない", () => {
    const alertSpy = jest.spyOn(window, "alert").mockImplementation(() => {});
    (getSettings as jest.Mock).mockReturnValue({
      defaultDurationMinutes: 30,
      defaultNotificationMinutes: 0,
      theme: "light",
      swipeAction: "delete",
      pomodoroFocusMinutes: 25,
      pomodoroBreakMinutes: 5,
      trainDelay: {
        enabled: false,
        monitoredLines: [
          {
            lineId: "yamanote",
            lineName: "山手線",
            company: "JR東日本",
          },
        ],
      },
    });

    const { result } = renderHook(() => useTrainDelayState());

    act(() => {
      result.current.setSelectedLineInput("yamanote");
    });

    act(() => {
      result.current.handleAddLine();
    });

    expect(alertSpy).toHaveBeenCalled();
    expect(result.current.monitoredLines).toHaveLength(1);
    alertSpy.mockRestore();
  });

  it("未選択なら何も追加しない", () => {
    const { result } = renderHook(() => useTrainDelayState());

    act(() => {
      result.current.handleAddLine();
    });

    expect(result.current.monitoredLines).toEqual([]);
    expect(result.current.selectedLineInput).toBe("");
  });

  it("路線を削除できる", () => {
    (getSettings as jest.Mock).mockReturnValue({
      defaultDurationMinutes: 30,
      defaultNotificationMinutes: 0,
      theme: "light",
      swipeAction: "delete",
      pomodoroFocusMinutes: 25,
      pomodoroBreakMinutes: 5,
      trainDelay: {
        enabled: false,
        monitoredLines: [
          {
            lineId: "yamanote",
            lineName: "山手線",
            company: "JR東日本",
          },
        ],
      },
    });

    const { result } = renderHook(() => useTrainDelayState());

    act(() => {
      result.current.handleRemoveLine("yamanote");
    });

    expect(result.current.monitoredLines).toEqual([]);
    expect(createTrainDelayStateResult).toHaveBeenLastCalledWith(
      expect.objectContaining({ monitoredLines: [] }),
    );
  });
});
