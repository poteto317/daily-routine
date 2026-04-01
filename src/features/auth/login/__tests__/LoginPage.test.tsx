import { render, screen } from "@testing-library/react";

let mockIsFirebaseConfigured = true;

jest.mock("@/components", () => ({
  CardPanel: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

jest.mock("@/lib/firebase", () => ({
  get isFirebaseConfigured() {
    return mockIsFirebaseConfigured;
  },
}));

jest.mock("../useLoginPageState", () => ({
  useLoginPageState: jest.fn(() => ({
    email: "user@example.com",
    password: "secret123",
    error: null,
    loading: false,
    isSignUp: false,
    handleSubmit: jest.fn(),
    handleEmailChange: jest.fn(),
    handlePasswordChange: jest.fn(),
    handleAnonymousLogin: jest.fn(),
    handleTestLogin: jest.fn(),
    toggleMode: jest.fn(),
  })),
}));

import { LoginPage } from "../LoginPage";

describe("LoginPage", () => {
  beforeEach(() => {
    mockIsFirebaseConfigured = true;
  });

  it("Firebase 未設定時はローカルモード案内を表示し、ログイン操作は可能なままにする", () => {
    mockIsFirebaseConfigured = false;

    render(<LoginPage />);

    expect(
      screen.getByText("ローカルモードでログインできます"),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "ログイン" })).toBeEnabled();
    expect(
      screen.getByRole("button", { name: "匿名でログイン" }),
    ).toBeEnabled();
    expect(
      screen.getByRole("button", { name: "テストアカウントでログイン" }),
    ).toBeEnabled();
  });

  it("Firebase 設定済みならローカルモード案内を表示しない", () => {
    render(<LoginPage />);

    expect(
      screen.queryByText("ローカルモードでログインできます"),
    ).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "ログイン" })).toBeEnabled();
  });
});
