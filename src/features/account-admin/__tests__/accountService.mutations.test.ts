import {
  mockBatch,
  mockRunTransaction,
  mockTransaction,
  setupAccountServiceMocks,
} from "./accountService.test.setup";
import {
  createAccountRecord,
  deleteAccountRecord,
  ensureAccountRecord,
  updateAccountRecord,
} from "../accountService";

describe("accountService mutations", () => {
  beforeEach(setupAccountServiceMocks);

  it("プロフィールと管理者権限を一括で保存する", async () => {
    await createAccountRecord("u1", {
      email: "a@example.com",
      displayName: "alice",
      isAdmin: true,
    });

    expect(mockBatch.set).toHaveBeenCalledWith(
      { path: "accounts/u1" },
      expect.objectContaining({
        email: "a@example.com",
        displayName: "alice",
        isAdmin: false,
        isAnonymous: false,
        isTestUser: false,
      }),
    );
    expect(mockBatch.set).toHaveBeenCalledWith(
      { path: "accountAdminGrants/u1" },
      {},
    );
    expect(mockBatch.commit).toHaveBeenCalledTimes(1);
  });

  it("表示名変更では権限を書き込まない", async () => {
    await updateAccountRecord("u1", { displayName: "new-name" });

    expect(mockBatch.update).toHaveBeenCalledWith(
      { path: "accounts/u1" },
      { updatedAt: expect.any(String), displayName: "new-name" },
    );
    expect(mockBatch.set).not.toHaveBeenCalled();
    expect(mockBatch.delete).not.toHaveBeenCalled();
    expect(mockBatch.commit).toHaveBeenCalledTimes(1);
  });

  it("剥奪では対象の権限を削除する", async () => {
    await updateAccountRecord("u1", { isAdmin: false });
    expect(mockBatch.delete).toHaveBeenCalledWith({
      path: "accountAdminGrants/u1",
    });
    expect(mockBatch.commit).toHaveBeenCalledTimes(1);
  });

  it("対象プロフィールと権限を一括で削除する", async () => {
    await deleteAccountRecord("u9");
    expect(mockBatch.delete).toHaveBeenCalledWith({ path: "accounts/u9" });
    expect(mockBatch.delete).toHaveBeenCalledWith({
      path: "accountAdminGrants/u9",
    });
    expect(mockBatch.commit).toHaveBeenCalledTimes(1);
  });

  it("再試行時は先に作成されたプロフィールに書き込まない", async () => {
    mockTransaction.get
      .mockResolvedValueOnce({ exists: () => false })
      .mockResolvedValueOnce({ exists: () => true });
    mockRunTransaction.mockImplementationOnce(async (_db, run) => {
      await run(mockTransaction as never);
      return run(mockTransaction as never);
    });

    await ensureAccountRecord("u1", "a@example.com", false);

    expect(mockTransaction.get).toHaveBeenCalledTimes(2);
    expect(mockTransaction.set).toHaveBeenCalledTimes(1);
  });

  it.each([
    ["a@example.com", false, false],
    ["test@example.com", false, true],
    [null, true, false],
  ])(
    "本人登録は一般権限を保存する（%s）",
    async (email, anonymous, testUser) => {
      mockTransaction.get.mockResolvedValue({ exists: () => false });

      await ensureAccountRecord("u2", email, anonymous);

      expect(mockTransaction.set).toHaveBeenCalledWith(
        { path: "accounts/u2" },
        expect.objectContaining({
          isAdmin: false,
          isAnonymous: anonymous,
          isTestUser: testUser,
        }),
      );
    },
  );
});
