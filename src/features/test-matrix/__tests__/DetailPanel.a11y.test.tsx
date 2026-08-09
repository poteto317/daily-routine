import { fireEvent, render, screen } from "@testing-library/react";
import { DetailPanel } from "../DetailPanel";
import type { DetailTestCase } from "../detailedTestCases";

const cases: DetailTestCase[] = [
  {
    id: "case-1",
    scenario: "ログインする",
    expected: "ホーム画面が表示される",
    pc: "ok",
    sp: "unchecked",
    note: "",
  },
];

describe("DetailPanel アクセシビリティ", () => {
  const renderPanel = (onClose = jest.fn()) => {
    render(
      <DetailPanel
        itemId="1-1"
        itemLabel="ログイン機能"
        cases={cases}
        onClose={onClose}
        onToggleStatus={jest.fn()}
        onUpdateNote={jest.fn()}
      />,
    );
    return onClose;
  };

  it("モーダルとして dialog ロールを持ち、見出しがアクセシブル名になる", () => {
    renderPanel();

    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveAttribute("aria-modal", "true");
    // aria-labelledby が見出し（項目名）を指す
    expect(dialog).toHaveAccessibleName("ログイン機能");
  });

  it("閉じるボタンは記号ではなくアクセシブルな名前を持つ", () => {
    renderPanel();

    expect(screen.getByRole("button", { name: "閉じる" })).toBeInTheDocument();
  });

  it("Escapeキーで閉じられる（aria-modal の宣言に見合う挙動）", () => {
    const onClose = renderPanel();

    fireEvent.keyDown(document, { key: "Escape" });

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("Escape以外のキーでは閉じない", () => {
    const onClose = renderPanel();

    fireEvent.keyDown(document, { key: "Enter" });

    expect(onClose).not.toHaveBeenCalled();
  });

  it("日本語入力の変換中にEscapeを押しても閉じない（備考の入力内容を失わない）", () => {
    const onClose = renderPanel();

    fireEvent.keyDown(document, { key: "Escape", isComposing: true });

    expect(onClose).not.toHaveBeenCalled();
  });
});
