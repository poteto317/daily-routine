import { screen, waitFor } from "@testing-library/react";
import { renderProgressBar } from "./ProgressBar.test-utils";

describe("ProgressBar format and edge", () => {
  it("分のみの場合", async () => {
    renderProgressBar({
      completedMinutes: 30,
      totalMinutes: 45,
      progressPercentage: 66.7,
    });
    await waitFor(() => {
      expect(screen.getByText("30分 / 45分")).toBeInTheDocument();
    });
  });

  it("時間のみの場合", async () => {
    renderProgressBar({
      completedMinutes: 60,
      totalMinutes: 180,
      progressPercentage: 33.3,
    });
    await waitFor(() => {
      expect(screen.getByText("1時間 / 3時間")).toBeInTheDocument();
    });
  });

  it("時間と分の組み合わせ", async () => {
    renderProgressBar({
      completedMinutes: 90,
      totalMinutes: 150,
      progressPercentage: 60,
    });
    await waitFor(() => {
      expect(screen.getByText("1時間30分 / 2時間30分")).toBeInTheDocument();
    });
  });

  it("0分の場合", async () => {
    renderProgressBar({
      completedMinutes: 0,
      totalMinutes: 0,
      progressPercentage: 0,
    });
    await waitFor(() => {
      expect(screen.getByText("0分 / 0分")).toBeInTheDocument();
    });
  });

  it("ルーティンがない場合（0分）", async () => {
    renderProgressBar({
      completedMinutes: 0,
      totalMinutes: 0,
      progressPercentage: 0,
    });
    await waitFor(() => {
      expect(screen.getByText("0% 完了")).toBeInTheDocument();
    });
  });

  it("大きな値でも正しく表示", async () => {
    renderProgressBar({
      completedMinutes: 480,
      totalMinutes: 600,
      progressPercentage: 80,
    });
    await waitFor(() => {
      expect(screen.getByText("80% 完了")).toBeInTheDocument();
      expect(screen.getByText("8時間 / 10時間")).toBeInTheDocument();
    });
  });

  it("「今日の進捗」ラベルが表示される", async () => {
    renderProgressBar({
      completedMinutes: 0,
      totalMinutes: 100,
      progressPercentage: 0,
    });
    await waitFor(() => {
      expect(screen.getByText("今日の進捗")).toBeInTheDocument();
    });
  });
});
