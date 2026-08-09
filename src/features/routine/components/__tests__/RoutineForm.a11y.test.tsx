import { fireEvent, render, screen } from "@testing-library/react";
import { RoutineForm } from "../RoutineForm";
import { getRoutineFormHeaderTitle } from "../helpers";

describe("RoutineForm アクセシビリティ", () => {
  const defaultProps = {
    onSubmit: jest.fn(),
    onCancel: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("モーダルとして dialog ロールを持ち、見出しがアクセシブル名になる", () => {
    render(<RoutineForm {...defaultProps} />);

    // role="dialog" + aria-modal により、支援技術がモーダルとして認識できる
    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveAttribute("aria-modal", "true");

    // aria-labelledby が見出しを指し、ダイアログ名として読み上げられる
    expect(dialog).toHaveAccessibleName(getRoutineFormHeaderTitle(false));
  });

  it("編集モードでは編集用の見出しがアクセシブル名になる", () => {
    const routine = {
      id: "r1",
      title: "朝活",
      startTime: "08:00",
      duration: 30,
      category: "health" as const,
      daysOfWeek: [1],
      isCompleted: false,
      sortOrder: 0,
      createdAt: "2026-02-12T00:00:00.000Z",
      updatedAt: "2026-02-12T00:00:00.000Z",
    };

    render(<RoutineForm {...defaultProps} routine={routine} />);

    expect(screen.getByRole("dialog")).toHaveAccessibleName(
      getRoutineFormHeaderTitle(true),
    );
  });

  it("Escapeキーで閉じられる（aria-modal の宣言に見合う挙動）", () => {
    const onCancel = jest.fn();
    render(<RoutineForm {...defaultProps} onCancel={onCancel} />);

    fireEvent.keyDown(document, { key: "Escape" });

    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it("Escape以外のキーでは閉じない", () => {
    const onCancel = jest.fn();
    render(<RoutineForm {...defaultProps} onCancel={onCancel} />);

    fireEvent.keyDown(document, { key: "Enter" });

    expect(onCancel).not.toHaveBeenCalled();
  });

  it("日本語入力の変換中にEscapeを押しても閉じない（入力内容を失わない）", () => {
    const onCancel = jest.fn();
    render(<RoutineForm {...defaultProps} onCancel={onCancel} />);

    // 変換候補を取り消すためのEscapeでフォームごと閉じてしまわないこと
    fireEvent.keyDown(document, { key: "Escape", isComposing: true });

    expect(onCancel).not.toHaveBeenCalled();
  });
});
