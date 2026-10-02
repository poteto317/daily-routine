import { render, screen } from "@testing-library/react";
import { WeightTrackerHistoryList } from "../WeightTrackerHistoryList";
import { WEIGHT_TRACKER_HISTORY_LIST_TEXT } from "../../weightHistoryPresentation";
import { type WeightRecord } from "@/types/routine";

describe("WeightTrackerHistoryList", () => {
  const records: WeightRecord[] = [
    {
      id: "w1",
      date: "2026-03-15",
      weight: 65.0,
      createdAt: "",
      updatedAt: "",
    },
    {
      id: "w2",
      date: "2026-03-14",
      weight: 65.5,
      createdAt: "",
      updatedAt: "",
    },
  ];

  it("履歴が空の場合は空メッセージを表示する", () => {
    render(
      <WeightTrackerHistoryList
        today="2026-03-15"
        recentRecords={[]}
        onDeleteRecord={jest.fn()}
      />,
    );

    expect(
      screen.getByText(WEIGHT_TRACKER_HISTORY_LIST_TEXT.title),
    ).toBeInTheDocument();
    expect(
      screen.getByText(WEIGHT_TRACKER_HISTORY_LIST_TEXT.empty),
    ).toBeInTheDocument();
  });

  it("履歴がある場合はリストアイテムを表示する", () => {
    render(
      <WeightTrackerHistoryList
        today="2026-03-15"
        recentRecords={records}
        onDeleteRecord={jest.fn()}
      />,
    );

    expect(screen.getByText("65.0 kg")).toBeInTheDocument();
    expect(screen.getByText("65.5 kg")).toBeInTheDocument();
  });
});
