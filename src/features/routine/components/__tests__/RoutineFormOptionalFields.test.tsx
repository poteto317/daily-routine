import { fireEvent, render, screen } from "@testing-library/react";
import { RoutineFormOptionalFields } from "../RoutineFormOptionalFields";

describe("RoutineFormOptionalFields", () => {
  it("週間目標を1〜7回または空欄で入力できる", () => {
    const setWeeklyGoalTarget = jest.fn();

    render(
      <RoutineFormOptionalFields
        description=""
        setDescription={jest.fn()}
        notificationMinutes=""
        setNotificationMinutes={jest.fn()}
        defaultNotificationMinutes={10}
        weeklyGoalTarget="3"
        setWeeklyGoalTarget={setWeeklyGoalTarget}
        isWeeklyGoalTargetValid={true}
      />,
    );

    const input = screen.getByRole("spinbutton", { name: "週間目標" });
    expect(input).toHaveAttribute("min", "1");
    expect(input).toHaveAttribute("max", "7");
    expect(input).toHaveAttribute("step", "1");
    expect(input).toHaveValue(3);

    fireEvent.change(input, { target: { value: "4" } });
    expect(setWeeklyGoalTarget).toHaveBeenCalledWith("4");
  });

  it("不正な週間目標をアクセシビリティツリーへ伝える", () => {
    render(
      <RoutineFormOptionalFields
        description=""
        setDescription={jest.fn()}
        notificationMinutes=""
        setNotificationMinutes={jest.fn()}
        defaultNotificationMinutes={10}
        weeklyGoalTarget="8"
        setWeeklyGoalTarget={jest.fn()}
        isWeeklyGoalTargetValid={false}
      />,
    );

    expect(
      screen.getByRole("spinbutton", { name: "週間目標" }),
    ).toHaveAttribute("aria-invalid", "true");
    expect(
      screen.getByText("1〜7の整数で入力してください"),
    ).toBeInTheDocument();
  });
});
