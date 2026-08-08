import {
  render,
  screen,
  fireEvent,
  waitFor,
  within,
} from "@testing-library/react";
import {
  defaultSettings,
  setupSettingsPageMocks,
} from "./SettingsPage.test.utils";
import { SettingsPage } from "../SettingsPage";

describe("SettingsPage features", () => {
  const {
    mockGetSettings,
    mockGetRoutines,
    mockGetDailyProgress,
    mockGetMonthlyHistory,
    mockSaveSettings,
  } = setupSettingsPageMocks();

  beforeEach(() => {
    mockGetRoutines.mockReturnValue([{ id: "1", title: "Routine 1" }]);
    mockGetDailyProgress.mockReturnValue({});
    mockGetMonthlyHistory.mockReturnValue({});
    global.URL.createObjectURL = jest.fn(() => "blob:test");
    global.URL.revokeObjectURL = jest.fn();
  });

  it("データ管理セクションとエクスポート項目が表示される", () => {
    render(<SettingsPage />);
    expect(screen.getByText(/データ管理/)).toBeInTheDocument();
    const routinesCheckbox = screen
      .getAllByRole("checkbox")
      .find((checkbox) =>
        checkbox.closest("label")?.textContent?.includes("ルーティン"),
      );
    expect(routinesCheckbox).toBeInTheDocument();
  });

  it("通知テストボタンが表示される", async () => {
    render(<SettingsPage />);
    await waitFor(() => {
      expect(screen.getByText(/通知をテスト/)).toBeInTheDocument();
    });
  });

  it("機能表示設定に同期履歴管理・テストマトリクス・アカウント管理が表示される", () => {
    render(<SettingsPage />);

    expect(screen.getByText(/同期履歴管理/)).toBeInTheDocument();
    expect(screen.getByText(/テストマトリクス/)).toBeInTheDocument();
    expect(screen.getByText(/アカウント管理/)).toBeInTheDocument();
  });

  it("不具合報告フォームはハンバーガーメニューへ移動したため表示されないが、メニュー並び替えUIには項目として残る", () => {
    render(<SettingsPage />);

    // フォーム自体は設定画面から消えている
    expect(
      screen.queryByRole("button", { name: "報告を送信" }),
    ).not.toBeInTheDocument();

    // メニュー並び替えUI（MenuOrderSection）には並べ替え対象の項目として残る
    expect(screen.getByText("不具合を報告")).toBeInTheDocument();
  });

  it("ポモドーロ設定は保存ボタンなしで即時保存される", async () => {
    render(<SettingsPage />);
    const focusInput = screen
      .getByText("集中時間（分）")
      .closest("div")
      ?.querySelector("input");
    const breakInput = screen
      .getByText("休憩時間（分）")
      .closest("div")
      ?.querySelector("input");
    fireEvent.change(focusInput!, { target: { value: "30" } });
    fireEvent.change(breakInput!, { target: { value: "10" } });
    await waitFor(() => {
      expect(mockSaveSettings).toHaveBeenCalledWith(
        expect.objectContaining({
          pomodoroFocusMinutes: 30,
          pomodoroBreakMinutes: 10,
        }),
      );
    });
  });

  it("保存済み設定が初期値として反映される", () => {
    mockGetSettings.mockReturnValue({
      ...defaultSettings,
      defaultDurationMinutes: 45,
      defaultNotificationMinutes: 15,
      pomodoroFocusMinutes: 30,
      pomodoroBreakMinutes: 10,
      theme: "dark",
      swipeAction: "edit",
    });
    render(<SettingsPage />);
    expect(screen.getByDisplayValue("45")).toBeInTheDocument();
    expect(screen.getByDisplayValue("15")).toBeInTheDocument();
    const focusSection = screen.getByText("集中時間（分）").closest("div")!;
    expect(within(focusSection).getByRole("spinbutton")).toHaveValue(30);
    const bgRefreshSection = screen
      .getByText("バックグラウンド復帰リフレッシュ間隔（分）")
      .closest("div")!;
    expect(within(bgRefreshSection).getByRole("spinbutton")).toHaveValue(30);
    expect(screen.getByDisplayValue("10")).toBeInTheDocument();
  });
});
