import { render, screen } from "@testing-library/react";
import { MealPage } from "../MealPage";
import { useMealPageState } from "../useMealPageState";
import { MEAL_HEADER_TEXT, MEAL_RECENT_TITLE } from "../helpers";

jest.mock("../useMealPageState");

const mockUseMealPageState = useMealPageState as jest.MockedFunction<
  typeof useMealPageState
>;

describe("MealPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseMealPageState.mockReturnValue({
      today: "2026-03-15",
      todayMeals: [],
      recentMeals: [],
      showForm: false,
      mealTypeInput: "breakfast",
      timeInput: "08:00",
      descriptionInput: "",
      notesInput: "",
      setMealTypeInput: jest.fn(),
      setTimeInput: jest.fn(),
      setDescriptionInput: jest.fn(),
      setNotesInput: jest.fn(),
      openForm: jest.fn(),
      handleCancelForm: jest.fn(),
      handleAddMeal: jest.fn(),
      handleDeleteMeal: jest.fn(),
    });
  });

  it("MealHeader, MealTodaySection, MealRecentSection をレンダリングする", () => {
    render(<MealPage />);

    expect(screen.getByText(MEAL_HEADER_TEXT.title)).toBeInTheDocument();
    expect(screen.getByText(MEAL_RECENT_TITLE)).toBeInTheDocument();
  });
});
