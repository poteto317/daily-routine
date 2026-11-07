import { act, renderHook } from "@testing-library/react";

// 追加の handler まで本物を通し、保存の関数（storage）だけをモックする。
// useMealAddAction.test.tsx は handler を作る関数をモックしているため、
// 保存の関数に渡る日付まで届かない
jest.mock("../storage", () => ({
  addMealRecord: jest.fn(),
  getMealHistory: jest.fn(() => ({})),
  getTodayMealRecords: jest.fn(() => []),
}));

import { addMealRecord } from "../storage";
import { useMealAddAction } from "../useMealAddAction";

const params = {
  mealTypeInput: "dinner" as const,
  timeInput: "23:58",
  descriptionInput: "soba",
  notesInput: "",
  setTodayMeals: jest.fn(),
  setRecentMeals: jest.fn(),
  setShowForm: jest.fn(),
  setDescriptionInput: jest.fn(),
  setNotesInput: jest.fn(),
};

describe("useMealAddAction の保存する日付", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("23:59 に描画し、再描画せずに 0:01 で保存すると、保存を押した時点の新しい日付で保存する", () => {
    jest.useFakeTimers().setSystemTime(new Date("2026-03-07T23:59:00+09:00"));
    const { result } = renderHook(() => useMealAddAction(params));

    // 再描画せずに時計だけを進める（フォームを開いたまま 0 時をまたいだ状態）
    jest.setSystemTime(new Date("2026-03-08T00:01:00+09:00"));
    act(() => {
      result.current();
    });

    expect(addMealRecord).toHaveBeenCalledTimes(1);
    expect(addMealRecord).toHaveBeenCalledWith(
      "2026-03-08",
      "dinner",
      "23:58",
      "soba",
      { notes: undefined },
    );
  });
});
