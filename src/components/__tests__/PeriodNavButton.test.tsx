import { fireEvent, render, screen } from "@testing-library/react";
import { PeriodNavButton } from "../PeriodNavButton";

describe("PeriodNavButton", () => {
  it("previous は左向きの矢印を描画する", () => {
    const { container } = render(
      <PeriodNavButton
        direction="previous"
        onClick={jest.fn()}
        ariaLabel={undefined}
        type={undefined}
      />,
    );

    expect(container.querySelector("path")).toHaveAttribute(
      "d",
      "M15 19l-7-7 7-7",
    );
  });

  it("next は右向きの矢印を描画する", () => {
    const { container } = render(
      <PeriodNavButton
        direction="next"
        onClick={jest.fn()}
        ariaLabel={undefined}
        type={undefined}
      />,
    );

    expect(container.querySelector("path")).toHaveAttribute(
      "d",
      "M9 5l7 7-7 7",
    );
  });

  it("ariaLabel と type を渡すと属性に反映される", () => {
    render(
      <PeriodNavButton
        direction="next"
        onClick={jest.fn()}
        ariaLabel="次へ"
        type="button"
      />,
    );

    const button = screen.getByRole("button", { name: "次へ" });
    expect(button).toHaveAttribute("type", "button");
    expect(button).toHaveAttribute("aria-label", "次へ");
  });

  it("undefined を渡すと type と aria-label を出力しない", () => {
    render(
      <PeriodNavButton
        direction="next"
        onClick={jest.fn()}
        ariaLabel={undefined}
        type={undefined}
      />,
    );

    const button = screen.getByRole("button");
    expect(button).not.toHaveAttribute("type");
    expect(button).not.toHaveAttribute("aria-label");
  });

  it("クリックで onClick が 1 回呼ばれる", () => {
    const onClick = jest.fn();
    render(
      <PeriodNavButton
        direction="previous"
        onClick={onClick}
        ariaLabel="前へ"
        type="button"
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "前へ" }));

    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
