import { render, screen } from "@testing-library/react";
import { TodoListProgressBar } from "../TodoListProgressBar";

describe("TodoListProgressBar", () => {
  it("total > 0 のとき進捗バーを表示する", () => {
    render(<TodoListProgressBar completed={3} total={5} percentage={60} />);
    expect(screen.getByText("3/5 完了")).toBeInTheDocument();
    expect(screen.getByText("60%")).toBeInTheDocument();
  });

  it("total = 0 のときは何もレンダリングしない", () => {
    const { container } = render(
      <TodoListProgressBar completed={0} total={0} percentage={0} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it("パーセンテージが正しく表示される", () => {
    render(<TodoListProgressBar completed={1} total={4} percentage={25} />);
    expect(screen.getByText("25%")).toBeInTheDocument();
  });

  it("completed/total のテキストが正しくフォーマットされる", () => {
    render(<TodoListProgressBar completed={0} total={10} percentage={0} />);
    expect(screen.getByText("0/10 完了")).toBeInTheDocument();
  });

  it("100% のとき全て完了テキストを表示する", () => {
    render(<TodoListProgressBar completed={5} total={5} percentage={100} />);
    expect(screen.getByText("5/5 完了")).toBeInTheDocument();
    expect(screen.getByText("100%")).toBeInTheDocument();
  });
});
