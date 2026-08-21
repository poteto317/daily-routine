import "./RoutineItem.test.setup";
import { render, screen } from "@testing-library/react";
import { RoutineItem } from "../components/RoutineItem";
import {
  mockOnDelete,
  mockOnEdit,
  mockOnToggle,
  mockRoutine,
  resetRoutineItemMocks,
} from "./RoutineItem.test.setup";

describe("RoutineItem render", () => {
  beforeEach(resetRoutineItemMocks);

  it("ルーティン情報を表示する", () => {
    render(
      <RoutineItem
        routine={mockRoutine}
        onToggle={mockOnToggle}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />,
    );
    expect(screen.getByText("テストルーティン")).toBeInTheDocument();
    expect(screen.getByText("09:00")).toBeInTheDocument();
    expect(screen.getByText("これはテストです")).toBeInTheDocument();
    expect(screen.getByText(/10分後に通知/)).toBeInTheDocument();
  });

  it("完了済みは取り消し線、通知未設定は通知文なし", () => {
    const { rerender } = render(
      <RoutineItem
        routine={{ ...mockRoutine, isCompleted: true }}
        onToggle={mockOnToggle}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />,
    );
    expect(screen.getByText("テストルーティン")).toHaveClass("line-through");

    rerender(
      <RoutineItem
        routine={{ ...mockRoutine, notificationMinutes: undefined }}
        onToggle={mockOnToggle}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />,
    );
    expect(screen.queryByText(/分後に通知/)).not.toBeInTheDocument();
  });

  it("週間目標があれば週あたりの回数を表示する", () => {
    render(
      <RoutineItem
        routine={{
          ...mockRoutine,
          weeklyGoal: {
            targetPerWeek: 3,
            startedAt: "2026-08-22T00:00:00.000Z",
          },
        }}
        onToggle={mockOnToggle}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />,
    );

    expect(screen.getByText("週3回")).toBeInTheDocument();
  });

  it.each([
    {
      weeklyGoal: {
        targetPerWeek: 0,
        startedAt: "2026-08-22T00:00:00.000Z",
      },
      label: "週0回",
    },
    {
      weeklyGoal: { targetPerWeek: 3, startedAt: "invalid-date" },
      label: "週3回",
    },
  ])("不正な週間目標はバッジを表示しない", ({ weeklyGoal, label }) => {
    render(
      <RoutineItem
        routine={{ ...mockRoutine, weeklyGoal }}
        onToggle={mockOnToggle}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />,
    );

    expect(screen.queryByText(label)).not.toBeInTheDocument();
  });
});
