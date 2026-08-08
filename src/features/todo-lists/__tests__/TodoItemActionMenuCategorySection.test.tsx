import { fireEvent, render, screen, within } from "@testing-library/react";
import { TodoItemActionMenuCategorySection } from "../TodoItemActionMenuCategorySection";
import type { TodoCategory } from "../types";

const categories: TodoCategory[] = [{ id: "cat-work", name: "仕事", createdAt: "" }];

describe("TodoItemActionMenuCategorySection", () => {
  it("カテゴリの radiogroup を表示する", () => {
    render(
      <TodoItemActionMenuCategorySection
        categories={categories}
        selectedCategoryId={undefined}
        onSelect={jest.fn()}
      />,
    );
    expect(screen.getByRole("radiogroup", { name: "カテゴリ" })).toBeInTheDocument();
  });

  it("カテゴリ選択で onSelect が選択IDで呼ばれる", () => {
    const onSelect = jest.fn();
    render(
      <TodoItemActionMenuCategorySection
        categories={categories}
        selectedCategoryId={undefined}
        onSelect={onSelect}
      />,
    );
    const radiogroup = screen.getByRole("radiogroup", { name: "カテゴリ" });
    fireEvent.click(within(radiogroup).getByRole("radio", { name: "仕事" }));
    expect(onSelect).toHaveBeenCalledWith("cat-work");
  });
});
