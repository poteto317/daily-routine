import { fireEvent, screen, waitFor } from "@testing-library/react";
import {
  cleanupHeaderTestDefaults,
  mockOnNavigateAction,
  renderHeader,
  setupHeaderTestDefaults,
} from "./Header.test-setup";

describe("Header menu", () => {
  beforeEach(() => {
    setupHeaderTestDefaults();
  });

  afterEach(() => {
    cleanupHeaderTestDefaults();
  });

  it("メニューボタンはaria属性を持つ", () => {
    renderHeader();
    const menuButton = screen.getByLabelText("メニュー");
    expect(menuButton).toHaveAttribute("aria-expanded", "false");
    expect(menuButton).toHaveAttribute("aria-controls", "header-menu-panel");
  });

  it("メニュー開閉でaria-expandedが更新される", () => {
    renderHeader();
    const menuButton = screen.getByLabelText("メニュー");

    fireEvent.click(menuButton);
    expect(menuButton).toHaveAttribute("aria-expanded", "true");

    fireEvent.click(menuButton);
    expect(menuButton).toHaveAttribute("aria-expanded", "false");
  });

  it("メニュー展開時に先頭項目へフォーカスする", async () => {
    renderHeader();
    fireEvent.click(screen.getByLabelText("メニュー"));

    await waitFor(() => {
      expect(screen.getByText("ルーティン").closest("button")).toHaveFocus();
    });
  });

  it("Escapeキーでメニューが閉じる", () => {
    renderHeader();
    const menuButton = screen.getByLabelText("メニュー");

    fireEvent.click(menuButton);
    fireEvent.keyDown(menuButton, { key: "Escape" });

    expect(menuButton).toHaveAttribute("aria-expanded", "false");
    expect(menuButton).toHaveFocus();
  });

  it("メニューから設定に遷移できる", () => {
    renderHeader();
    fireEvent.click(screen.getByLabelText("メニュー"));
    fireEvent.click(screen.getByText("設定"));

    expect(mockOnNavigateAction).toHaveBeenCalledWith("settings");
  });

  it("メニューからTodoリスト管理に遷移できる", () => {
    renderHeader();
    fireEvent.click(screen.getByLabelText("メニュー"));
    fireEvent.click(screen.getByText("Todoリスト管理"));

    expect(mockOnNavigateAction).toHaveBeenCalledWith("todo-list-management");
  });
});
