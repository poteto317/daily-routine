import { fireEvent, render, screen } from "@testing-library/react";
import { DaySelector } from "../DaySelector";

describe("DaySelector", () => {
  const sortedDaysAndHoliday = [
    { value: 1, label: "月曜日" },
    { value: 2, label: "火曜日" },
    "holiday" as const,
  ];

  it("曜日・祝日ボタンを表示し、クリックでonViewModeChangeを呼ぶ", () => {
    const onViewModeChangeAction = jest.fn();

    render(
      <DaySelector
        viewMode={1}
        onViewModeChangeAction={onViewModeChangeAction}
        sortedDaysAndHoliday={sortedDaysAndHoliday}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "火曜日" }));
    expect(onViewModeChangeAction).toHaveBeenCalledWith(2);

    fireEvent.click(screen.getByRole("button", { name: /祝日/ }));
    expect(onViewModeChangeAction).toHaveBeenCalledWith("holiday");
  });

  it("選択中viewModeのボタンにアクティブクラスが付与される", () => {
    render(
      <DaySelector
        viewMode="holiday"
        onViewModeChangeAction={() => undefined}
        sortedDaysAndHoliday={sortedDaysAndHoliday}
      />,
    );

    const holidayButton = screen.getByRole("button", { name: /祝日/ });
    expect(holidayButton.className).toContain("bg-red-600");
  });
});
