import { fireEvent, screen } from "@testing-library/react";
import {
  cleanupHeaderTestDefaults,
  mockOnNavigateAction,
  mockOnToggleEditModeAction,
  renderHeader,
  setupHeaderTestDefaults,
} from "./Header.test-setup";

describe("Header mode and page", () => {
  beforeEach(() => {
    setupHeaderTestDefaults();
  });

  afterEach(() => {
    cleanupHeaderTestDefaults();
  });

  it("タイトルクリックでホームに遷移", () => {
    renderHeader();

    const titleButton = screen
      .getByText("デイリールーティン")
      .closest("button");
    fireEvent.click(titleButton!);

    expect(mockOnNavigateAction).toHaveBeenCalledWith("home");
  });

  it("編集モードのトグルが動作する", () => {
    renderHeader({ isEditMode: true });

    const toggleButton = screen.getByTitle("表示モードに切り替え");
    fireEvent.click(toggleButton);

    expect(mockOnToggleEditModeAction).toHaveBeenCalledTimes(1);
  });

  it("表示モードのトグルが動作する", () => {
    renderHeader({ isEditMode: false });

    const toggleButton = screen.getByTitle("編集モードに切り替え");
    fireEvent.click(toggleButton);

    expect(mockOnToggleEditModeAction).toHaveBeenCalledTimes(1);
  });

  it("ページが変わってもヘッダー表示は維持される", () => {
    renderHeader({ currentPage: "statistics" });
    expect(screen.getByText("デイリールーティン")).toBeInTheDocument();
  });
});
