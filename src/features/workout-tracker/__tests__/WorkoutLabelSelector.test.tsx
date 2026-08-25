import { fireEvent, render, screen } from "@testing-library/react";
import { WorkoutLabelSelector } from "../page/components/WorkoutLabelSelector";
import texts from "../locales/ja.json";

describe("WorkoutLabelSelector", () => {
  it("radiogroupにフォーム全体の見出しではなく専用のaria-labelを持つ", () => {
    render(
      <WorkoutLabelSelector label="strength" onChangeLabelAction={jest.fn()} />,
    );

    expect(
      screen.getByRole("radiogroup", {
        name: texts.form.labelSelectorAriaLabel,
      }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("radiogroup", { name: texts.form.title }),
    ).not.toBeInTheDocument();
  });

  it("label=strengthのとき筋トレボタンがaria-checked=trueになる", () => {
    render(
      <WorkoutLabelSelector label="strength" onChangeLabelAction={jest.fn()} />,
    );

    expect(
      screen.getByRole("radio", { name: texts.form.labelStrength }),
    ).toHaveAttribute("aria-checked", "true");
    expect(
      screen.getByRole("radio", { name: texts.form.labelRunning }),
    ).toHaveAttribute("aria-checked", "false");
  });

  it("label=runningのときランニングボタンがaria-checked=trueになる", () => {
    render(
      <WorkoutLabelSelector label="running" onChangeLabelAction={jest.fn()} />,
    );

    expect(
      screen.getByRole("radio", { name: texts.form.labelRunning }),
    ).toHaveAttribute("aria-checked", "true");
    expect(
      screen.getByRole("radio", { name: texts.form.labelStrength }),
    ).toHaveAttribute("aria-checked", "false");
  });

  it("筋トレボタンをクリックするとonChangeLabelActionに'strength'を渡す", () => {
    const onChangeLabelAction = jest.fn();
    render(
      <WorkoutLabelSelector
        label="running"
        onChangeLabelAction={onChangeLabelAction}
      />,
    );

    fireEvent.click(
      screen.getByRole("radio", { name: texts.form.labelStrength }),
    );

    expect(onChangeLabelAction).toHaveBeenCalledWith("strength");
  });

  it("ランニングボタンをクリックするとonChangeLabelActionに'running'を渡す", () => {
    const onChangeLabelAction = jest.fn();
    render(
      <WorkoutLabelSelector
        label="strength"
        onChangeLabelAction={onChangeLabelAction}
      />,
    );

    fireEvent.click(
      screen.getByRole("radio", { name: texts.form.labelRunning }),
    );

    expect(onChangeLabelAction).toHaveBeenCalledWith("running");
  });
});
