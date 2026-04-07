import { render, screen } from "@testing-library/react";
import { RoutineDragOverlay } from "../RoutineDragOverlay";
import type { Routine } from "@/types/routine";

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

describe("RoutineDragOverlay", () => {
  it("routine が null の場合は何も描画しない", () => {
    const { container } = render(<RoutineDragOverlay routine={null} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("routine が指定された場合はタイトルを表示する", () => {
    render(<RoutineDragOverlay routine={routine} />);
    expect(screen.getByText("朝のストレッチ")).toBeInTheDocument();
  });

  it("routine が指定された場合は startTime を表示する", () => {
    render(<RoutineDragOverlay routine={routine} />);
    expect(screen.getByText("07:00")).toBeInTheDocument();
  });

  it("shadow-xl と opacity-95 クラスが付与される", () => {
    const { container } = render(<RoutineDragOverlay routine={routine} />);
    expect(container.firstChild).toHaveClass("shadow-xl", "opacity-95");
  });
});
