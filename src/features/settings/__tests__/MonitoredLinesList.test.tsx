import { fireEvent, render, screen } from "@testing-library/react";
import { MonitoredLinesList } from "../components/MonitoredLinesList";
import type { MonitoredLine } from "../state/constants";

const lines: MonitoredLine[] = [
  { lineId: "l1", lineName: "山手線", company: "JR東日本" },
  { lineId: "l2", lineName: "丸ノ内線", company: "東京メトロ" },
];

describe("MonitoredLinesList", () => {
  it("路線が無ければ空のメッセージだけを表示する", () => {
    render(
      <MonitoredLinesList monitoredLines={[]} handleRemoveLine={jest.fn()} />,
    );

    expect(screen.getByText("監視する路線を追加してください")).toBeTruthy();
    expect(screen.queryByRole("button")).toBeNull();
    expect(screen.queryByText(/監視中の路線/)).toBeNull();
  });

  it("件数付きの見出しと、路線名・会社名を表示する", () => {
    render(
      <MonitoredLinesList
        monitoredLines={lines}
        handleRemoveLine={jest.fn()}
      />,
    );

    expect(screen.getByText("監視中の路線 (2)")).toBeTruthy();
    expect(screen.getByText("山手線")).toBeTruthy();
    expect(screen.getByText("JR東日本")).toBeTruthy();
    expect(screen.getByText("丸ノ内線")).toBeTruthy();
    expect(screen.getByText("東京メトロ")).toBeTruthy();
    expect(screen.queryByText("監視する路線を追加してください")).toBeNull();
  });

  it("路線ごとに削除ボタンを出す", () => {
    render(
      <MonitoredLinesList
        monitoredLines={lines}
        handleRemoveLine={jest.fn()}
      />,
    );

    expect(screen.getAllByRole("button", { name: "削除" })).toHaveLength(2);
  });

  it("削除を押すとその路線の ID でコールバックを呼ぶ", () => {
    const handleRemoveLine = jest.fn();
    render(
      <MonitoredLinesList
        monitoredLines={lines}
        handleRemoveLine={handleRemoveLine}
      />,
    );

    fireEvent.click(screen.getAllByRole("button", { name: "削除" })[1]);

    expect(handleRemoveLine).toHaveBeenCalledTimes(1);
    expect(handleRemoveLine).toHaveBeenCalledWith("l2");
  });

  it("削除ボタンはフォームを送信しない type=button", () => {
    render(
      <MonitoredLinesList
        monitoredLines={lines}
        handleRemoveLine={jest.fn()}
      />,
    );

    for (const button of screen.getAllByRole("button", { name: "削除" })) {
      expect(button.getAttribute("type")).toBe("button");
    }
  });
});
