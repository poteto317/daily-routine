import { render, screen, fireEvent } from "@testing-library/react";
import { WeightTrackerForm } from "../WeightTrackerForm";
import {
  WEIGHT_FORM_CANCEL_LABEL,
  WEIGHT_FORM_NOTES_PLACEHOLDER,
  WEIGHT_FORM_SAVE_LABEL,
  WEIGHT_FORM_WEIGHT_PLACEHOLDER,
} from "../../weightFormPresentation";

describe("WeightTrackerForm", () => {
  const defaultProps = {
    weightInput: "65.5",
    notesInput: "朝食前",
    onWeightChange: jest.fn(),
    onNotesChange: jest.fn(),
    onSave: jest.fn(),
    onCancel: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("初期値で正しくレンダリングされる", () => {
    render(<WeightTrackerForm {...defaultProps} />);

    expect(
      screen.getByPlaceholderText(WEIGHT_FORM_WEIGHT_PLACEHOLDER),
    ).toHaveValue(65.5);
    expect(
      screen.getByPlaceholderText(WEIGHT_FORM_NOTES_PLACEHOLDER),
    ).toHaveValue("朝食前");
  });

  it("値変更時にハンドラが呼び出される", () => {
    render(<WeightTrackerForm {...defaultProps} />);

    fireEvent.change(
      screen.getByPlaceholderText(WEIGHT_FORM_WEIGHT_PLACEHOLDER),
      {
        target: { value: "66.0" },
      },
    );
    expect(defaultProps.onWeightChange).toHaveBeenCalledWith("66.0");

    fireEvent.change(
      screen.getByPlaceholderText(WEIGHT_FORM_NOTES_PLACEHOLDER),
      {
        target: { value: "夕食後" },
      },
    );
    expect(defaultProps.onNotesChange).toHaveBeenCalledWith("夕食後");
  });

  it("保存ボタンとキャンセルボタンのクリックが動作する", () => {
    render(<WeightTrackerForm {...defaultProps} />);

    fireEvent.click(
      screen.getByRole("button", { name: WEIGHT_FORM_SAVE_LABEL }),
    );
    expect(defaultProps.onSave).toHaveBeenCalledTimes(1);

    fireEvent.click(
      screen.getByRole("button", { name: WEIGHT_FORM_CANCEL_LABEL }),
    );
    expect(defaultProps.onCancel).toHaveBeenCalledTimes(1);
  });
});
