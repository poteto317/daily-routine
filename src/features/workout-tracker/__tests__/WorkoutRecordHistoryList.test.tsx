import { fireEvent, render, screen } from "@testing-library/react";
import type { WorkoutRecord } from "@/types/routine";
import { WorkoutRecordHistoryList } from "../page/components/WorkoutRecordHistoryList";
import texts from "../locales/ja.json";

const record: WorkoutRecord = {
  id: "1",
  date: "2026-03-01",
  label: "strength",
  exerciseName: "ベンチプレス",
  weightKg: 60,
  reps: 10,
  createdAt: "2026-03-01T00:00:00.000Z",
  updatedAt: "2026-03-01T00:00:00.000Z",
};

describe("WorkoutRecordHistoryList", () => {
  it("グループが空なら空メッセージを表示する", () => {
    render(<WorkoutRecordHistoryList groups={[]} onDeleteRecordAction={jest.fn()} />);

    expect(screen.getByText(texts.historyList.empty)).toBeInTheDocument();
  });

  it("日付ごとに見出しと記録一覧を表示する", () => {
    render(
      <WorkoutRecordHistoryList
        groups={[{ date: "2026-03-01", records: [record] }]}
        onDeleteRecordAction={jest.fn()}
      />,
    );

    expect(screen.getByText("2026-03-01")).toBeInTheDocument();
    expect(screen.getByText(/ベンチプレス/)).toBeInTheDocument();
  });

  it("削除ボタン押下でonDeleteRecordActionにレコードが渡される", () => {
    const onDeleteRecordAction = jest.fn();
    render(
      <WorkoutRecordHistoryList
        groups={[{ date: "2026-03-01", records: [record] }]}
        onDeleteRecordAction={onDeleteRecordAction}
      />,
    );

    fireEvent.click(
      screen.getByRole("button", { name: texts.historyItem.deleteAriaLabel }),
    );

    expect(onDeleteRecordAction).toHaveBeenCalledWith(record);
  });
});
