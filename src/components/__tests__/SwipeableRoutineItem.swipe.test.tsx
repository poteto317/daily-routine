import { act, fireEvent } from "@testing-library/react";
import {
  mockOnSwipeAction,
  renderSwipeable,
  triggerSwipe,
} from "./SwipeableRoutineItem.test-utils";

describe("SwipeableRoutineItem swipe", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("編集モードでマウスダウンが機能する", () => {
    const container = renderSwipeable({ isEditMode: true });
    fireEvent.mouseDown(container, { clientX: 300 });
  });

  it("編集モードでタッチイベントが機能する", () => {
    const container = renderSwipeable({ isEditMode: true });
    fireEvent.touchStart(container, {
      touches: [{ clientX: 300, clientY: 100 }],
    });
  });

  it("十分なスワイプでonSwipeActionが呼ばれる", () => {
    jest.useFakeTimers();
    const container = renderSwipeable({ isEditMode: true });

    triggerSwipe(container, 300, 150);

    act(() => {
      jest.advanceTimersByTime(300);
    });

    expect(mockOnSwipeAction).toHaveBeenCalled();
    jest.useRealTimers();
  });

  it("スワイプが閾値未満の場合は元に戻る", () => {
    const container = renderSwipeable({ isEditMode: true });
    triggerSwipe(container, 300, 280);
    expect(mockOnSwipeAction).not.toHaveBeenCalled();
  });

  it("左へのスワイプのみ許可（右スワイプは無効）", () => {
    const container = renderSwipeable({ isEditMode: true });
    triggerSwipe(container, 100, 300);
    expect(mockOnSwipeAction).not.toHaveBeenCalled();
  });
});
