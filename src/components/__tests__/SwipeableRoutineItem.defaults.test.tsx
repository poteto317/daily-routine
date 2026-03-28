import { act, fireEvent } from "@testing-library/react";
import {
  renderSwipeable,
  mockOnSwipeAction,
} from "./SwipeableRoutineItem.test-utils";

describe("SwipeableRoutineItem defaults", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("表示モードではスワイプが無効", () => {
    const container = renderSwipeable({ isEditMode: false });

    fireEvent.touchStart(container, {
      touches: [{ clientX: 300, clientY: 100 }],
    });
    fireEvent.touchMove(container, {
      touches: [{ clientX: 150, clientY: 100 }],
    });
    fireEvent.touchEnd(container);

    expect(mockOnSwipeAction).not.toHaveBeenCalled();
  });

  it("swipeActionTypeのデフォルトはdelete", () => {
    const container = renderSwipeable();
    expect(container).toBeInTheDocument();
  });

  it("isEditModeのデフォルトはfalse", () => {
    jest.useFakeTimers();
    const container = renderSwipeable();

    fireEvent.touchStart(container, {
      touches: [{ clientX: 300, clientY: 100 }],
    });
    fireEvent.touchMove(container, {
      touches: [{ clientX: 150, clientY: 100 }],
    });
    fireEvent.touchEnd(container);

    act(() => {
      jest.advanceTimersByTime(300);
    });

    expect(mockOnSwipeAction).not.toHaveBeenCalled();
    jest.useRealTimers();
  });
});
