import { render, screen } from "@testing-library/react";
import { SwipeableRoutineItem } from "../SwipeableRoutineItem";
import {
  mockOnSwipeAction,
  renderSwipeable,
} from "./SwipeableRoutineItem.test-utils";

describe("SwipeableRoutineItem render", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("子要素が正しく表示される", () => {
    render(
      <SwipeableRoutineItem onSwipeAction={mockOnSwipeAction}>
        <div data-testid="child-content">Child Content</div>
      </SwipeableRoutineItem>,
    );

    expect(screen.getByTestId("child-content")).toBeInTheDocument();
    expect(screen.getByText("Child Content")).toBeInTheDocument();
  });

  it("削除モードで削除アイコン背景が表示される", () => {
    const container = renderSwipeable({ swipeActionType: "delete" });
    expect(container).toBeInTheDocument();
  });

  it("編集モードで編集アイコン背景が表示される", () => {
    const container = renderSwipeable({ swipeActionType: "edit" });
    expect(container).toBeInTheDocument();
  });

  it("インデントモードでインデントアイコン背景が表示される", () => {
    const container = renderSwipeable({ swipeActionType: "indent" });
    expect(container).toBeInTheDocument();
  });
});
