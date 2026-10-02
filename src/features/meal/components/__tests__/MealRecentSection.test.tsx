import { render, screen, fireEvent } from "@testing-library/react";
import { MealRecentSection } from "../MealRecentSection";
import {
  MEAL_RECENT_DELETE_LABEL,
  MEAL_RECENT_EMPTY_LABEL,
  MEAL_RECENT_TITLE,
  MEAL_RECENT_TODAY_BADGE,
} from "../../helpers";
import { type MealRecord } from "@/types/routine";

describe("MealRecentSection", () => {
  const sampleMeals: MealRecord[] = [
    {
      id: "meal-1",
      date: "2026-03-15",
      time: "12:00",
      mealType: "lunch",
      description: "カレーライス",
      notes: "辛口",
      createdAt: "2026-03-15T12:00:00Z",
      updatedAt: "2026-03-15T12:00:00Z",
    },
    {
      id: "meal-2",
      date: "2026-03-14",
      time: "19:00",
      mealType: "dinner",
      description: "焼肉",
      createdAt: "2026-03-14T19:00:00Z",
      updatedAt: "2026-03-14T19:00:00Z",
    },
  ];

  const defaultProps = {
    meals: sampleMeals,
    today: "2026-03-15",
    onDeleteMeal: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("最近の食事一覧と本日のバッジを正しくレンダリングする", () => {
    render(<MealRecentSection {...defaultProps} />);

    expect(screen.getByText(MEAL_RECENT_TITLE)).toBeInTheDocument();
    expect(screen.getByText("カレーライス")).toBeInTheDocument();
    expect(screen.getByText(/辛口/)).toBeInTheDocument();
    expect(screen.getByText(MEAL_RECENT_TODAY_BADGE)).toBeInTheDocument();
    expect(screen.getByText("焼肉")).toBeInTheDocument();
  });

  it("削除ボタンをクリックするとonDeleteMealが呼ばれる", () => {
    render(<MealRecentSection {...defaultProps} />);

    const deleteButtons = screen.getAllByRole("button", {
      name: MEAL_RECENT_DELETE_LABEL,
    });
    fireEvent.click(deleteButtons[1]);

    expect(defaultProps.onDeleteMeal).toHaveBeenCalledWith(
      "2026-03-14",
      "meal-2",
    );
  });

  it("食事が空の場合は空メッセージを表示する", () => {
    render(<MealRecentSection {...defaultProps} meals={[]} />);

    expect(screen.getByText(MEAL_RECENT_EMPTY_LABEL)).toBeInTheDocument();
  });
});
