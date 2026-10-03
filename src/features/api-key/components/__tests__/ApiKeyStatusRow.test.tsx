import { render, screen } from "@testing-library/react";
import texts from "../../locales/ja.json";
import { ApiKeyStatusRow } from "../ApiKeyStatusRow";

describe("ApiKeyStatusRow", () => {
  it.each([
    [null, texts.statusLoading],
    [true, texts.statusIssued],
    [false, texts.statusNone],
  ])("hasKey=%p のとき「%s」を表示する", (hasKey, label) => {
    render(<ApiKeyStatusRow hasKey={hasKey} />);
    expect(screen.getByText(texts.statusLabel)).toBeInTheDocument();
    expect(screen.getByText(label)).toBeInTheDocument();
  });

  it("状態表示を role=status（aria-live=polite）の領域として公開し、ラベルと値を含める", () => {
    render(<ApiKeyStatusRow hasKey={false} />);
    const region = screen.getByRole("status");
    expect(region).toHaveAttribute("aria-live", "polite");
    expect(region).toHaveTextContent(texts.statusLabel);
    expect(region).toHaveTextContent(texts.statusNone);
  });

  it("状態が変わっても同じ領域のまま文言だけが切り替わる（領域が再生成されない）", () => {
    const { rerender } = render(<ApiKeyStatusRow hasKey={null} />);
    const region = screen.getByRole("status");
    expect(region).toHaveTextContent(texts.statusLoading);

    rerender(<ApiKeyStatusRow hasKey />);
    expect(screen.getByRole("status")).toBe(region);
    expect(region).toHaveTextContent(texts.statusIssued);
    expect(region).not.toHaveTextContent(texts.statusLoading);
  });
});
