import {
  getAccountIdentifierLabel,
  getDefaultDisplayNameFromEmail,
  isAccountSelf,
  ANONYMOUS_USER_DEFAULT_DISPLAY_NAME,
} from "../accountUtils";
import {
  ACCOUNT_ADMIN_ACCESS_DENIED_TEXT,
  ACCOUNT_ADMIN_ERROR_ALERT_TEXT,
  ACCOUNT_ADMIN_HEADER_TEXT,
  ACCOUNT_ADMIN_LEGEND_TEXT,
  ACCOUNT_ADMIN_MESSAGES,
  ACCOUNT_ADMIN_TOOLBAR_TEXT,
  ACCOUNT_COMMON_EMPTY_LABEL,
  ACCOUNT_DISPLAY_LABELS,
  ACCOUNT_EMAIL_EMPTY_LABEL,
} from "../helpers";
import {
  getAccountCreatedDateLabel,
  getAccountDisplayNameLabel,
  getAccountEmailLabel,
  getAccountRoleLabel,
  getAccountRowClassName,
  getAccountTypeLabel,
} from "../displayHelpers";

describe("account-admin helpers", () => {
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date("2026-03-07T12:00:00+09:00"));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("accountUtilsの純粋関数を処理する", () => {
    expect(ANONYMOUS_USER_DEFAULT_DISPLAY_NAME).toBe("匿名ユーザー");
    expect(isAccountSelf("u1", "u1")).toBe(true);
    expect(isAccountSelf("u1", "u2")).toBe(false);
    expect(getDefaultDisplayNameFromEmail("user@example.com")).toBe("user");
    expect(
      getAccountIdentifierLabel({
        displayName: "表示名",
        email: "user@example.com",
      }),
    ).toBe("表示名");
    expect(
      getAccountIdentifierLabel({ displayName: "", email: "user@example.com" }),
    ).toBe("user@example.com");
  });

  it("displayHelpersで表示ラベルを返す", () => {
    expect(getAccountEmailLabel("user@example.com")).toBe("user@example.com");
    expect(getAccountEmailLabel("")).toBe(ACCOUNT_EMAIL_EMPTY_LABEL);
    expect(getAccountDisplayNameLabel("名前")).toBe("名前");
    expect(getAccountDisplayNameLabel("")).toBe(ACCOUNT_COMMON_EMPTY_LABEL);
    expect(getAccountRowClassName("u1", "u1")).toContain("bg-blue-50/50");
    expect(getAccountRowClassName("u1", "u2")).toBe(
      "border-b border-gray-100 ",
    );
    expect(getAccountRoleLabel(true)).toBe(ACCOUNT_DISPLAY_LABELS.roleAdmin);
    expect(getAccountRoleLabel(false)).toBe(ACCOUNT_DISPLAY_LABELS.roleUser);
    expect(
      getAccountTypeLabel({
        uid: "u1",
        email: "",
        displayName: "",
        isAdmin: false,
        isAnonymous: true,
        isTestUser: false,
        createdAt: "",
        updatedAt: "",
      }),
    ).toBe(ACCOUNT_DISPLAY_LABELS.typeAnonymous);
    expect(
      getAccountTypeLabel({
        uid: "u1",
        email: "",
        displayName: "",
        isAdmin: false,
        isAnonymous: false,
        isTestUser: true,
        createdAt: "",
        updatedAt: "",
      }),
    ).toBe(ACCOUNT_DISPLAY_LABELS.typeTest);
    expect(
      getAccountTypeLabel({
        uid: "u1",
        email: "",
        displayName: "",
        isAdmin: false,
        isAnonymous: false,
        isTestUser: false,
        createdAt: "",
        updatedAt: "",
      }),
    ).toBe(ACCOUNT_DISPLAY_LABELS.typeNormal);
    expect(getAccountCreatedDateLabel("2026-03-07T00:00:00.000Z")).toBe(
      new Date("2026-03-07T00:00:00.000Z").toLocaleDateString("ja-JP"),
    );
    expect(getAccountCreatedDateLabel()).toBe(ACCOUNT_COMMON_EMPTY_LABEL);
  });

  it("定数とメッセージヘルパーを返す", () => {
    expect(ACCOUNT_ADMIN_HEADER_TEXT.title).toBe("👥 アカウント管理");
    expect(ACCOUNT_ADMIN_HEADER_TEXT.loading).toBe("読み込み中...");
    expect(ACCOUNT_ADMIN_ACCESS_DENIED_TEXT.icon).toBe("🔒");
    expect(ACCOUNT_ADMIN_ERROR_ALERT_TEXT.close).toBe("閉じる");
    expect(ACCOUNT_ADMIN_TOOLBAR_TEXT.createAccount).toBe(
      "➕ 新規アカウント作成",
    );
    expect(ACCOUNT_ADMIN_LEGEND_TEXT.items).toHaveLength(4);
    expect(
      ACCOUNT_ADMIN_MESSAGES.confirmDeleteAccount("a@example.com"),
    ).toContain('"a@example.com"');
    expect(ACCOUNT_ADMIN_MESSAGES.alertAccountCreated).toContain(
      "アカウントが作成されました",
    );
  });
});
