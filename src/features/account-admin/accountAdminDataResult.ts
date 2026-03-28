type DataState = ReturnType<
  typeof import("./useAccountAdminDataState").useAccountAdminDataState
>;

type CreateAccountAdminDataResultArgs = {
  dataState: DataState;
};

export const createAccountAdminDataResult = ({
  dataState,
}: CreateAccountAdminDataResultArgs) => ({
  accounts: dataState.accounts,
  clearError: dataState.clearError,
  error: dataState.error,
  isAdmin: dataState.isAdmin,
  loadAccounts: dataState.loadAccounts,
  loading: dataState.loading,
  reportError: dataState.reportError,
});
