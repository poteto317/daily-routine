import { fireEvent, render, screen } from "@testing-library/react";
import { WorkoutStrengthFields } from "../page/components/WorkoutStrengthFields";
import texts from "../locales/ja.json";

const defaultProps = {
  weightKg: "",
  reps: "",
  sets: "1",
  onChangeWeightKgAction: jest.fn(),
  onChangeRepsAction: jest.fn(),
  onChangeSetsAction: jest.fn(),
};

describe("WorkoutStrengthFields", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("重量・回数・セット数の入力欄がlabelと紐づいて表示される", () => {
    render(<WorkoutStrengthFields {...defaultProps} />);

    expect(screen.getByLabelText(texts.form.weightLabel)).toBeInTheDocument();
    expect(screen.getByLabelText(texts.form.repsLabel)).toBeInTheDocument();
    expect(screen.getByLabelText(texts.form.setsLabel)).toBeInTheDocument();
  });

  it("重量欄はstep=0.1で小数入力を受け付ける", () => {
    render(<WorkoutStrengthFields {...defaultProps} />);

    expect(screen.getByLabelText(texts.form.weightLabel)).toHaveAttribute(
      "step",
      "0.1",
    );
  });

  it("重量欄を入力するとonChangeWeightKgActionが呼ばれる", () => {
    const onChangeWeightKgAction = jest.fn();
    render(
      <WorkoutStrengthFields
        {...defaultProps}
        onChangeWeightKgAction={onChangeWeightKgAction}
      />,
    );

    fireEvent.change(screen.getByLabelText(texts.form.weightLabel), {
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

    fireEvent.change(screen.getByLabelText(texts.form.repsLabel), {
      target: { value: "10" },
    });

    expect(onChangeRepsAction).toHaveBeenCalledWith("10");
  });

  it("セット数欄は1〜5を選択できるセレクトボックスとして表示され渡されたvalueを反映する", () => {
    render(<WorkoutStrengthFields {...defaultProps} sets="3" />);

    const select = screen.getByLabelText(
      texts.form.setsLabel,
    ) as HTMLSelectElement;
    expect(select.tagName).toBe("SELECT");
    expect(select).toHaveValue("3");

    const options = Array.from(select.options).map((opt) => opt.value);
    expect(options).toEqual(["1", "2", "3", "4", "5"]);
  });

  it("セット数欄を選択・変更するとonChangeSetsActionが呼ばれる", () => {
    const onChangeSetsAction = jest.fn();
    render(
      <WorkoutStrengthFields
        {...defaultProps}
        onChangeSetsAction={onChangeSetsAction}
      />,
    );

    fireEvent.change(screen.getByLabelText(texts.form.setsLabel), {
      target: { value: "4" },
    });

    expect(onChangeSetsAction).toHaveBeenCalledWith("4");
  });
});
