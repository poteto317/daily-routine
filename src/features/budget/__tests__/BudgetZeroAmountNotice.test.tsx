import { render, screen } from "@testing-library/react";
import { BudgetZeroAmountNotice } from "../components/BudgetZeroAmountNotice";

describe("BudgetZeroAmountNotice", () => {
  it("visible のとき、理由を role=alert で表示する", () => {
    render(<BudgetZeroAmountNotice id="notice" visible />);

    const alert = screen.getByRole("alert");
    expect(alert).toHaveAttribute("id", "notice");
    expect(alert).toHaveTextContent("0 円は、今日より前の日付だけ記録できます");
  });

  it("visible でないとき、何も表示しない", () => {
    const { container } = render(
      <BudgetZeroAmountNotice id="notice" visible={false} />,
    );

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(container).toBeEmptyDOMElement();
  });
});
