import { render, screen, fireEvent } from "@testing-library/react";
import { WeightTrackerHistoryItem } from "../WeightTrackerHistoryItem";
import {
  WEIGHT_HISTORY_DELETE_ARIA_LABEL,
  WEIGHT_HISTORY_TODAY_BADGE,
} from "../../weightHistoryPresentation";
import { type WeightRecord } from "@/types/routine";

describe("WeightTrackerHistoryItem", () => {
  const currentRecord: WeightRecord = {
    id: "w1",
    date: "2026-03-15",
    weight: 65.5,
    notes: "順調",
    createdAt: "",
    updatedAt: "",
  };

  const prevRecord: WeightRecord = {
    id: "w2",
    date: "2026-03-14",
    weight: 65.0,
    notes: "",
    createdAt: "",
    updatedAt: "",
  };

  const defaultProps = {
    record: currentRecord,
    prevRecord,
    today: "2026-03-15",
    onDelete: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("当日の記録の場合、今日バッジを表示し、前回差分を計算して表示する", () => {
    render(<WeightTrackerHistoryItem {...defaultProps} />);

    expect(screen.getByText(WEIGHT_HISTORY_TODAY_BADGE)).toBeInTheDocument();
    expect(screen.getByText("65.5 kg")).toBeInTheDocument();
    expect(screen.getByText("+0.5 kg")).toBeInTheDocument();
    expect(screen.getByText(/順調/)).toBeInTheDocument();
  });

  it("前回の記録がない場合は差分を表示しない", () => {
    render(
      <WeightTrackerHistoryItem
        {...defaultProps}
        prevRecord={undefined}
        today="2026-03-16"
      />,
    );

    expect(
      screen.queryByText(WEIGHT_HISTORY_TODAY_BADGE),
    ).not.toBeInTheDocument();
    expect(screen.queryByText("+0.5 kg")).not.toBeInTheDocument();
  });

  it("削除ボタンをクリックするとonDeleteが日付を引数に呼ばれる", () => {
    render(<WeightTrackerHistoryItem {...defaultProps} />);

    fireEvent.click(
      screen.getByRole("button", { name: WEIGHT_HISTORY_DELETE_ARIA_LABEL }),
    );
    expect(defaultProps.onDelete).toHaveBeenCalledWith("2026-03-15");
  });
});
