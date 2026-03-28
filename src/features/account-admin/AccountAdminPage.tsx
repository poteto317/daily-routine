"use client";

import { useAuth } from "@/features/auth";
import { AccountAdminAccessDenied } from "./AccountAdminAccessDenied";
import { AccountAdminErrorAlert } from "./AccountAdminErrorAlert";
import { AccountAdminHeader } from "./AccountAdminHeader";
import { AccountAdminLegend } from "./AccountAdminLegend";
import { AccountAdminLoading } from "./AccountAdminLoading";
import { AccountAdminToolbar } from "./AccountAdminToolbar";
import { AccountCreateForm } from "./AccountCreateForm";
import { AccountEditForm } from "./AccountEditForm";
import { AccountsTable } from "./AccountsTable";
import { useAccountAdminPageState } from "./useAccountAdminPageState";

/**
 * アカウント管理ページ
 * 管理者のみがアクセス可能
 */
export const AccountAdminPage = () => {
  const { user } = useAuth();
  const state = useAccountAdminPageState(user?.uid);

  if (!state.isAdmin && !state.loading) {
    return <AccountAdminAccessDenied />;
  }

  if (state.loading) {
    return <AccountAdminLoading />;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 pb-20">
      <AccountAdminHeader />
      {state.error && (
        <AccountAdminErrorAlert
          error={state.error}
          onClose={state.clearError}
        />
      )}
      <AccountAdminToolbar
        onToggleCreateForm={state.toggleCreateForm}
        onRefresh={state.loadAccounts}
      />
      {state.showCreateForm && (
        <AccountCreateForm
          actionLoading={state.actionLoading}
          createDisplayName={state.createDisplayName}
          createEmail={state.createEmail}
          createIsAdmin={state.createIsAdmin}
          createPassword={state.createPassword}
          onSubmit={state.handleCreate}
          onCancel={state.closeCreateForm}
          setCreateDisplayName={state.setCreateDisplayName}
          setCreateEmail={state.setCreateEmail}
          setCreateIsAdmin={state.setCreateIsAdmin}
          setCreatePassword={state.setCreatePassword}
        />
      )}
      {state.editingAccount && (
        <AccountEditForm
          actionLoading={state.actionLoading}
          currentUid={state.currentUid}
          editingAccount={state.editingAccount}
          editDisplayName={state.editDisplayName}
          editIsAdmin={state.editIsAdmin}
          onSubmit={state.handleUpdate}
          onCancel={state.cancelEdit}
          setEditDisplayName={state.setEditDisplayName}
          setEditIsAdmin={state.setEditIsAdmin}
        />
      )}
      <AccountsTable
        accounts={state.accounts}
        actionLoading={state.actionLoading}
        currentUid={state.currentUid}
        onStartEdit={state.startEdit}
        onDelete={state.handleDelete}
      />
      <AccountAdminLegend />
    </div>
  );
};
