import { fireEvent, render, screen } from "@testing-library/react";
import { AccountAdminAccessDenied } from "../AccountAdminAccessDenied";
import { AccountAdminErrorAlert } from "../AccountAdminErrorAlert";
import { AccountAdminHeader } from "../AccountAdminHeader";
import { AccountAdminLegend } from "../AccountAdminLegend";
import { AccountAdminLoading } from "../AccountAdminLoading";
import { AccountAdminToolbar } from "../AccountAdminToolbar";

describe("account-admin components", () => {
  it("headerとloadingを描画する", () => {
    render(
      <>
        <AccountAdminHeader />
        <AccountAdminLoading />
      </>,
    );

    expect(screen.getByText("👥 アカウント管理")).toBeInTheDocument();
    expect(screen.getByText("ユーザーアカウントの作成・編集・削除を行います")).toBeInTheDocument();
    expect(screen.getByText("読み込み中...")).toBeInTheDocument();
  });

  it("toolbarの操作を呼び出す", async () => {
    const onToggleCreateForm = jest.fn();
    const onRefresh = jest.fn().mockResolvedValue(undefined);

    render(
      <AccountAdminToolbar
        onToggleCreateForm={onToggleCreateForm}
        onRefresh={onRefresh}
      />,
    );

    fireEvent.click(screen.getByText("➕ 新規アカウント作成"));
    fireEvent.click(screen.getByText("🔄 更新"));

    expect(onToggleCreateForm).toHaveBeenCalled();
    expect(onRefresh).toHaveBeenCalled();
  });

  it("error alertの閉じる操作を呼び出す", () => {
    const onClose = jest.fn();
    render(<AccountAdminErrorAlert error="エラーです" onClose={onClose} />);

    expect(screen.getByText("エラーです")).toBeInTheDocument();
    fireEvent.click(screen.getByText("閉じる"));
    expect(onClose).toHaveBeenCalled();
  });

  it("access deniedとlegendを表示する", () => {
    render(
      <>
        <AccountAdminAccessDenied />
        <AccountAdminLegend />
      </>,
    );

    expect(screen.getByText("アクセス権限がありません")).toBeInTheDocument();
    expect(screen.getByText("このページは管理者のみアクセスできます。")).toBeInTheDocument();
    expect(screen.getByText("注意事項")).toBeInTheDocument();
    expect(
      screen.getByText(/新規アカウント作成後はセッション切替のため再ログインが必要です/),
    ).toBeInTheDocument();
    expect(screen.getByText(/自分自身のアカウントは削除できません/)).toBeInTheDocument();
  });
});
