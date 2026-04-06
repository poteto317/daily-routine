import { fireEvent, render, screen } from "@testing-library/react";
import { SortableRoutineNormalDragItem } from "../SortableRoutineNormalDragItem";
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

describe("SortableRoutineNormalDragItem", () => {
  it("ドラッグハンドル（⨿）が aria-label='並び替え' で表示される", () => {
    render(
      <SortableRoutineNormalDragItem
        routine={routine}
        onToggleAction={jest.fn()}
        isDragActive={false}
      />,
    );
    expect(
      screen.getByRole("button", { name: "並び替え" }),
    ).toBeInTheDocument();
  });

  it("ルーティンタイトルが表示される", () => {
    render(
      <SortableRoutineNormalDragItem
        routine={routine}
        onToggleAction={jest.fn()}
        isDragActive={false}
      />,
    );
    expect(screen.getByText("朝のストレッチ")).toBeInTheDocument();
  });

  it("isDragActive=false のときカードをクリックすると onToggleAction が呼ばれる", () => {
    const onToggleAction = jest.fn();
    render(
      <SortableRoutineNormalDragItem
        routine={routine}
        onToggleAction={onToggleAction}
        isDragActive={false}
      />,
    );
    fireEvent.click(screen.getByText("朝のストレッチ").closest("div")!);
    expect(onToggleAction).toHaveBeenCalledWith("r1");
  });

  it("isDragActive=true のときカードをクリックしても onToggleAction は呼ばれない", () => {
    const onToggleAction = jest.fn();
    render(
      <SortableRoutineNormalDragItem
        routine={routine}
        onToggleAction={onToggleAction}
        isDragActive={true}
      />,
    );
    fireEvent.click(screen.getByText("朝のストレッチ").closest("div")!);
    expect(onToggleAction).not.toHaveBeenCalled();
  });

  it("ドラッグハンドルをクリックしても親の onClick イベントに伝播しない（stopPropagation）", () => {
    const onToggleAction = jest.fn();
    render(
      <SortableRoutineNormalDragItem
        routine={routine}
        onToggleAction={onToggleAction}
        isDragActive={false}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "並び替え" }));
    expect(onToggleAction).not.toHaveBeenCalled();
  });
});
