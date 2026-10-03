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
});
