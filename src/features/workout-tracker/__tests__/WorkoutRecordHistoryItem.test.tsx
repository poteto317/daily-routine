import { fireEvent, render, screen } from "@testing-library/react";
import type { WorkoutRecord } from "@/types/routine";
import { WorkoutRecordHistoryItem } from "../page/components/WorkoutRecordHistoryItem";
import texts from "../locales/ja.json";

const strengthRecord: WorkoutRecord = {
  id: "1",
  date: "2026-03-01",
  label: "strength",
  exerciseName: "ベンチプレス",
  weightKg: 60,
  reps: 10,
  sets: 3,
  createdAt: "2026-03-01T00:00:00.000Z",
  updatedAt: "2026-03-01T00:00:00.000Z",
};

const runningRecord: WorkoutRecord = {
  id: "2",
  date: "2026-03-01",
  label: "running",
  exerciseName: "朝のジョグ",
  caloriesBurned: 320,
  createdAt: "2026-03-01T00:00:00.000Z",
  updatedAt: "2026-03-01T00:00:00.000Z",
};

describe("WorkoutRecordHistoryItem", () => {
  it("strengthの記録は種目名・重量・回数・セット数を表示する", () => {
    render(
      <WorkoutRecordHistoryItem record={strengthRecord} onDeleteAction={jest.fn()} />,
    );

    expect(screen.getByText(/ベンチプレス/)).toBeInTheDocument();
    expect(screen.getByText("60kg × 10回 × 3セット")).toBeInTheDocument();
  });

  it("runningの記録は種目名・消費カロリーを表示する", () => {
    render(
      <WorkoutRecordHistoryItem record={runningRecord} onDeleteAction={jest.fn()} />,
    );

    expect(screen.getByText(/朝のジョグ/)).toBeInTheDocument();
    expect(screen.getByText("320kcal")).toBeInTheDocument();
  });

  it("削除ボタンをクリックするとonDeleteActionにレコードが渡される", () => {
    const onDeleteAction = jest.fn();
    render(
      <WorkoutRecordHistoryItem record={strengthRecord} onDeleteAction={onDeleteAction} />,
    );

    fireEvent.click(screen.getByRole("button", { name: texts.historyItem.deleteAriaLabel }));

    expect(onDeleteAction).toHaveBeenCalledWith(strengthRecord);
  });
});
