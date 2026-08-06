import { fireEvent, render, screen } from "@testing-library/react";
import { WorkoutRunningFields } from "../page/components/WorkoutRunningFields";
import texts from "../locales/ja.json";

describe("WorkoutRunningFields", () => {
  it("消費カロリーの入力欄を表示する", () => {
    render(
      <WorkoutRunningFields
        caloriesBurned=""
        onChangeCaloriesBurnedAction={jest.fn()}
      />,
    );

    expect(screen.getByText(texts.form.caloriesLabel)).toBeInTheDocument();
  });

  it("消費カロリー欄はmin=1で0以下の入力を抑制する", () => {
    render(
      <WorkoutRunningFields
        caloriesBurned=""
        onChangeCaloriesBurnedAction={jest.fn()}
      />,
    );

    expect(
      screen.getByPlaceholderText(texts.form.caloriesPlaceholder),
    ).toHaveAttribute("min", "1");
  });

  it("消費カロリー欄を入力するとonChangeCaloriesBurnedActionが呼ばれる", () => {
    const onChangeCaloriesBurnedAction = jest.fn();
    render(
      <WorkoutRunningFields
        caloriesBurned=""
        onChangeCaloriesBurnedAction={onChangeCaloriesBurnedAction}
      />,
    );

    fireEvent.change(
      screen.getByPlaceholderText(texts.form.caloriesPlaceholder),
      { target: { value: "300" } },
    );

    expect(onChangeCaloriesBurnedAction).toHaveBeenCalledWith("300");
  });
});
