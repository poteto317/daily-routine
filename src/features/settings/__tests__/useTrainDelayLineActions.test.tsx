import { act, renderHook } from "@testing-library/react";

jest.mock("../state/trainDelayStateActions", () => ({
  addTrainDelayLine: jest.fn(),
  removeTrainDelayLine: jest.fn(),
}));

jest.mock("../state/trainDelayLineActionsResult", () => ({
  createTrainDelayLineActionsResult: jest.fn(),
}));

import {
  addTrainDelayLine,
  removeTrainDelayLine,
} from "../state/trainDelayStateActions";
import { createTrainDelayLineActionsResult } from "../state/trainDelayLineActionsResult";
import { useTrainDelayLineActions } from "../state/useTrainDelayLineActions";

describe("useTrainDelayLineActions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("追加成功時に monitoredLines と input を更新する", () => {
    const setMonitoredLines = jest.fn();
    const setSelectedLineInput = jest.fn();
    const nextMonitoredLines = [
      { lineId: "yamanote", lineName: "山手線", company: "JR東日本" },
    ];
    const resultShape = {
      handleAddLine: jest.fn(),
      handleRemoveLine: jest.fn(),
      composed: true,
    };
    (addTrainDelayLine as jest.Mock).mockReturnValue({
      added: true,
      nextMonitoredLines,
      nextSelectedLineInput: "",
    });
    (createTrainDelayLineActionsResult as jest.Mock).mockReturnValue(
      resultShape,
    );

    const { result } = renderHook(() =>
      useTrainDelayLineActions({
        selectedLineInput: "yamanote",
        monitoredLines: [],
        setMonitoredLines,
        setSelectedLineInput,
      }),
    );

    expect(result.current).toBe(resultShape);
    expect(createTrainDelayLineActionsResult).toHaveBeenCalledWith({
      handleAddLine: expect.any(Function),
      handleRemoveLine: expect.any(Function),
    });

    const builtHandleAddLine = (createTrainDelayLineActionsResult as jest.Mock)
      .mock.calls[0][0].handleAddLine as () => void;

    act(() => {
      builtHandleAddLine();
    });

    expect(addTrainDelayLine).toHaveBeenCalledWith(
      expect.objectContaining({
        selectedLineInput: "yamanote",
        monitoredLines: [],
      }),
    );
    expect(setMonitoredLines).toHaveBeenCalledWith(nextMonitoredLines);
    expect(setSelectedLineInput).toHaveBeenCalledWith("");
  });

  it("追加失敗時は state を更新しない", () => {
    const setMonitoredLines = jest.fn();
    const setSelectedLineInput = jest.fn();
    (addTrainDelayLine as jest.Mock).mockReturnValue({
      added: false,
      nextMonitoredLines: [],
      nextSelectedLineInput: "yamanote",
    });
    (createTrainDelayLineActionsResult as jest.Mock).mockReturnValue({
      handleAddLine: jest.fn(),
      handleRemoveLine: jest.fn(),
    });

    renderHook(() =>
      useTrainDelayLineActions({
        selectedLineInput: "yamanote",
        monitoredLines: [],
        setMonitoredLines,
        setSelectedLineInput,
      }),
    );

    const builtHandleAddLine = (createTrainDelayLineActionsResult as jest.Mock)
      .mock.calls[0][0].handleAddLine as () => void;

    act(() => {
      builtHandleAddLine();
    });

    expect(setMonitoredLines).not.toHaveBeenCalled();
    expect(setSelectedLineInput).not.toHaveBeenCalled();
  });

  it("削除時は remove helper の結果で monitoredLines を更新する", () => {
    const setMonitoredLines = jest.fn();
    const monitoredLines = [
      { lineId: "yamanote", lineName: "山手線", company: "JR東日本" },
    ];
    (removeTrainDelayLine as jest.Mock).mockReturnValue([]);
    (createTrainDelayLineActionsResult as jest.Mock).mockReturnValue({
      handleAddLine: jest.fn(),
      handleRemoveLine: jest.fn(),
    });

    renderHook(() =>
      useTrainDelayLineActions({
        selectedLineInput: "",
        monitoredLines,
        setMonitoredLines,
        setSelectedLineInput: jest.fn(),
      }),
    );

    const builtHandleRemoveLine = (
      createTrainDelayLineActionsResult as jest.Mock
    ).mock.calls[0][0].handleRemoveLine as (lineId: string) => void;

    act(() => {
      builtHandleRemoveLine("yamanote");
    });

    expect(removeTrainDelayLine).toHaveBeenCalledWith(
      monitoredLines,
      "yamanote",
    );
    expect(setMonitoredLines).toHaveBeenCalledWith([]);
  });
});
