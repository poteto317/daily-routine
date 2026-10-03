import { render, screen } from "@testing-library/react";
import { ApiKeySection } from "../ApiKeySection";
import texts from "@/features/api-key/locales/ja.json";
import * as apiKey from "@/features/api-key";

jest.mock("@/features/api-key", () => ({ useApiKeyState: jest.fn() }));
const mockedUseApiKeyState = jest.mocked(apiKey.useApiKeyState);

const baseState = {
  hasKey: false,
  issuedKey: null,
  isWorking: false,
  error: null,
  copied: false,
  handleIssue: jest.fn(),
  handleRevoke: jest.fn(),
  handleCopy: jest.fn(),
};

describe("ApiKeySection", () => {
  it("未発行なら「キーを発行」だけを出す", () => {
    mockedUseApiKeyState.mockReturnValue(baseState);
    render(<ApiKeySection />);
    expect(screen.getByText(texts.statusNone)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: texts.issueButton }),
    ).toBeEnabled();
    expect(
      screen.queryByRole("button", { name: texts.revokeButton }),
    ).toBeNull();
  });

  it("発行済みなら再発行と失効を出す", () => {
    mockedUseApiKeyState.mockReturnValue({ ...baseState, hasKey: true });
    render(<ApiKeySection />);
    expect(screen.getByText(texts.statusIssued)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: texts.reissueButton }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: texts.revokeButton }),
    ).toBeInTheDocument();
  });

  it("発行直後はキーと注意文とコピーボタンを出す", () => {
    mockedUseApiKeyState.mockReturnValue({
      ...baseState,
      hasKey: true,
      issuedKey: "drk_secret",
    });
    render(<ApiKeySection />);
    expect(screen.getByText(texts.issuedNotice)).toBeInTheDocument();
    expect(screen.getByDisplayValue("drk_secret")).toHaveAttribute("readonly");
    expect(
      screen.getByRole("button", { name: texts.copyButton }),
    ).toBeInTheDocument();
  });

  it("確認中は状態ラベル、エラー時はメッセージを出す", () => {
    mockedUseApiKeyState.mockReturnValue({
      ...baseState,
      hasKey: null,
      error: "失敗",
    });
    render(<ApiKeySection />);
    expect(screen.getByText(texts.statusLoading)).toBeInTheDocument();
    expect(screen.getByText("失敗")).toBeInTheDocument();
  });

  it("処理中はボタンを無効にする", () => {
    mockedUseApiKeyState.mockReturnValue({ ...baseState, isWorking: true });
    render(<ApiKeySection />);
    expect(
      screen.getByRole("button", { name: texts.issueButton }),
    ).toBeDisabled();
  });
});
