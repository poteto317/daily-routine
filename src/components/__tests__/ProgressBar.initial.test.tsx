import { screen, waitFor } from "@testing-library/react";
import { renderProgressBar } from "./ProgressBar.test-utils";

describe("ProgressBar initial", () => {
  it("マウント前は0%を表示", () => {
    renderProgressBar({
      completedMinutes: 30,
      totalMinutes: 120,
      progressPercentage: 25,
    });

    expect(screen.getByText("0% 完了")).toBeInTheDocument();
  });

  it("マウント後は実際の進捗を表示", async () => {
    renderProgressBar({
      completedMinutes: 30,
      totalMinutes: 120,
      progressPercentage: 25,
    });

    await waitFor(() => {
      expect(screen.getByText("25% 完了")).toBeInTheDocument();
    });
  });
});
