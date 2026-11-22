import { useState } from "react";
import { render, screen } from "@testing-library/react";
import { AuthGuard } from "../AuthGuard";
import { useAuth } from "@/features/auth";
import texts from "../locales/ja.json";

jest.mock("@/features/auth", () => ({
  useAuth: jest.fn(),
  LoginPage: () => <div data-testid="login-page">ログインページ</div>,
}));

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

describe("AuthGuard", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const createMockAuth = (overrides = {}) => ({
    user: null,
    loading: false,
    isAdmin: false,
    isAdminLoading: false,
    signIn: jest.fn(),
    signUp: jest.fn(),
    signOut: jest.fn(),
    signInAnonymous: jest.fn(),
    signInAsTestUser: jest.fn(),
    ...overrides,
  });

  it("読み込み中はフルスクリーンローディング画面を表示する", () => {
    mockUseAuth.mockReturnValue(createMockAuth({ loading: true }));

    render(
      <AuthGuard>
        <div>保護コンテンツ</div>
      </AuthGuard>,
    );

    expect(screen.getByText(texts.authGuard.loading)).toBeInTheDocument();
    expect(screen.queryByText("保護コンテンツ")).not.toBeInTheDocument();
  });

  it("未認証の場合はログインページを表示する", () => {
    mockUseAuth.mockReturnValue(createMockAuth({ loading: false, user: null }));

    render(
      <AuthGuard>
        <div>保護コンテンツ</div>
      </AuthGuard>,
    );

    expect(screen.getByTestId("login-page")).toBeInTheDocument();
    expect(screen.queryByText("保護コンテンツ")).not.toBeInTheDocument();
  });

  it("認証済みの場合は保護されたコンテンツを表示する", () => {
    mockUseAuth.mockReturnValue(
      createMockAuth({
        loading: false,
        user: { uid: "user-123", email: "test@example.com" } as never,
      }),
    );

    render(
      <AuthGuard>
        <div>保護コンテンツ</div>
      </AuthGuard>,
    );

    expect(screen.getByText("保護コンテンツ")).toBeInTheDocument();
    expect(screen.queryByTestId("login-page")).not.toBeInTheDocument();
  });

  it("UID 切り替え時に保護された画面の状態を作り直す", () => {
    let mounts = 0;
    const Protected = () => {
      const [value] = useState(() => ++mounts);
      return <span>{value}</span>;
    };
    const content = (
      <AuthGuard>
        <Protected />
      </AuthGuard>
    );
    mockUseAuth.mockReturnValue(createMockAuth({ user: { uid: "a" } }));
    const view = render(content);
    expect(screen.getByText("1")).toBeInTheDocument();

    mockUseAuth.mockReturnValue(createMockAuth({ user: { uid: "b" } }));
    view.rerender(
      <AuthGuard>
        <Protected />
      </AuthGuard>,
    );
    expect(screen.getByText("2")).toBeInTheDocument();
  });
});
