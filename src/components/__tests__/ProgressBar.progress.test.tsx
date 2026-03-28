import { screen, waitFor } from "@testing-library/react";
import { renderProgressBar } from "./ProgressBar.test-utils";

describe("ProgressBar progress", () => {
  it("0%の進捗を正しく表示", async () => {
    renderProgressBar({
      completedMinutes: 0,
      totalMinutes: 120,
      progressPercentage: 0,
    });
    await waitFor(() => {
      expect(screen.getByText("0% 完了")).toBeInTheDocument();
      expect(screen.getByText("0分 / 2時間")).toBeInTheDocument();
    });
  });

  it("50%の進捗を正しく表示", async () => {
    renderProgressBar({
      completedMinutes: 60,
      totalMinutes: 120,
      progressPercentage: 50,
    });
    await waitFor(() => {
      expect(screen.getByText("50% 完了")).toBeInTheDocument();
      expect(screen.getByText("1時間 / 2時間")).toBeInTheDocument();
    });
  });

  it("100%の進捗を正しく表示", async () => {
    renderProgressBar({
      completedMinutes: 120,
      totalMinutes: 120,
      progressPercentage: 100,
    });
    await waitFor(() => {
      expect(screen.getByText("100% 完了")).toBeInTheDocument();
      expect(screen.getByText("2時間 / 2時間")).toBeInTheDocument();
    });
  });

  it("小数点以下の進捗は切り捨て表示", async () => {
    renderProgressBar({
      completedMinutes: 40,
      totalMinutes: 120,
      progressPercentage: 33.333,
    });
    await waitFor(() => {
      expect(screen.getByText("33% 完了")).toBeInTheDocument();
    });
  });
});
