import "./HomeToolbar.test.setup";
import { render, screen } from "@testing-library/react";
import { HomeToolbar } from "../HomeToolbar";
import { baseView } from "./HomeToolbar.test.setup";

describe("HomeToolbar holiday", () => {
  it("祝日フラグと遅延情報を表示する", () => {
    render(
      <HomeToolbar
        view={{ ...baseView, isTodayHoliday: true }}
        display={{
          completedMinutes: 0,
          totalMinutes: 0,
          progressPercentage: 0,
        }}
        trainDelays={[
          {
            lineId: "l1",
            lineName: "山手線",
            company: "JR",
            delayMinutes: 10,
            reason: "点検",
            section: "全線",
            lastUpdated: "2026-02-12T00:00:00.000Z",
          },
        ]}
        onAddRoutineAction={() => undefined}
        showAddButton={true}
      />,
    );

    expect(screen.getByText(/祝日/)).toBeInTheDocument();
    expect(screen.getByTestId("train-delay")).toHaveTextContent("1");
  });
});
