import { fireEvent, render, screen } from "@testing-library/react";
import { WorkoutStrengthFields } from "../page/components/WorkoutStrengthFields";
import texts from "../locales/ja.json";

const defaultProps = {
  weightKg: "",
  reps: "",
  sets: "",
  onChangeWeightKgAction: jest.fn(),
  onChangeRepsAction: jest.fn(),
  onChangeSetsAction: jest.fn(),
};

describe("WorkoutStrengthFields", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("重量・回数・セット数の入力欄を表示する", () => {
    render(<WorkoutStrengthFields {...defaultProps} />);

    expect(screen.getByText(texts.form.weightLabel)).toBeInTheDocument();
    expect(screen.getByText(texts.form.repsLabel)).toBeInTheDocument();
    expect(screen.getByText(texts.form.setsLabel)).toBeInTheDocument();
  });

  it("重量欄はstep=0.1で小数入力を受け付ける", () => {
    render(<WorkoutStrengthFields {...defaultProps} />);

    expect(
      screen.getByPlaceholderText(texts.form.weightPlaceholder),
    ).toHaveAttribute("step", "0.1");
  });

  it("重量欄を入力するとonChangeWeightKgActionが呼ばれる", () => {
    const onChangeWeightKgAction = jest.fn();
    render(
      <WorkoutStrengthFields
        {...defaultProps}
        onChangeWeightKgAction={onChangeWeightKgAction}
      />,
    );

    fireEvent.change(screen.getByPlaceholderText(texts.form.weightPlaceholder), {
      target: { value: "60" },
    });

    expect(onChangeWeightKgAction).toHaveBeenCalledWith("60");
  });

  it("回数欄を入力するとonChangeRepsActionが呼ばれる", () => {
    const onChangeRepsAction = jest.fn();
    render(
      <WorkoutStrengthFields
        {...defaultProps}
        onChangeRepsAction={onChangeRepsAction}
      />,
    );

    fireEvent.change(screen.getByPlaceholderText(texts.form.repsPlaceholder), {
      target: { value: "10" },
    });

    expect(onChangeRepsAction).toHaveBeenCalledWith("10");
  });

  it("セット数欄を入力するとonChangeSetsActionが呼ばれる", () => {
    const onChangeSetsAction = jest.fn();
    render(
      <WorkoutStrengthFields
        {...defaultProps}
        onChangeSetsAction={onChangeSetsAction}
      />,
    );

    fireEvent.change(screen.getByPlaceholderText(texts.form.setsPlaceholder), {
      target: { value: "3" },
    });

    expect(onChangeSetsAction).toHaveBeenCalledWith("3");
  });
});
