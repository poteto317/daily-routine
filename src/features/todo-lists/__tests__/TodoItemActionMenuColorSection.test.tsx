import { fireEvent, render, screen, within } from "@testing-library/react";
import { TodoItemActionMenuColorSection } from "../TodoItemActionMenuColorSection";

describe("TodoItemActionMenuColorSection", () => {
  it("背景色の radiogroup を表示する", () => {
    render(<TodoItemActionMenuColorSection selectedColor={undefined} onSelect={jest.fn()} />);
    expect(screen.getByRole("radiogroup", { name: "背景色" })).toBeInTheDocument();
  });

  it("スウォッチ選択で onSelect が選択値で呼ばれる", () => {
    const onSelect = jest.fn();
    render(<TodoItemActionMenuColorSection selectedColor={undefined} onSelect={onSelect} />);
    const radiogroup = screen.getByRole("radiogroup", { name: "背景色" });
    // index=1（赤: "bg-red-50"）を選択してデフォルト undefined を避ける
    const redSwatch = within(radiogroup).getAllByRole("radio")[1];
    fireEvent.click(redSwatch);
    expect(onSelect).toHaveBeenCalledWith("bg-red-50");
  });
});
