import { render, screen } from "@testing-library/react";
import type { Routine } from "@/types/routine";
import { PresetSourceRoutinePreview } from "../components/PresetSourceRoutinePreview";

const routine: Routine = {
  id: "routine-1",
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

describe("PresetSourceRoutinePreview", () => {
  it("選択曜日のルーティンを操作要素なしで表示する", () => {
    render(
      <PresetSourceRoutinePreview
        routines={[routine]}
        emptyLabel="ルーティンがありません"
      />,
    );

    expect(screen.getByText(/朝食/)).toBeInTheDocument();
    expect(screen.getByText("07:00")).toBeInTheDocument();
    expect(screen.queryByRole("checkbox")).not.toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("対象ルーティンがなければ空表示文言を返す", () => {
    render(
      <PresetSourceRoutinePreview
        routines={[]}
        emptyLabel="ルーティンがありません"
      />,
    );

    expect(screen.getByText("ルーティンがありません")).toBeInTheDocument();
  });
});
