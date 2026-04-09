import {
  render,
  screen,
  fireEvent,
  waitFor,
  within,
} from "@testing-library/react";
import { setupSettingsPageMocks } from "./SettingsPage.test.utils";
import { SettingsPage } from "../SettingsPage";

describe("SettingsPage render/autosave", () => {
  const { mockSaveSettings } = setupSettingsPageMocks();

  it("設定ページが正しくレンダリングされる", () => {
    render(<SettingsPage />);
    expect(screen.getByText("⚙️ 設定")).toBeInTheDocument();
  });

  it("デフォルト値とポモドーロ設定が表示される", () => {
    render(<SettingsPage />);
    const durationSection = screen
      .getByText("デフォルト所要時間（分）")
      .closest("div")!;
    expect(within(durationSection).getByRole("spinbutton")).toHaveValue(30);
    const bgRefreshSection = screen
      .getByText("バックグラウンド復帰リフレッシュ間隔（分）")
      .closest("div")!;
    expect(within(bgRefreshSection).getByRole("spinbutton")).toHaveValue(30);
    expect(screen.getByDisplayValue("0")).toBeInTheDocument();
    expect(screen.getByText("🍅 ポモドーロタイマー設定")).toBeInTheDocument();
    expect(screen.getByDisplayValue("25")).toBeInTheDocument();
    expect(screen.getByDisplayValue("5")).toBeInTheDocument();
  });

  it("保存ボタンは表示されない", () => {
    render(<SettingsPage />);
    expect(screen.queryByRole("button", { name: /^保存$/ })).toBeNull();
  });

  it("メニュー並び順の対象に各TodoリストとTodoリスト管理が表示される", () => {
    render(<SettingsPage />);

    expect(screen.getByText("買い物")).toBeInTheDocument();
    expect(screen.getByText("仕事")).toBeInTheDocument();
    expect(screen.getByText("Todoリスト管理")).toBeInTheDocument();
  });

  it("入力変更は即時保存される", async () => {
    render(<SettingsPage />);
    const [durationInput] = screen.getAllByRole("spinbutton");
    fireEvent.change(durationInput, {
      target: { value: "45" },
    });

    await waitFor(() => {
      expect(mockSaveSettings).toHaveBeenCalledWith(
        expect.objectContaining({
          defaultDurationMinutes: 45,
          defaultNotificationMinutes: 0,
        }),
      );
    });
  });

  it("不正入力でバリデーションエラーが表示される", () => {
    render(<SettingsPage />);
    const [durationInput, notificationInput] =
      screen.getAllByRole("spinbutton");

    fireEvent.change(durationInput, {
      target: { value: "0" },
    });
    fireEvent.change(notificationInput, {
      target: { value: "200" },
    });
    expect(
      screen.getByText("1～1440分の範囲で入力してください"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("0～120分の範囲で入力してください（0は通知なし）"),
    ).toBeInTheDocument();
  });

  it("テーマを変更すると即時保存される", async () => {
    render(<SettingsPage />);
    fireEvent.click(screen.getByText("ダークモード"));
    await waitFor(() => {
      expect(mockSaveSettings).toHaveBeenCalledWith(
        expect.objectContaining({
          theme: "dark",
        }),
      );
    });
  });
});
