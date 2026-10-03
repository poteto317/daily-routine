import { fireEvent, render, screen } from "@testing-library/react";
import texts from "../../locales/ja.json";
import { IssuedApiKeyPanel } from "../IssuedApiKeyPanel";

describe("IssuedApiKeyPanel", () => {
  it("注意文と、読み取り専用のキー入力を表示する", () => {
    render(
      <IssuedApiKeyPanel
        issuedKey="drk_secret"
        copied={false}
        onCopy={jest.fn()}
      />,
    );
    expect(screen.getByText(texts.issuedNotice)).toBeInTheDocument();
    const input = screen.getByLabelText(texts.issuedKeyLabel);
    expect(input).toHaveValue("drk_secret");
    expect(input).toHaveAttribute("readonly");
  });

  it("コピーボタンで onCopy を呼ぶ", () => {
    const onCopy = jest.fn();
    render(
      <IssuedApiKeyPanel
        issuedKey="drk_secret"
        copied={false}
        onCopy={onCopy}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: texts.copyButton }));
    expect(onCopy).toHaveBeenCalledTimes(1);
  });

  it("copied のときだけ「コピーしました」を表示する", () => {
    const { rerender } = render(
      <IssuedApiKeyPanel issuedKey="k" copied={false} onCopy={jest.fn()} />,
    );
    expect(screen.queryByText(texts.copiedLabel)).toBeNull();
    rerender(<IssuedApiKeyPanel issuedKey="k" copied onCopy={jest.fn()} />);
    expect(screen.getByText(texts.copiedLabel)).toBeInTheDocument();
  });

  it("入力にフォーカスすると全選択する", () => {
    render(
      <IssuedApiKeyPanel
        issuedKey="drk_secret"
        copied={false}
        onCopy={jest.fn()}
      />,
    );
    const input = screen.getByLabelText(
      texts.issuedKeyLabel,
    ) as HTMLInputElement;
    const select = jest.spyOn(input, "select");
    fireEvent.focus(input);
    expect(select).toHaveBeenCalled();
  });
});
