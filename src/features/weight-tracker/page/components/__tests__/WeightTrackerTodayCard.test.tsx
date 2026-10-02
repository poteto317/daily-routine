import { render, screen, fireEvent } from "@testing-library/react";
import { WeightTrackerTodayCard } from "../WeightTrackerTodayCard";
import {
  WEIGHT_TODAY_ADD_LABEL,
  WEIGHT_TODAY_EDIT_LABEL,
  WEIGHT_TODAY_EMPTY_LABEL,
  WEIGHT_TODAY_TITLE,
} from "../../weightTodayPresentation";
import { type WeightRecord } from "@/types/routine";

describe("WeightTrackerTodayCard", () => {
  const sampleRecord: WeightRecord = {
    id: "w1",
    date: "2026-03-15",
    weight: 65.2,
    notes: "体調良好",
    createdAt: "2026-03-15T08:00:00.000Z",
    updatedAt: "2026-03-15T08:00:00.000Z",
  };

  const defaultProps = {
    today: "2026-03-15",
    todayRecord: sampleRecord,
    showForm: false,
    weightInput: "65.2",
    notesInput: "体調良好",
    onEdit: jest.fn(),
    onWeightChange: jest.fn(),
    onNotesChange: jest.fn(),
    onSave: jest.fn(),
    onCancel: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("当日の記録がある場合は体重、メモ、更新日時を表示し、編集ボタンを表示する", () => {
    render(<WeightTrackerTodayCard {...defaultProps} />);

    expect(screen.getByText(new RegExp(WEIGHT_TODAY_TITLE))).toBeInTheDocument();
    expect(screen.getByText("65.2 kg")).toBeInTheDocument();
    expect(screen.getByText(/体調良好/)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: WEIGHT_TODAY_EDIT_LABEL }),
    ).toBeInTheDocument();
  });

  it("編集ボタンをクリックするとonEditが呼ばれる", () => {
    render(<WeightTrackerTodayCard {...defaultProps} />);

    fireEvent.click(
      screen.getByRole("button", { name: WEIGHT_TODAY_EDIT_LABEL }),
    );
    expect(defaultProps.onEdit).toHaveBeenCalledTimes(1);
  });

  it("当日の記録がない場合は空メッセージと追加ボタンを表示する", () => {
    render(<WeightTrackerTodayCard {...defaultProps} todayRecord={null} />);

    expect(screen.getByText(WEIGHT_TODAY_EMPTY_LABEL)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: WEIGHT_TODAY_ADD_LABEL }),
    ).toBeInTheDocument();
  });

  it("showFormがtrueの場合はフォームを表示する", () => {
    render(<WeightTrackerTodayCard {...defaultProps} showForm={true} />);

    expect(
      screen.queryByRole("button", { name: WEIGHT_TODAY_EDIT_LABEL }),
    ).not.toBeInTheDocument();
    expect(screen.getByDisplayValue("65.2")).toBeInTheDocument();
  });
});
