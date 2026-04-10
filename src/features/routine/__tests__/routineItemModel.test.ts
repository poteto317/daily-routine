import type { Routine } from "@/types/routine";
import { isRoutinePast } from "../helpers";
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

  it("isDragging=true のときハイライト枠線クラスを返す", () => {
    const className = getRoutineItemCardClassName({
      routine,
      isEditMode: false,
      isDraggable: false,
      isDragging: true,
    });
    expect(className).toContain("border-blue-400");
    expect(className).toContain("shadow-md");
    // cursor-pointer / cursor-grab は含まれない
    expect(className).not.toContain("cursor-pointer");
    expect(className).not.toContain("cursor-grab");
  });

  it("isDragging=true かつ isCompleted=true のとき完了背景色（bg-green-50）を使う", () => {
    const completedRoutine: Routine = { ...routine, isCompleted: true };
    const className = getRoutineItemCardClassName({
      routine: completedRoutine,
      isEditMode: false,
      isDraggable: false,
      isDragging: true,
    });
    expect(className).toContain("bg-green-50");
    expect(className).toContain("border-blue-400");
  });

  it("isDragging=true かつ isPast=true のとき過去背景色（bg-yellow-50）を使う", () => {
    (isRoutinePast as jest.Mock).mockReturnValueOnce(true);
    const className = getRoutineItemCardClassName({
      routine,
      isEditMode: false,
      isDraggable: false,
      isDragging: true,
    });
    expect(className).toContain("bg-yellow-50");
    expect(className).toContain("border-blue-400");
  });
});
