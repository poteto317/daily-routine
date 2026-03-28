import { fireEvent, render, screen } from "@testing-library/react";
import { SwipeableRoutineItem } from "../SwipeableRoutineItem";

export const mockOnSwipeAction = jest.fn();

export const renderSwipeable = (
  props?: Partial<{
    swipeActionType: "delete" | "edit" | "indent";
    isEditMode: boolean;
    childText: string;
    childTestId: string;
  }>,
) => {
  const childText = props?.childText ?? "Content";
  const childTestId = props?.childTestId ?? "swipeable";

  render(
    <SwipeableRoutineItem
      onSwipeAction={mockOnSwipeAction}
      swipeActionType={props?.swipeActionType}
      isEditMode={props?.isEditMode}
    >
      <div data-testid={childTestId}>{childText}</div>
    </SwipeableRoutineItem>,
  );

  return screen.getByTestId(childTestId).closest(".relative") as HTMLElement;
};

export const triggerSwipe = (
  container: HTMLElement,
  startX: number,
  moveX: number,
) => {
  fireEvent.touchStart(container, {
    touches: [{ clientX: startX, clientY: 100 }],
  });
  fireEvent.touchMove(container, {
    touches: [{ clientX: moveX, clientY: 100 }],
  });
  fireEvent.touchEnd(container);
};
