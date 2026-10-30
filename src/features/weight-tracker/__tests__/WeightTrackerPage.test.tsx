import { render, screen } from "@testing-library/react";
import { WeightTrackerPage } from "../WeightTrackerPage";
import { useWeightTrackerState } from "../page/useWeightTrackerState";
import { WEIGHT_TRACKER_PAGE_TEXT } from "../page/helpers";

jest.mock("../page/useWeightTrackerState");

const mockUseWeightTrackerState = useWeightTrackerState as jest.MockedFunction<
  typeof useWeightTrackerState
>;

describe("WeightTrackerPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseWeightTrackerState.mockReturnValue({
      today: "2026-03-15",
      todayRecord: null,
      weightInput: "",
      notesInput: "",
      showForm: false,
      recentRecords: [],
      setWeightInput: jest.fn(),
      setNotesInput: jest.fn(),
      setShowForm: jest.fn(),
      handleSaveWeight: jest.fn(),
      handleCancelForm: jest.fn(),
      handleDeleteRecord: jest.fn(),
    });
  });

  it("ページタイトル、今日のカード、履歴リストをレンダリングする", () => {
    render(<WeightTrackerPage />);

    expect(
      screen.getByText(WEIGHT_TRACKER_PAGE_TEXT.title),
    ).toBeInTheDocument();
  });
});
