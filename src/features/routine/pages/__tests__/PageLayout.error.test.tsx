import { fireEvent, render, screen } from "@testing-library/react";
import { PageLayout } from "../PageLayout";
import { SettingsPage } from "../lazyPageComponents";

const resolvePageContentMock = jest.fn();

jest.mock("../pageComponentResolver", () => ({
  resolvePageContent: (page: string) => resolvePageContentMock(page),
}));

jest.mock("@/layouts", () => ({
  Header: () => <header>ヘッダー</header>,
}));

jest.mock("@/features/settings/SettingsPage", () => {
  throw new Error("chunk load failed");
});

const ThrowingPage = () => {
  throw new Error("chunk load failed");
};

const ResolvedPage = () => <main>カレンダーページ</main>;

describe("PageLayout page error handling", () => {
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    resolvePageContentMock.mockReturnValue(<ThrowingPage />);
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
    jest.clearAllMocks();
  });

  it("機能ページの非同期ロードに失敗してもページ領域に復旧手段を表示する", async () => {
    const onNavigateAction = jest.fn();
    resolvePageContentMock.mockReturnValue(<SettingsPage />);

    render(
      <PageLayout
        currentPage="settings"
        isEditMode={false}
        onNavigateAction={onNavigateAction}
        onToggleEditModeAction={jest.fn()}
      />,
    );

    expect(screen.getByRole("status")).toHaveTextContent(
      "画面を読み込んでいます...",
    );

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "画面を読み込めませんでした。",
    );
    const reloadButton = screen.getByRole("button", { name: "再読み込み" });
    expect(reloadButton.closest("form")).toHaveAttribute("action", "/");

    fireEvent.click(screen.getByRole("button", { name: "ホームへ戻る" }));
    expect(onNavigateAction).toHaveBeenCalledWith("home");
  });

  it("別の機能ページへ移動したときエラー状態をリセットする", () => {
    resolvePageContentMock.mockImplementation((page: string) =>
      page === "settings" ? <ThrowingPage /> : <ResolvedPage />,
    );
    const props = {
      isEditMode: false,
      onNavigateAction: jest.fn(),
      onToggleEditModeAction: jest.fn(),
    };
    const { rerender } = render(
      <PageLayout currentPage="settings" {...props} />,
    );

    expect(screen.getByRole("alert")).toBeInTheDocument();

    rerender(<PageLayout currentPage="calendar" {...props} />);

    expect(screen.getByText("カレンダーページ")).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});
