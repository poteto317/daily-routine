import { render, screen } from "@testing-library/react";
import { TrainDelayNotification } from "../TrainDelayNotification";

describe("TrainDelayNotification", () => {
  it("遅延がなければ何も表示しない", () => {
    const { container } = render(<TrainDelayNotification delays={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("遅延情報を表示する", () => {
    render(
      <TrainDelayNotification
        delays={[
          {
            lineId: "yamanote",
            lineName: "山手線",
            company: "JR東日本",
            delayMinutes: 18,
            reason: "信号確認",
            section: "渋谷〜新宿",
            lastUpdated: "2026-03-07T09:05:00+09:00",
          },
        ]}
      />,
    );

    expect(screen.getByText("🚃 山手線")).toBeInTheDocument();
    expect(screen.getByText(/18/)).toBeInTheDocument();
    expect(screen.getByText("(渋谷〜新宿)")).toBeInTheDocument();
    expect(screen.getByText(/信号確認/)).toBeInTheDocument();
    expect(screen.getByText("JR東日本")).toBeInTheDocument();
  });
});
