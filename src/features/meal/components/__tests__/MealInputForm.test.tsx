import { render, screen, fireEvent } from "@testing-library/react";
import { MealInputForm } from "../MealInputForm";
import {
  MEAL_CANCEL_LABEL,
  MEAL_DESCRIPTION_PLACEHOLDER,
  MEAL_NOTES_PLACEHOLDER,
  MEAL_SAVE_LABEL,
} from "../../helpers";

describe("MealInputForm", () => {
  const defaultProps = {
    descriptionInput: "オートミールとヨーグルト",
    mealTypeInput: "breakfast" as const,
    notesInput: "ナッツ多め",
    timeInput: "07:30",
    onCancel: jest.fn(),
    onDescriptionChange: jest.fn(),
    onMealTypeChange: jest.fn(),
    onNotesChange: jest.fn(),
    onSave: jest.fn(),
    onTimeChange: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("各フォーム要素が初期値でレンダリングされる", () => {
    const { container } = render(<MealInputForm {...defaultProps} />);

    const select = container.querySelector("select");
    expect(select).toHaveValue("breakfast");
    expect(screen.getByDisplayValue("07:30")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(MEAL_DESCRIPTION_PLACEHOLDER),
    ).toHaveValue("オートミールとヨーグルト");
    expect(screen.getByPlaceholderText(MEAL_NOTES_PLACEHOLDER)).toHaveValue(
      "ナッツ多め",
    );
  });

  it("値の変更時に各コールバックが呼ばれる", () => {
    const { container } = render(<MealInputForm {...defaultProps} />);

    const select = container.querySelector("select")!;
    fireEvent.change(select, {
      target: { value: "lunch" },
    });
    expect(defaultProps.onMealTypeChange).toHaveBeenCalledWith("lunch");

    fireEvent.change(screen.getByDisplayValue("07:30"), {
      target: { value: "12:30" },
    });
    expect(defaultProps.onTimeChange).toHaveBeenCalledWith("12:30");

    fireEvent.change(
      screen.getByPlaceholderText(MEAL_DESCRIPTION_PLACEHOLDER),
      {
        target: { value: "パスタ" },
      },
    );
    expect(defaultProps.onDescriptionChange).toHaveBeenCalledWith("パスタ");

    fireEvent.change(screen.getByPlaceholderText(MEAL_NOTES_PLACEHOLDER), {
      target: { value: "大盛り" },
    });
    expect(defaultProps.onNotesChange).toHaveBeenCalledWith("大盛り");
  });

  it("保存ボタンとキャンセルボタンのクリックイベントが動作する", () => {
    render(<MealInputForm {...defaultProps} />);

    fireEvent.click(screen.getByRole("button", { name: MEAL_SAVE_LABEL }));
    expect(defaultProps.onSave).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole("button", { name: MEAL_CANCEL_LABEL }));
    expect(defaultProps.onCancel).toHaveBeenCalledTimes(1);
  });
});
