import { render, screen } from "@testing-library/react";
import { MealHeader } from "../MealHeader";
import { MEAL_HEADER_TEXT } from "../../helpers";

describe("MealHeader", () => {
  it("タイトル、バッジ、インフォテキストをレンダリングする", () => {
    render(<MealHeader />);

    expect(screen.getByText(MEAL_HEADER_TEXT.title)).toBeInTheDocument();
    expect(screen.getByText(MEAL_HEADER_TEXT.badge)).toBeInTheDocument();
    expect(screen.getByText(MEAL_HEADER_TEXT.info)).toBeInTheDocument();
  });
});
