import { render, screen } from "@testing-library/react";
import type { Routine } from "@/types/routine";
import { RoutineTimeConflictWarning } from "../RoutineTimeConflictWarning";

const routine: Routine = {
  id: "r1",
  title: "朝食",
  startTime: "07:00",
  duration: 30,
  category: "life",
  daysOfWeek: [1],
  isCompleted: false,
  sortOrder: 0,
  createdAt: "2026-03-07T00:00:00.000Z",
  updatedAt: "2026-03-07T00:00:00.000Z",
};

describe("RoutineTimeConflictWarning", () => {
  it("重複が無ければ何も表示しない", () => {
    const { container } = render(
      <RoutineTimeConflictWarning
        conflictInfo={{ hasConflict: false, conflictingRoutines: [] }}
      />,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it("重複しているルーティンを一覧で表示する", () => {
    render(
      <RoutineTimeConflictWarning
        conflictInfo={{
          hasConflict: true,
          conflictingRoutines: [{ routine, commonDays: [1] }],
        }}
      />,
    );

    expect(screen.getByRole("list")).toBeInTheDocument();
    expect(screen.getByText(/朝食/)).toBeInTheDocument();
  });

  it("重複が複数あれば件数分の項目を出す", () => {
    render(
      <RoutineTimeConflictWarning
        conflictInfo={{
          hasConflict: true,
          conflictingRoutines: [
            { routine, commonDays: [1] },
            {
              routine: { ...routine, id: "r2", title: "運動" },
              commonDays: [2],
            },
          ],
        }}
      />,
    );

    expect(screen.getAllByRole("listitem")).toHaveLength(2);
    expect(screen.getByText(/運動/)).toBeInTheDocument();
  });

  it("重なっている曜日を文言に含める", () => {
    // どの曜日でぶつかっているか分からないと、直しようがない
    render(
      <RoutineTimeConflictWarning
        conflictInfo={{
          hasConflict: true,
          conflictingRoutines: [{ routine, commonDays: [1] }],
        }}
      />,
    );

    expect(screen.getByRole("listitem").textContent).toMatch(/月/);
  });
});
