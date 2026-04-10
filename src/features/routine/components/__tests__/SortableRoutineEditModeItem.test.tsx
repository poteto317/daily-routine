import { createEvent, fireEvent, render, screen } from "@testing-library/react";
import { useSortable } from "@dnd-kit/sortable";
import { SortableRoutineEditModeItem } from "../SortableRoutineEditModeItem";
import type { Routine } from "@/types/routine";

// ---------- dnd-kit モック ----------
jest.mock("@dnd-kit/sortable", () => ({
  useSortable: jest.fn(() => ({
    attributes: { "aria-describedby": "dnd-desc" },
    listeners: { onPointerDown: jest.fn() },
    setNodeRef: jest.fn(),
    transform: null,
    transition: null,
    isDragging: false,
  })),
}));
jest.mock("@dnd-kit/utilities", () => ({
  CSS: { Transform: { toString: jest.fn(() => undefined) } },
}));
// ------------------------------------

// SwipeableRoutineItem を children をそのまま描画するシンプルなラッパーとしてモック
jest.mock("@/components/SwipeableRoutineItem", () => ({
  SwipeableRoutineItem: ({
    children,
  }: {
    children: React.ReactNode;
    onSwipeAction?: () => void;
    swipeActionType?: string;
    isEditMode?: boolean;
  }) => <div data-testid="swipeable-wrapper">{children}</div>,
}));

jest.mock("../helpers", () => ({
  getRoutineCardStyle: jest.fn(() => "mock-card-style"),
  isRoutinePast: jest.fn(() => false),
  getCategoryInfo: jest.fn(() => ({
    emoji: "💪",
    label: "健康",
    color: "bg-green-100 text-green-800",
  })),
  getDurationLabel: jest.fn(() => "30分"),
  getNotificationLabel: jest.fn(() => null),
  getRoutineTitleClassName: jest.fn(() => "mock-title-class"),
  ROUTINE_ITEM_ACTION_BUTTONS_TEXT: {
    editAriaLabel: "編集",
    deleteAriaLabel: "削除",
  },
}));

const routine: Routine = {
  id: "r1",
  title: "朝のストレッチ",
  startTime: "07:00",
  duration: 30,
  category: "health",
  daysOfWeek: [1],
  isCompleted: false,
  sortOrder: 0,
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-01T00:00:00.000Z",
};

describe("SortableRoutineEditModeItem", () => {
  it("ドラッグハンドル（⨿）が aria-label='並び替え' で表示される", () => {
    render(
      <SortableRoutineEditModeItem
        routine={routine}
        onEditAction={jest.fn()}
        onDeleteAction={jest.fn()}
        onSwipeAction={jest.fn()}
        swipeActionType="delete"
      />,
    );
    expect(
      screen.getByRole("button", { name: "並び替え" }),
    ).toBeInTheDocument();
  });

  it("ルーティンタイトルが表示される", () => {
    render(
      <SortableRoutineEditModeItem
        routine={routine}
        onEditAction={jest.fn()}
        onDeleteAction={jest.fn()}
        onSwipeAction={jest.fn()}
        swipeActionType="delete"
      />,
    );
    expect(screen.getByText("朝のストレッチ")).toBeInTheDocument();
  });

  it("編集ボタンをクリックすると onEditAction が呼ばれる", () => {
    const onEditAction = jest.fn();
    render(
      <SortableRoutineEditModeItem
        routine={routine}
        onEditAction={onEditAction}
        onDeleteAction={jest.fn()}
        onSwipeAction={jest.fn()}
        swipeActionType="delete"
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "編集" }));
    expect(onEditAction).toHaveBeenCalledTimes(1);
  });

  it("削除ボタンをクリックすると onDeleteAction が呼ばれる", () => {
    const onDeleteAction = jest.fn();
    render(
      <SortableRoutineEditModeItem
        routine={routine}
        onEditAction={jest.fn()}
        onDeleteAction={onDeleteAction}
        onSwipeAction={jest.fn()}
        swipeActionType="delete"
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "削除" }));
    expect(onDeleteAction).toHaveBeenCalledTimes(1);
  });

  it("SwipeableRoutineItem でラップされている", () => {
    render(
      <SortableRoutineEditModeItem
        routine={routine}
        onEditAction={jest.fn()}
        onDeleteAction={jest.fn()}
        onSwipeAction={jest.fn()}
        swipeActionType="delete"
      />,
    );
    expect(screen.getByTestId("swipeable-wrapper")).toBeInTheDocument();
  });

  it("ドラッグハンドルの touchstart は stopPropagation を呼ぶ（スワイプ検知への伝播防止）", () => {
    render(
      <SortableRoutineEditModeItem
        routine={routine}
        onEditAction={jest.fn()}
        onDeleteAction={jest.fn()}
        onSwipeAction={jest.fn()}
        swipeActionType="delete"
      />,
    );
    const handle = screen.getByRole("button", { name: "並び替え" });
    const event = createEvent.touchStart(handle);
    const stopPropagation = jest.spyOn(event, "stopPropagation");
    fireEvent(handle, event);
    expect(stopPropagation).toHaveBeenCalled();
  });

  it("ドラッグハンドルの mousedown は stopPropagation を呼ぶ（スワイプ検知への伝播防止）", () => {
    render(
      <SortableRoutineEditModeItem
        routine={routine}
        onEditAction={jest.fn()}
        onDeleteAction={jest.fn()}
        onSwipeAction={jest.fn()}
        swipeActionType="delete"
      />,
    );
    const handle = screen.getByRole("button", { name: "並び替え" });
    const event = createEvent.mouseDown(handle);
    const stopPropagation = jest.spyOn(event, "stopPropagation");
    fireEvent(handle, event);
    expect(stopPropagation).toHaveBeenCalled();
  });

  it("isDragging=true のときカードにハイライト枠線クラスが付与される", () => {
    (useSortable as jest.Mock).mockReturnValueOnce({
      attributes: { "aria-describedby": "dnd-desc" },
      listeners: { onPointerDown: jest.fn() },
      setNodeRef: jest.fn(),
      transform: null,
      transition: null,
      isDragging: true,
    });
    render(
      <SortableRoutineEditModeItem
        routine={routine}
        onEditAction={jest.fn()}
        onDeleteAction={jest.fn()}
        onSwipeAction={jest.fn()}
        swipeActionType="delete"
      />,
    );
    // SwipeableRoutineItem モック内の最初の子要素がカード div
    const wrapper = screen.getByTestId("swipeable-wrapper");
    expect(wrapper.firstElementChild).toHaveClass("border-blue-400");
    expect(wrapper.firstElementChild).toHaveClass("shadow-md");
  });

  it("isDragging=false のとき（通常状態）ハイライト枠線クラスが付与されない", () => {
    // useSortable はデフォルトで isDragging=false を返す
    render(
      <SortableRoutineEditModeItem
        routine={routine}
        onEditAction={jest.fn()}
        onDeleteAction={jest.fn()}
        onSwipeAction={jest.fn()}
        swipeActionType="delete"
      />,
    );
    const wrapper = screen.getByTestId("swipeable-wrapper");
    expect(wrapper.firstElementChild).not.toHaveClass("border-blue-400");
  });
});
