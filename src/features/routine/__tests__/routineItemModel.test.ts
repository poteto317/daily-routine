import type { Routine } from "@/types/routine";
import {
  createRoutineItemHandlers,
  getRoutineItemCardClassName,
} from "../components/routineItemModel";

jest.mock("../helpers", () => ({
  createSwipeHandler: jest.fn(() => jest.fn()),
  getRoutineCardStyle: jest.fn(() => "mock-style"),
  isRoutinePast: jest.fn(() => false),
}));

describe("routineItemModel", () => {
  const routine: Routine = {
    id: "r1",
    title: "朝活",
    startTime: "08:00",
    duration: 30,
    category: "health",
    daysOfWeek: [1],
    isCompleted: false,
    sortOrder: 0,
    createdAt: "2026-02-13T00:00:00.000Z",
    updatedAt: "2026-02-13T00:00:00.000Z",
  };

  it("表示モード時のカードクリックでonToggleを呼ぶ", () => {
    const onToggle = jest.fn();
    const handlers = createRoutineItemHandlers(
      routine,
      {
        onToggle,
        onEdit: jest.fn(),
        onDelete: jest.fn(),
      },
      false,
    );

    handlers.handleCardClick();
    expect(onToggle).toHaveBeenCalledWith("r1");
  });

  it("編集モード時のカードクリックではonToggleを呼ばない", () => {
    const onToggle = jest.fn();
    const handlers = createRoutineItemHandlers(
      routine,
      {
        onToggle,
        onEdit: jest.fn(),
        onDelete: jest.fn(),
      },
      true,
    );

    handlers.handleCardClick();
    expect(onToggle).not.toHaveBeenCalled();
  });

  it("isDraggableとisEditModeに応じたカードclassを返す", () => {
    expect(
      getRoutineItemCardClassName({
        routine,
        isEditMode: false,
        isDraggable: false,
      }),
    ).toContain("cursor-pointer");

    expect(
      getRoutineItemCardClassName({
        routine,
        isEditMode: true,
        isDraggable: true,
      }),
    ).toContain("cursor-grab");

    expect(
      getRoutineItemCardClassName({
        routine,
        isEditMode: true,
        isDraggable: false,
      }),
    ).toContain("mock-style");
  });
});
