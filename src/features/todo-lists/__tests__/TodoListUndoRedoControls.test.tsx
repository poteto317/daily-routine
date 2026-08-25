import { render, screen, fireEvent } from "@testing-library/react";
import { TodoListUndoRedoControls } from "../TodoListUndoRedoControls";

describe("TodoListUndoRedoControls", () => {
  it("「元に戻す」ボタンを表示する", () => {
    render(<TodoListUndoRedoControls />);
    expect(
      screen.getByRole("button", { name: "元に戻す" }),
    ).toBeInTheDocument();
  });

  it("「やり直す」ボタンを表示する", () => {
    render(<TodoListUndoRedoControls />);
    expect(
      screen.getByRole("button", { name: "やり直す" }),
    ).toBeInTheDocument();
  });

  it("canUndo=false の時「元に戻す」ボタンが disabled", () => {
    render(<TodoListUndoRedoControls canUndo={false} />);
    expect(screen.getByRole("button", { name: "元に戻す" })).toBeDisabled();
  });

  it("canUndo=true かつ onUndoAction 指定済みのとき「元に戻す」ボタンが有効", () => {
    render(
      <TodoListUndoRedoControls canUndo={true} onUndoAction={jest.fn()} />,
    );
    expect(screen.getByRole("button", { name: "元に戻す" })).not.toBeDisabled();
  });

  it("canUndo=true でも onUndoAction 未指定のとき「元に戻す」ボタンが disabled", () => {
    render(<TodoListUndoRedoControls canUndo={true} />);
    expect(screen.getByRole("button", { name: "元に戻す" })).toBeDisabled();
  });

  it("canRedo=false の時「やり直す」ボタンが disabled", () => {
    render(<TodoListUndoRedoControls canRedo={false} />);
    expect(screen.getByRole("button", { name: "やり直す" })).toBeDisabled();
  });

  it("canRedo=true かつ onRedoAction 指定済みのとき「やり直す」ボタンが有効", () => {
    render(
      <TodoListUndoRedoControls canRedo={true} onRedoAction={jest.fn()} />,
    );
    expect(screen.getByRole("button", { name: "やり直す" })).not.toBeDisabled();
  });

  it("canRedo=true でも onRedoAction 未指定のとき「やり直す」ボタンが disabled", () => {
    render(<TodoListUndoRedoControls canRedo={true} />);
    expect(screen.getByRole("button", { name: "やり直す" })).toBeDisabled();
  });

  it("props なしのデフォルト状態では両ボタンが disabled", () => {
    render(<TodoListUndoRedoControls />);
    expect(screen.getByRole("button", { name: "元に戻す" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "やり直す" })).toBeDisabled();
  });

  it("「元に戻す」ボタンクリックで onUndoAction が呼ばれる", () => {
    const onUndoAction = jest.fn();
    render(
      <TodoListUndoRedoControls onUndoAction={onUndoAction} canUndo={true} />,
    );
    fireEvent.click(screen.getByRole("button", { name: "元に戻す" }));
    expect(onUndoAction).toHaveBeenCalledTimes(1);
  });

  it("「やり直す」ボタンクリックで onRedoAction が呼ばれる", () => {
    const onRedoAction = jest.fn();
    render(
      <TodoListUndoRedoControls onRedoAction={onRedoAction} canRedo={true} />,
    );
    fireEvent.click(screen.getByRole("button", { name: "やり直す" }));
    expect(onRedoAction).toHaveBeenCalledTimes(1);
  });

  it("disabled 時には onClick を渡しても呼ばれない", () => {
    const onUndoAction = jest.fn();
    render(
      <TodoListUndoRedoControls onUndoAction={onUndoAction} canUndo={false} />,
    );
    fireEvent.click(screen.getByRole("button", { name: "元に戻す" }));
    expect(onUndoAction).not.toHaveBeenCalled();
  });
});
