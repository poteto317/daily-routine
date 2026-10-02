import { render, screen } from "@testing-library/react";
import { RoutineList } from "../RoutineList";
import { type Routine } from "@/types/routine";

jest.mock("../RoutineEmptyState", () => ({
  RoutineEmptyState: () => <div data-testid="empty-state">空状態</div>,
}));

jest.mock("../DraggableRoutineList", () => ({
  DraggableRoutineList: ({ routines }: { routines: Routine[] }) => (
    <div data-testid="draggable-list">ルーティン数: {routines.length}</div>
  ),
}));

describe("RoutineList", () => {
  const sampleRoutine: Routine = {
    id: "r-1",
    title: "朝のストレッチ",
    category: "health",
    startTime: "07:00",
    duration: 15,
    daysOfWeek: [1, 2, 3, 4, 5],
    isCompleted: false,
    sortOrder: 0,
    createdAt: "2026-03-01T00:00:00Z",
    updatedAt: "2026-03-01T00:00:00Z",
  };

  const defaultProps = {
    sortedRoutines: [sampleRoutine],
    allRoutinesCount: 1,
    displayRoutinesCount: 1,
    isEditMode: false,
    onToggleAction: jest.fn(),
    onEditAction: jest.fn(),
    onDeleteAction: jest.fn(),
    onAddRoutineAction: jest.fn(),
    onReorderAction: jest.fn(),
    viewMode: 1,
  };

  it("ルーティンが存在する場合は DraggableRoutineList をレンダリングする", () => {
    render(<RoutineList {...defaultProps} />);

    expect(screen.getByTestId("draggable-list")).toBeInTheDocument();
    expect(screen.queryByTestId("empty-state")).not.toBeInTheDocument();
  });

  it("ルーティンが 0 件の場合は RoutineEmptyState をレンダリングする", () => {
    render(
      <RoutineList
        {...defaultProps}
        sortedRoutines={[]}
        displayRoutinesCount={0}
      />,
    );

    expect(screen.getByTestId("empty-state")).toBeInTheDocument();
    expect(screen.queryByTestId("draggable-list")).not.toBeInTheDocument();
  });
});
