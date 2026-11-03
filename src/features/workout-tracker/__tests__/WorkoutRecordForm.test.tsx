import { fireEvent, render, screen } from "@testing-library/react";
import { WorkoutRecordForm } from "../page/components/WorkoutRecordForm";
import texts from "../locales/ja.json";

const baseValues = {
  label: "strength" as const,
  date: "2026-03-01",
  exerciseId: "",
  weightKg: "",
  reps: "",
  sets: "1",
  caloriesBurned: "",
};

const defaultProps = {
  exercises: [
    {
      id: "ベンチプレス",
      name: "ベンチプレス",
      label: "strength" as const,
      createdAt: "",
      updatedAt: "",
    },
  ],
  values: baseValues,
  error: null,
  onChangeLabelAction: jest.fn(),
  onChangeDateAction: jest.fn(),
  onChangeExerciseIdAction: jest.fn(),
  onChangeWeightKgAction: jest.fn(),
  onChangeRepsAction: jest.fn(),
  onChangeSetsAction: jest.fn(),
  onChangeCaloriesBurnedAction: jest.fn(),
  onSubmitAction: jest.fn(),
};

describe("WorkoutRecordForm", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("label=strengthのとき重量・回数・セット数の入力欄を表示する", () => {
    render(<WorkoutRecordForm {...defaultProps} />);

    expect(screen.getByText(texts.form.weightLabel)).toBeInTheDocument();
    expect(screen.getByText(texts.form.repsLabel)).toBeInTheDocument();
    expect(screen.getByText(texts.form.setsLabel)).toBeInTheDocument();
    expect(
      screen.queryByText(texts.form.caloriesLabel),
    ).not.toBeInTheDocument();
  });

  it("label=runningのとき消費カロリーの入力欄のみ表示する", () => {
    render(
      <WorkoutRecordForm
        {...defaultProps}
        values={{ ...baseValues, label: "running" }}
      />,
    );

    expect(screen.getByText(texts.form.caloriesLabel)).toBeInTheDocument();
    expect(screen.queryByText(texts.form.weightLabel)).not.toBeInTheDocument();
    expect(screen.queryByText(texts.form.repsLabel)).not.toBeInTheDocument();
  });

  it("ラベルボタンはrole=radioでaria-checkedが現在の選択を反映する", () => {
    render(<WorkoutRecordForm {...defaultProps} />);

    expect(
      screen.getByRole("radio", { name: texts.form.labelStrength }),
    ).toHaveAttribute("aria-checked", "true");
    expect(
      screen.getByRole("radio", { name: texts.form.labelRunning }),
    ).toHaveAttribute("aria-checked", "false");
  });

  it("ランニングボタンをクリックするとonChangeLabelActionが呼ばれる", () => {
    const onChangeLabelAction = jest.fn();
    render(
      <WorkoutRecordForm
        {...defaultProps}
        onChangeLabelAction={onChangeLabelAction}
      />,
    );

    fireEvent.click(
      screen.getByRole("radio", { name: texts.form.labelRunning }),
    );

    expect(onChangeLabelAction).toHaveBeenCalledWith("running");
  });

  it("種目名を入力するとonChangeExerciseIdActionが呼ばれる", () => {
    const onChangeExerciseIdAction = jest.fn();
    render(
      <WorkoutRecordForm
        {...defaultProps}
        onChangeExerciseIdAction={onChangeExerciseIdAction}
      />,
    );

    fireEvent.change(
      screen.getByRole("combobox", { name: texts.form.exerciseNameLabel }),
      { target: { value: "ベンチプレス" } },
    );

    expect(onChangeExerciseIdAction).toHaveBeenCalledWith("ベンチプレス");
  });

  it("エラーメッセージがあれば表示する", () => {
    render(<WorkoutRecordForm {...defaultProps} error="必須です" />);

    expect(screen.getByRole("alert")).toHaveTextContent("必須です");
  });

  it("エラーがなければ表示しない", () => {
    render(<WorkoutRecordForm {...defaultProps} error={null} />);

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("追加ボタンをクリックするとonSubmitActionが呼ばれる", () => {
    const onSubmitAction = jest.fn();
    render(
      <WorkoutRecordForm {...defaultProps} onSubmitAction={onSubmitAction} />,
    );

    fireEvent.click(screen.getByRole("button", { name: texts.form.addButton }));

    expect(onSubmitAction).toHaveBeenCalledTimes(1);
  });

  it("セット数を変更するとonChangeSetsActionが呼ばれる", () => {
    const onChangeSetsAction = jest.fn();
    render(
      <WorkoutRecordForm
        {...defaultProps}
        onChangeSetsAction={onChangeSetsAction}
      />,
    );

    fireEvent.change(screen.getByLabelText(texts.form.setsLabel), {
      target: { value: "3" },
    });

    expect(onChangeSetsAction).toHaveBeenCalledWith("3");
  });
});
