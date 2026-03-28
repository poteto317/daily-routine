import { fireEvent, render, screen } from "@testing-library/react";
import { CategoryFilter } from "../CategoryFilter";

describe("CategoryFilter", () => {
  it("すべてボタンとカテゴリボタンを表示し、クリックでonFilterChangeを呼ぶ", () => {
    const onFilterChangeAction = jest.fn();

    render(
      <CategoryFilter
        filterCategory="all"
        onFilterChangeAction={onFilterChangeAction}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "すべて" }));
    expect(onFilterChangeAction).toHaveBeenCalledWith("all");

    fireEvent.click(screen.getByRole("button", { name: /健康/ }));
    expect(onFilterChangeAction).toHaveBeenCalledWith("health");
  });

  it("選択中カテゴリの見た目クラスが付与される", () => {
    const { container } = render(
      <CategoryFilter
        filterCategory="health"
        onFilterChangeAction={() => undefined}
      />,
    );

    const activeButton = screen.getByRole("button", { name: /健康/ });
    expect(activeButton.className).toContain("ring-2");
    expect(container).toBeInTheDocument();
  });
});
