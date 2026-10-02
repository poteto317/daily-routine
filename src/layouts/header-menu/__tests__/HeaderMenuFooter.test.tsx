import { render, screen, fireEvent } from "@testing-library/react";
import { HeaderMenuFooter } from "../HeaderMenuFooter";
import { uiTextConfig } from "@/config";
import type { User } from "firebase/auth";

describe("HeaderMenuFooter", () => {
  const defaultProps = {
    user: null,
    logoutItemIndex: 5,
    setMenuItemRef: jest.fn(),
    onLogoutClick: jest.fn(),
    onMenuItemKeyDown: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("未ログイン時はユーザー情報を表示せず、ログアウトボタンを表示する", () => {
    render(<HeaderMenuFooter {...defaultProps} />);

    expect(screen.queryByText("👤")).not.toBeInTheDocument();
    expect(
      screen.getByRole("menuitem", { name: new RegExp(uiTextConfig.auth.logout.button) }),
    ).toBeInTheDocument();
  });

  it("匿名ユーザーの場合は匿名ユーザー表示を行う", () => {
    const anonymousUser = {
      isAnonymous: true,
      email: null,
    } as unknown as User;

    render(<HeaderMenuFooter {...defaultProps} user={anonymousUser} />);

    expect(screen.getByText(uiTextConfig.auth.anonymousUserFull)).toBeInTheDocument();
  });

  it("メールアドレスを持つユーザーの場合はメールアドレスを表示する", () => {
    const emailUser = {
      isAnonymous: false,
      email: "test@example.com",
    } as unknown as User;

    render(<HeaderMenuFooter {...defaultProps} user={emailUser} />);

    expect(screen.getByText("test@example.com")).toBeInTheDocument();
  });

  it("ログアウトボタンをクリックするとonLogoutClickが呼ばれる", () => {
    render(<HeaderMenuFooter {...defaultProps} />);

    const logoutButton = screen.getByRole("menuitem");
    fireEvent.click(logoutButton);

    expect(defaultProps.onLogoutClick).toHaveBeenCalledTimes(1);
  });

  it("ログアウトボタンでキー操作するとonMenuItemKeyDownが呼ばれる", () => {
    render(<HeaderMenuFooter {...defaultProps} />);

    const logoutButton = screen.getByRole("menuitem");
    fireEvent.keyDown(logoutButton, { key: "ArrowDown" });

    expect(defaultProps.onMenuItemKeyDown).toHaveBeenCalledTimes(1);
  });
});
