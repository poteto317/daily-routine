import { fireEvent, render, screen } from "@testing-library/react";
import { AccountCreateForm } from "../AccountCreateForm";
import { AccountEditForm } from "../AccountEditForm";
import { AccountsTable } from "../AccountsTable";

const account = {
  uid: "u1",
  email: "user@example.com",
  displayName: "ユーザー",
  isAdmin: true,
  isAnonymous: false,
  isTestUser: false,
  createdAt: "2026-03-07T00:00:00.000Z",
  updatedAt: "2026-03-07T00:00:00.000Z",
};

describe("account-admin forms and table", () => {
  it("AccountCreateFormの入力と操作を委譲する", () => {
    const onSubmit = jest.fn();
    const onCancel = jest.fn();
    const setCreateEmail = jest.fn();
    const setCreatePassword = jest.fn();
    const setCreateDisplayName = jest.fn();
    const setCreateIsAdmin = jest.fn();

    render(
      <AccountCreateForm
        actionLoading={false}
        createEmail="user@example.com"
        createPassword="secret123"
        createDisplayName="ユーザー"
        createIsAdmin={false}
        onSubmit={onSubmit}
        onCancel={onCancel}
        setCreateEmail={setCreateEmail}
        setCreatePassword={setCreatePassword}
        setCreateDisplayName={setCreateDisplayName}
        setCreateIsAdmin={setCreateIsAdmin}
      />,
    );

    fireEvent.change(screen.getByDisplayValue("user@example.com"), {
      target: { value: "next@example.com" },
    });
    fireEvent.change(screen.getByDisplayValue("secret123"), {
      target: { value: "newsecret" },
    });
    fireEvent.change(screen.getByDisplayValue("ユーザー"), {
      target: { value: "新ユーザー" },
    });
    fireEvent.click(screen.getByLabelText("管理者権限を付与"));
    fireEvent.submit(
      screen.getByRole("button", { name: "作成" }).closest("form")!,
    );
    fireEvent.click(screen.getByRole("button", { name: "キャンセル" }));

    expect(setCreateEmail).toHaveBeenCalledWith("next@example.com");
    expect(setCreatePassword).toHaveBeenCalledWith("newsecret");
    expect(setCreateDisplayName).toHaveBeenCalledWith("新ユーザー");
    expect(setCreateIsAdmin).toHaveBeenCalledWith(true);
    expect(onSubmit).toHaveBeenCalled();
    expect(onCancel).toHaveBeenCalled();
  });

  it("AccountCreateFormはloading時ラベルを切り替える", () => {
    render(
      <AccountCreateForm
        actionLoading={true}
        createEmail=""
        createPassword=""
        createDisplayName=""
        createIsAdmin={false}
        onSubmit={jest.fn()}
        onCancel={jest.fn()}
        setCreateEmail={jest.fn()}
        setCreatePassword={jest.fn()}
        setCreateDisplayName={jest.fn()}
        setCreateIsAdmin={jest.fn()}
      />,
    );

    expect(screen.getByRole("button", { name: "作成中..." })).toBeDisabled();
  });

  it("AccountEditFormの入力とself制御を扱う", () => {
    const onSubmit = jest.fn();
    const onCancel = jest.fn();
    const setEditDisplayName = jest.fn();
    const setEditIsAdmin = jest.fn();

    const { rerender } = render(
      <AccountEditForm
        actionLoading={false}
        currentUid="u1"
        editingAccount={account}
        editDisplayName="ユーザー"
        editIsAdmin={true}
        onSubmit={onSubmit}
        onCancel={onCancel}
        setEditDisplayName={setEditDisplayName}
        setEditIsAdmin={setEditIsAdmin}
      />,
    );

    expect(
      screen.getByText("（自分自身の権限は変更できません）"),
    ).toBeInTheDocument();
    expect(screen.getByRole("checkbox")).toBeDisabled();

    rerender(
      <AccountEditForm
        actionLoading={false}
        currentUid="u2"
        editingAccount={account}
        editDisplayName="ユーザー"
        editIsAdmin={true}
        onSubmit={onSubmit}
        onCancel={onCancel}
        setEditDisplayName={setEditDisplayName}
        setEditIsAdmin={setEditIsAdmin}
      />,
    );

    fireEvent.change(screen.getByDisplayValue("ユーザー"), {
      target: { value: "更新後" },
    });
    fireEvent.click(screen.getByRole("checkbox"));
    fireEvent.submit(
      screen.getByRole("button", { name: "更新" }).closest("form")!,
    );
    fireEvent.click(screen.getByRole("button", { name: "キャンセル" }));

    expect(setEditDisplayName).toHaveBeenCalledWith("更新後");
    expect(setEditIsAdmin).toHaveBeenCalledWith(false);
    expect(onSubmit).toHaveBeenCalled();
    expect(onCancel).toHaveBeenCalled();
  });

  it("AccountsTableの空状態と行操作を扱う", async () => {
    const onStartEdit = jest.fn();
    const onDelete = jest.fn().mockResolvedValue(undefined);

    const { rerender } = render(
      <AccountsTable
        accounts={[]}
        actionLoading={false}
        currentUid="u2"
        onStartEdit={onStartEdit}
        onDelete={onDelete}
      />,
    );

    expect(
      screen.getByText("アカウントが登録されていません"),
    ).toBeInTheDocument();

    rerender(
      <AccountsTable
        accounts={[account]}
        actionLoading={false}
        currentUid="u2"
        onStartEdit={onStartEdit}
        onDelete={onDelete}
      />,
    );

    expect(screen.getByText("登録済みアカウント（1件）")).toBeInTheDocument();
    expect(screen.getByText("user@example.com")).toBeInTheDocument();
    expect(screen.getByText("ユーザー")).toBeInTheDocument();
    expect(screen.getByText("管理者")).toBeInTheDocument();
    expect(screen.getByText("通常")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "✏️" }));
    fireEvent.click(screen.getByRole("button", { name: "🗑️" }));

    expect(onStartEdit).toHaveBeenCalledWith(account);
    expect(onDelete).toHaveBeenCalledWith(account);
  });

  it("AccountsTableはself削除やloadingで削除を無効化する", () => {
    const { rerender } = render(
      <AccountsTable
        accounts={[account]}
        actionLoading={false}
        currentUid="u1"
        onStartEdit={jest.fn()}
        onDelete={jest.fn()}
      />,
    );

    expect(screen.getByRole("button", { name: "🗑️" })).toBeDisabled();

    rerender(
      <AccountsTable
        accounts={[account]}
        actionLoading={true}
        currentUid="u2"
        onStartEdit={jest.fn()}
        onDelete={jest.fn()}
      />,
    );

    expect(screen.getByRole("button", { name: "🗑️" })).toBeDisabled();
  });
});
