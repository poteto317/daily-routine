import { render, screen } from "@testing-library/react";
import { CardPanel } from "../CardPanel";

const BASE_CLASSES = [
  "bg-white",
  "dark:bg-slate-100",
  "rounded-2xl",
  "shadow-xl",
  "p-6",
  "mb-6",
];

describe("CardPanel", () => {
  it("中身をそのまま描く", () => {
    render(
      <CardPanel>
        <p>カードの中身</p>
      </CardPanel>,
    );

    expect(screen.getByText("カードの中身")).toBeInTheDocument();
  });

  it("className を渡さなければ基本のクラスだけを付ける", () => {
    const { container } = render(<CardPanel>中身</CardPanel>);
    const panel = container.firstElementChild as HTMLElement;

    expect(panel).toHaveClass(...BASE_CLASSES);
    expect(panel.className).toBe(BASE_CLASSES.join(" "));
  });

  it("className を渡すと基本のクラスの後ろに追加する", () => {
    const { container } = render(
      <CardPanel className="mt-4 max-w-md">中身</CardPanel>,
    );
    const panel = container.firstElementChild as HTMLElement;

    expect(panel.className).toBe(`${BASE_CLASSES.join(" ")} mt-4 max-w-md`);
  });

  it("空文字の className は付けない（末尾に空白を残さない）", () => {
    const { container } = render(<CardPanel className="">中身</CardPanel>);
    const panel = container.firstElementChild as HTMLElement;

    expect(panel.className).toBe(BASE_CLASSES.join(" "));
  });
});
