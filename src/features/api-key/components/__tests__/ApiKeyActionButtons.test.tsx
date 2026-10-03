import { fireEvent, render, screen } from "@testing-library/react";
import texts from "../../locales/ja.json";
import { ApiKeyActionButtons } from "../ApiKeyActionButtons";

const renderButtons = (
  hasKey: boolean | null,
  isWorking = false,
  handlers = { onIssue: jest.fn(), onRevoke: jest.fn() },
) => {
  render(
    <ApiKeyActionButtons hasKey={hasKey} isWorking={isWorking} {...handlers} />,
  );
  return handlers;
};

describe("ApiKeyActionButtons", () => {
  it("未発行は「キーを発行」のみで、失効ボタンは出さない", () => {
    renderButtons(false);
    expect(
      screen.getByRole("button", { name: texts.issueButton }),
    ).toBeEnabled();
    expect(
      screen.queryByRole("button", { name: texts.revokeButton }),
    ).toBeNull();
  });

  it("発行済みは「再発行」と「失効」を出す", () => {
    renderButtons(true);
    expect(
      screen.getByRole("button", { name: texts.reissueButton }),
    ).toBeEnabled();
    expect(
      screen.getByRole("button", { name: texts.revokeButton }),
    ).toBeEnabled();
  });

  it("確認中（null）は発行ボタンを無効にする", () => {
    renderButtons(null);
    expect(
      screen.getByRole("button", { name: texts.issueButton }),
    ).toBeDisabled();
  });

  it("処理中は両方のボタンを無効にする", () => {
    renderButtons(true, true);
    expect(
      screen.getByRole("button", { name: texts.reissueButton }),
    ).toBeDisabled();
    expect(
      screen.getByRole("button", { name: texts.revokeButton }),
    ).toBeDisabled();
  });

  it("クリックで対応するハンドラを呼ぶ", () => {
    const handlers = renderButtons(true);
    fireEvent.click(screen.getByRole("button", { name: texts.reissueButton }));
    fireEvent.click(screen.getByRole("button", { name: texts.revokeButton }));
    expect(handlers.onIssue).toHaveBeenCalledTimes(1);
    expect(handlers.onRevoke).toHaveBeenCalledTimes(1);
  });
});
