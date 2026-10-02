import { render, screen } from "@testing-library/react";
import { AccountAdminPage } from "../AccountAdminPage";
import { useAuth } from "@/features/auth";
import { useAccountAdminPageState } from "../useAccountAdminPageState";

jest.mock("@/features/auth");
jest.mock("../useAccountAdminPageState");

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
const mockUseAccountAdminPageState =
  useAccountAdminPageState as jest.MockedFunction<
    typeof useAccountAdminPageState
  >;

describe("AccountAdminPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuth.mockReturnValue({
      user: { uid: "admin-uid" } as never,
      loading: false,
      isAdmin: true,
      isAdminLoading: false,
      signIn: jest.fn(),
      signUp: jest.fn(),
      signOut: jest.fn(),
      signInAnonymous: jest.fn(),
      signInAsTestUser: jest.fn(),
    });
  });

  it("管理者権限がない場合はアクセス拒否コンポーネントを表示する", () => {
    mockUseAccountAdminPageState.mockReturnValue({
      isAdmin: false,
      loading: false,
    } as never);

    render(<AccountAdminPage />);

    expect(screen.getByText("アクセス権限がありません")).toBeInTheDocument();
  });

  it("読み込み中の場合はローディングコンポーネントを表示する", () => {
    mockUseAccountAdminPageState.mockReturnValue({
      isAdmin: true,
      loading: true,
    } as never);

    render(<AccountAdminPage />);

    expect(screen.getByText("読み込み中...")).toBeInTheDocument();
  });

  it("管理者で読み込み完了時はアカウント一覧画面を表示する", () => {
    mockUseAccountAdminPageState.mockReturnValue({
      isAdmin: true,
      loading: false,
      error: null,
      accounts: [],
      currentUid: "admin-uid",
      actionLoading: null,
      showCreateForm: false,
      editingAccount: null,
      loadAccounts: jest.fn(),
      toggleCreateForm: jest.fn(),
      clearError: jest.fn(),
      startEdit: jest.fn(),
      handleDelete: jest.fn(),
    } as never);

    render(<AccountAdminPage />);

    expect(screen.getByText(/アカウント管理/)).toBeInTheDocument();
  });

  it("エラーが存在する場合はエラーアラートを表示する", () => {
    mockUseAccountAdminPageState.mockReturnValue({
      isAdmin: true,
      loading: false,
      error: "アカウントの取得に失敗しました",
      accounts: [],
      currentUid: "admin-uid",
      actionLoading: null,
      showCreateForm: false,
      editingAccount: null,
      loadAccounts: jest.fn(),
      toggleCreateForm: jest.fn(),
      clearError: jest.fn(),
      startEdit: jest.fn(),
      handleDelete: jest.fn(),
    } as never);

    render(<AccountAdminPage />);

    expect(
      screen.getByText("アカウントの取得に失敗しました"),
    ).toBeInTheDocument();
  });
});
