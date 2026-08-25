import { render, screen } from "@testing-library/react";
import { SettingsPage } from "../lazyPageComponents";

describe("lazyPageComponents", () => {
  it("機能ページは読み込み表示を経て描画される", async () => {
    render(<SettingsPage />);

    expect(screen.getByRole("status")).toHaveTextContent(
      "画面を読み込んでいます...",
    );
    expect(await screen.findByText("⚙️ 設定")).toBeInTheDocument();
  });
});
