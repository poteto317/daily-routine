import "./accountService.test.setup";
import {
  createAccountRecord,
  deleteAccountRecord,
  ensureAccountRecord,
  updateAccountRecord,
} from "../accountService";
import {
  mockDeleteDoc,
  mockGetDoc,
  mockSetDoc,
  mockUpdateDoc,
  setupAccountServiceMocks,
} from "./accountService.test.setup";

describe("accountService mutations", () => {
  beforeEach(() => {
    setupAccountServiceMocks();
  });

  it("createAccountRecordは初期フィールドで保存する", async () => {
    const nowSpy = jest
      .spyOn(Date.prototype, "toISOString")
      .mockReturnValue("2026-02-12T10:00:00.000Z");

    await createAccountRecord("u1", {
      email: "a@example.com",
      password: "dummy",
      displayName: "alice",
      isAdmin: true,
    });

    expect(mockSetDoc).toHaveBeenCalledWith(
      { path: "accounts/u1" },
      expect.objectContaining({
        email: "a@example.com",
        displayName: "alice",
        isAdmin: true,
        isAnonymous: false,
        isTestUser: false,
      }),
    );
    nowSpy.mockRestore();
  });

  it("updateAccountRecordは指定項目のみ更新する", async () => {
    const nowSpy = jest
      .spyOn(Date.prototype, "toISOString")
      .mockReturnValue("2026-02-12T11:00:00.000Z");

    await updateAccountRecord("u1", { displayName: "new-name" });

    expect(mockUpdateDoc).toHaveBeenCalledWith(
      { path: "accounts/u1" },
      { updatedAt: "2026-02-12T11:00:00.000Z", displayName: "new-name" },
    );
    nowSpy.mockRestore();
  });

  it("deleteAccountRecordは対象アカウントを削除する", async () => {
    await deleteAccountRecord("u9");
    expect(mockDeleteDoc).toHaveBeenCalledWith({ path: "accounts/u1" });
  });

  it("ensureAccountRecordは既存アカウントがある場合は作成しない", async () => {
    mockGetDoc.mockResolvedValue({
      exists: () => true,
      id: "u1",
      data: () => ({ email: "a@example.com" }),
    } as never);

    await ensureAccountRecord("u1", "a@example.com", false);
    expect(mockSetDoc).not.toHaveBeenCalled();
  });

  it("ensureAccountRecordはテストユーザーを非管理者で作成する", async () => {
    mockGetDoc.mockResolvedValue({ exists: () => false } as never);

    await ensureAccountRecord("u2", "test@example.com", false);

    expect(mockSetDoc).toHaveBeenCalledWith(
      { path: "accounts/u1" },
      expect.objectContaining({ isAdmin: false, isTestUser: true }),
    );
  });
});
