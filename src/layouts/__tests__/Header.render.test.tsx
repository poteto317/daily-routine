import { screen } from "@testing-library/react";
import {
  cleanupHeaderTestDefaults,
  renderHeader,
  setupHeaderTestDefaults,
} from "./Header.test-setup";

describe("Header render", () => {
  beforeEach(() => {
    setupHeaderTestDefaults();
  });

  afterEach(() => {
    cleanupHeaderTestDefaults();
  });

  it("ヘッダーにタイトルが表示される", () => {
    renderHeader();
    expect(screen.getByText("デイリールーティン")).toBeInTheDocument();
  });

  it("絵文字アイコンが表示される", () => {
    renderHeader();
    expect(screen.getByText("📅")).toBeInTheDocument();
  });

  it("アップロード/ダウンロードボタンが表示される", () => {
    renderHeader();
    expect(screen.getByLabelText("クラウドへアップロード")).toBeInTheDocument();
    expect(
      screen.getByLabelText("クラウドからダウンロード"),
    ).toBeInTheDocument();
  });
});
