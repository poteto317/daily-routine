import { render, screen, fireEvent } from "@testing-library/react";
import { MealTodaySection } from "../MealTodaySection";
import {
  MEAL_TODAY_ADD_LABEL,
  MEAL_TODAY_DELETE_LABEL,
  MEAL_TODAY_EMPTY_LABEL,
  MEAL_TODAY_TITLE_LABEL,
} from "../../helpers";
import { type MealRecord } from "@/types/routine";

describe("MealTodaySection", () => {
  const sampleMeals: MealRecord[] = [
    {
      id: "meal-1",
      date: "2026-03-15",
      time: "08:00",
      mealType: "breakfast",
      description: "トーストとコーヒー",
      notes: "ブラックコーヒー",
      createdAt: "2026-03-15T08:00:00Z",
      updatedAt: "2026-03-15T08:00:00Z",
    },
    {
      id: "meal-2",
      date: "2026-03-15",
      time: "12:30",
      mealType: "lunch",
      description: "ラーメン",
      createdAt: "2026-03-15T12:30:00Z",
      updatedAt: "2026-03-15T12:30:00Z",
    },
  ];

  const defaultProps = {
    meals: sampleMeals,
    showForm: false,
    today: "2026-03-15",
    onDeleteMeal: jest.fn(),
    onOpenForm: jest.fn(),
    form: <div data-testid="mock-form">フォーム</div>,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("食事一覧を時間順でレンダリングする", () => {
    render(<MealTodaySection {...defaultProps} />);

    expect(screen.getByText(new RegExp(MEAL_TODAY_TITLE_LABEL))).toBeInTheDocument();
    expect(screen.getByText("トーストとコーヒー")).toBeInTheDocument();
    expect(screen.getByText(/ブラックコーヒー/)).toBeInTheDocument();
    expect(screen.getByText("ラーメン")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: MEAL_TODAY_ADD_LABEL }),
    ).toBeInTheDocument();
  });

  it("追加ボタンをクリックするとonOpenFormが呼ばれる", () => {
    render(<MealTodaySection {...defaultProps} />);

    fireEvent.click(
      screen.getByRole("button", { name: MEAL_TODAY_ADD_LABEL }),
    );
    expect(defaultProps.onOpenForm).toHaveBeenCalledTimes(1);
  });

  it("削除ボタンをクリックするとonDeleteMealが呼ばれる", () => {
    render(<MealTodaySection {...defaultProps} />);

    const deleteButtons = screen.getAllByRole("button", {
      name: MEAL_TODAY_DELETE_LABEL,
    });
    fireEvent.click(deleteButtons[0]);

    expect(defaultProps.onDeleteMeal).toHaveBeenCalledWith(
      "2026-03-15",
      "meal-1",
    );
  });

  it("showFormがtrueの場合はフォームが表示され、追加ボタンは非表示になる", () => {
    render(<MealTodaySection {...defaultProps} showForm={true} />);

    expect(screen.getByTestId("mock-form")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: MEAL_TODAY_ADD_LABEL }),
    ).not.toBeInTheDocument();
  });

  it("食事が空の場合は空メッセージを表示する", () => {
    render(<MealTodaySection {...defaultProps} meals={[]} />);

    expect(screen.getByText(MEAL_TODAY_EMPTY_LABEL)).toBeInTheDocument();
  });
});
