import { render, screen } from "@testing-library/react";
import { LoadingIndicator } from "../LoadingIndicator";

describe("LoadingIndicator", () => {
  it("メッセージを表示する", () => {
    render(<LoadingIndicator message="読み込み中..." />);

    expect(screen.getByText("読み込み中...")).toBeInTheDocument();
  });

  it("サブメッセージを渡したときだけ表示する", () => {
    const { container, rerender } = render(
      <LoadingIndicator message="読み込み中..." />,
    );
    expect(container.querySelectorAll("p")).toHaveLength(1);

    rerender(
      <LoadingIndicator
        message="読み込み中..."
        subMessage="しばらくお待ちください"
      />,
    );

    expect(screen.getByText("しばらくお待ちください")).toBeInTheDocument();
    expect(container.querySelectorAll("p")).toHaveLength(2);
  });

  it("サブメッセージが空文字なら表示しない", () => {
    const { container } = render(
      <LoadingIndicator message="読み込み中..." subMessage="" />,
    );

    expect(container.querySelectorAll("p")).toHaveLength(1);
  });

  it("既定ではスピナーを回転させ、全体を中央寄せにする", () => {
    const { container } = render(<LoadingIndicator message="読み込み中..." />);
    const root = container.firstElementChild as HTMLElement;

    expect(root).toHaveClass("text-center");
    expect(root.firstElementChild).toHaveClass("animate-spin");
  });

  it("各要素のクラスを差し替えられる", () => {
    const { container } = render(
      <LoadingIndicator
        message="メイン"
        subMessage="サブ"
        containerClassName="custom-container"
        spinnerClassName="custom-spinner"
        messageClassName="custom-message"
        subMessageClassName="custom-sub"
      />,
    );
    const root = container.firstElementChild as HTMLElement;

    expect(root).toHaveClass("custom-container");
    expect(root).not.toHaveClass("text-center");
    expect(root.firstElementChild).toHaveClass("custom-spinner");
    expect(root.firstElementChild).not.toHaveClass("animate-spin");
    expect(screen.getByText("メイン")).toHaveClass("custom-message");
    expect(screen.getByText("サブ")).toHaveClass("custom-sub");
  });
});
