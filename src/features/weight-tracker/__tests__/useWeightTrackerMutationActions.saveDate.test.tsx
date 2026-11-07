import { act, renderHook } from "@testing-library/react";

// 保存の handler まで本物を通し、保存の関数（storage）だけをモックする。
// useWeightTrackerMutationActions.test.tsx は handler を作る関数をモックしているため、
// 保存の関数に渡る日付まで届かない
jest.mock("../storage", () => ({
  deleteWeightRecord: jest.fn(),
  getTodayWeightRecord: jest.fn(() => null),
  getWeightHistory: jest.fn(() => ({})),
  saveWeightRecord: jest.fn(),
}));

import { saveWeightRecord } from "../storage";
import { useWeightTrackerMutationActions } from "../page/useWeightTrackerMutationActions";

const params = {
  weightInput: "65.5",
  notesInput: "",
  setTodayRecord: jest.fn(),
  setWeightInput: jest.fn(),
  setNotesInput: jest.fn(),
  setShowForm: jest.fn(),
  setRecentRecords: jest.fn(),
};

describe("useWeightTrackerMutationActions の保存する日付", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("23:59 に描画し、再描画せずに 0:01 で保存すると、保存を押した時点の新しい日付で保存する", () => {
    jest.useFakeTimers().setSystemTime(new Date("2026-03-07T23:59:00+09:00"));
    const { result } = renderHook(() =>
      useWeightTrackerMutationActions(params),
    );

    // 再描画せずに時計だけを進める（フォームを開いたまま 0 時をまたいだ状態）
    jest.setSystemTime(new Date("2026-03-08T00:01:00+09:00"));
    act(() => {
      result.current.handleSaveWeight();
    });

    expect(saveWeightRecord).toHaveBeenCalledTimes(1);
    expect(saveWeightRecord).toHaveBeenCalledWith(
      "2026-03-08",
      65.5,
      undefined,
    );
  });
});
