import texts from "./locales/ja.json";

// Header
export const ACCOUNT_ADMIN_HEADER_TEXT = {
  title: texts.header.title,
  description: texts.header.description,
  loading: texts.header.loading,
} as const;

// Access Denied
export const ACCOUNT_ADMIN_ACCESS_DENIED_TEXT = {
  icon: texts.accessDenied.icon,
  title: texts.accessDenied.title,
  description: texts.accessDenied.description,
} as const;

// Error Alert
export const ACCOUNT_ADMIN_ERROR_ALERT_TEXT = {
  close: texts.errorAlert.close,
} as const;

// Toolbar
export const ACCOUNT_ADMIN_TOOLBAR_TEXT = {
  createAccount: texts.toolbar.createAccount,
  refresh: texts.toolbar.refresh,
} as const;

// Legend
export const ACCOUNT_ADMIN_LEGEND_TEXT = {
  title: texts.legend.title,
  items: texts.legend.items,
} as const;

// Messages
export const ACCOUNT_ADMIN_MESSAGES = {
  confirmDeleteAccount: (email: string) =>
    texts.messages.confirmDeleteAccountTemplate.replace("{email}", email),
  alertAccountCreated: texts.messages.alertAccountCreated,
} as const;

// Create Form
export const ACCOUNT_CREATE_TITLE = texts.createForm.title;
export const ACCOUNT_EMAIL_PLACEHOLDER = texts.createForm.emailPlaceholder;
export const ACCOUNT_PASSWORD_PLACEHOLDER = texts.createForm.passwordPlaceholder;
export const ACCOUNT_NAME_PLACEHOLDER = texts.createForm.namePlaceholder;
export const ACCOUNT_ADMIN_CHECKBOX_LABEL = texts.createForm.adminCheckboxLabel;
export const ACCOUNT_CREATE_SUBMIT_LABEL = texts.createForm.submitLabel;
export const ACCOUNT_CREATE_SUBMIT_LOADING_LABEL = texts.createForm.submitLoadingLabel;
export const ACCOUNT_CREATE_CANCEL_LABEL = texts.createForm.cancelLabel;

// Edit Form
export const ACCOUNT_EDIT_TITLE_PREFIX = texts.editForm.titlePrefix;
export const ACCOUNT_EDIT_NAME_PLACEHOLDER = texts.editForm.namePlaceholder;
export const ACCOUNT_EDIT_ADMIN_LABEL = texts.editForm.adminLabel;
export const ACCOUNT_EDIT_SELF_DISABLED_LABEL = texts.editForm.selfDisabledLabel;
export const ACCOUNT_EDIT_SUBMIT_LABEL = texts.editForm.submitLabel;
export const ACCOUNT_EDIT_SUBMIT_LOADING_LABEL = texts.editForm.submitLoadingLabel;
export const ACCOUNT_EDIT_CANCEL_LABEL = texts.editForm.cancelLabel;

// Table
export const ACCOUNT_TABLE_TITLE_PREFIX = texts.table.titlePrefix;
export const ACCOUNT_TABLE_TITLE_SUFFIX = texts.table.titleSuffix;
export const ACCOUNT_TABLE_EMPTY_LABEL = texts.table.emptyLabel;
export const ACCOUNT_TABLE_EDIT_LABEL = texts.table.editLabel;
export const ACCOUNT_TABLE_DELETE_LABEL = texts.table.deleteLabel;
export const ACCOUNT_EMAIL_EMPTY_LABEL = texts.table.emailEmptyLabel;
export const ACCOUNT_COMMON_EMPTY_LABEL = texts.table.commonEmptyLabel;

// Display Labels
export const ACCOUNT_DISPLAY_LABELS = {
  roleAdmin: texts.displayLabels.roleAdmin,
  roleUser: texts.displayLabels.roleUser,
  typeAnonymous: texts.displayLabels.typeAnonymous,
  typeTest: texts.displayLabels.typeTest,
  typeNormal: texts.displayLabels.typeNormal,
} as const;

// Error Messages
export const ACCOUNT_ADMIN_ERROR_MESSAGES = {
  loadAccountsFailed: texts.errors.loadAccountsFailed,
  createAccountFailed: texts.errors.createAccountFailed,
  updateAccountFailed: texts.errors.updateAccountFailed,
  deleteAccountFailed: texts.errors.deleteAccountFailed,
  deleteSelfForbidden: texts.errors.deleteSelfForbidden,
} as const;

// Firebase Auth Error Messages
export const ACCOUNT_FIREBASE_ERROR_MESSAGES = {
  emailAlreadyInUse: texts.errors.firebase.emailAlreadyInUse,
  weakPassword: texts.errors.firebase.weakPassword,
  invalidEmail: texts.errors.firebase.invalidEmail,
  networkError: texts.errors.firebase.networkError,
  createAccountGeneric: texts.errors.firebase.createAccountGeneric,
} as const;

