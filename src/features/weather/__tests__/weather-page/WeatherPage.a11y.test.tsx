import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { WEATHER_PAGE_TEXT } from "../../texts";
import {
  WeatherPage,
  restoreGeolocation,
  setupWeatherPageMocks,
  stubGeolocationFailure,
} from "./WeatherPage.test-setup";

describe("WeatherPage アクセシビリティ", () => {
  // 位置情報の取得失敗は実装が意図的に console.warn を出すため、
  // テスト出力をクリーンに保つ目的で抑制する。
  // アサーション失敗時もモックが後続テストへ漏れないよう afterEach で復元する。
  let consoleWarn: jest.SpyInstance;

  beforeEach(() => {
    setupWeatherPageMocks();
    consoleWarn = jest.spyOn(console, "warn").mockImplementation();
  });

  afterEach(() => {
    consoleWarn.mockRestore();
    // グローバルの差し替えを次のテストへ持ち越さない
    restoreGeolocation();
  });

  /** 位置情報エラーを発生させ、閉じるボタンが出るまで待つ */
  const renderWithLocationError = async () => {
    stubGeolocationFailure();
    render(<WeatherPage />);

    fireEvent.click(
      await screen.findByRole("button", { name: "現在地を使用" }),
    );
    await screen.findByRole("button", {
      name: WEATHER_PAGE_TEXT.dismissLocationErrorLabel,
    });
  };

  it("位置情報エラーの閉じるボタンはアクセシブルな名前を持ち、押すとエラーが消える", async () => {
    await renderWithLocationError();

    // ✕ という記号ではなく、意味のある名前でボタンを特定できる
    fireEvent.click(
      screen.getByRole("button", {
        name: WEATHER_PAGE_TEXT.dismissLocationErrorLabel,
      }),
    );

    await waitFor(() => {
      expect(
        screen.queryByRole("button", {
          name: WEATHER_PAGE_TEXT.dismissLocationErrorLabel,
        }),
      ).not.toBeInTheDocument();
    });
  });

  it("位置情報エラー表示中も含め、ページ内の全てのボタンがアクセシブルな名前を持つ", async () => {
    // 位置情報エラー時にだけ現れるボタンも検査対象に含めたいため、
    // あえてエラー状態にしてから全ボタンを走査する
    await renderWithLocationError();

    // aria-hidden な装飾（アイコン用の span 等）はアクセシブル名に寄与しないため、
    // 名前の有無を判定する際は除外して残りのテキストを見る
    const getAccessibleText = (button: HTMLElement) => {
      const clone = button.cloneNode(true) as HTMLElement;
      clone
        .querySelectorAll('[aria-hidden="true"]')
        .forEach((hidden) => hidden.remove());
      return clone.textContent?.trim() ?? "";
    };

    const namelessButtons = screen
      .getAllByRole("button")
      .filter(
        (button) =>
          !getAccessibleText(button) && !button.getAttribute("aria-label"),
      )
      .map((button) => button.outerHTML);

    expect(namelessButtons).toEqual([]);
  });
});
