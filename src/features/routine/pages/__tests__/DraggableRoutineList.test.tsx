import { render, screen } from "@testing-library/react";
import type { Routine } from "@/types/routine";

// ---------- useSensor スパイ用モック ----------
const mockUseSensor = jest.fn((sensor: unknown) => sensor);
const mockUseSensors = jest.fn();

jest.mock("@dnd-kit/core", () => ({
  DndContext: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  closestCenter: {},
  DragOverlay: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  KeyboardSensor: class KeyboardSensor {},
  PointerSensor: class PointerSensor {},
  TouchSensor: class TouchSensor {},
  useSensor: (sensor: unknown) => mockUseSensor(sensor),
  useSensors: (...args: unknown[]) => mockUseSensors(args),
}));

jest.mock("@dnd-kit/sortable", () => ({
  SortableContext: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
  sortableKeyboardCoordinates: {},
  verticalListSortingStrategy: {},
}));

jest.mock("@/features/routine", () => ({
  SortableRoutineItem: ({ routine }: { routine: Routine }) => (
    <div data-testid={`sortable-item-${routine.id}`}>{routine.title}</div>
  ),
}));

jest.mock(
  "@/features/routine/components/SortableRoutineNormalDragItem",
  () => ({
    SortableRoutineNormalDragItem: ({ routine }: { routine: Routine }) => (
      <div data-testid={`normal-item-${routine.id}`}>{routine.title}</div>
    ),
  }),
);

jest.mock("@/features/routine/components/RoutineDragOverlay", () => ({
  RoutineDragOverlay: () => null,
}));

jest.mock("../useRoutineDragState", () => ({
  useRoutineDragState: () => ({
    activeId: null,
    activeRoutine: null,
    handleDragStart: jest.fn(),
    handleDragEnd: jest.fn(),
    handleDragCancel: jest.fn(),
  }),
}));
// -----------------------------------------------

import { DraggableRoutineList } from "../DraggableRoutineList";

const makeRoutine = (id: string): Routine => ({
  id,
  title: `Routine ${id}`,
  startTime: "07:00",
  duration: 30,
  category: "other",
  daysOfWeek: [1],
  isCompleted: false,
  sortOrder: 0,
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-01T00:00:00.000Z",
});

const defaultProps = {
  routines: [makeRoutine("a"), makeRoutine("b")],
  isEditMode: false,
  onToggleAction: jest.fn(),
  onEditAction: jest.fn(),
  onDeleteAction: jest.fn(),
  onReorderAction: jest.fn(),
};

describe("DraggableRoutineList", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("通常モードで SortableRoutineNormalDragItem が表示される", () => {
    render(<DraggableRoutineList {...defaultProps} />);
    expect(screen.getByTestId("normal-item-a")).toBeInTheDocument();
    expect(screen.getByTestId("normal-item-b")).toBeInTheDocument();
  });

  it("編集モードで SortableRoutineItem が表示される", () => {
    render(<DraggableRoutineList {...defaultProps} isEditMode={true} />);
    expect(screen.getByTestId("sortable-item-a")).toBeInTheDocument();
    expect(screen.getByTestId("sortable-item-b")).toBeInTheDocument();
  });

  it("useSensor が PointerSensor・TouchSensor・KeyboardSensor の 3 つで呼ばれる", () => {
    render(<DraggableRoutineList {...defaultProps} />);
    // PointerSensor + TouchSensor + KeyboardSensor の 3 センサーが設定されていることを確認
    expect(mockUseSensor).toHaveBeenCalledTimes(3);
  });
});
