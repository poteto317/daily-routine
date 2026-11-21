import {
  mockGetDoc,
  mockGetDocs,
  setupAccountServiceMocks,
} from "./accountService.test.setup";
import { checkIsAdmin, getAccount, getAccounts } from "../accountService";

describe("accountService queries", () => {
  beforeEach(setupAccountServiceMocks);

  it("一覧の UID と管理者表示は文書 ID と権限レコードから決まる", async () => {
    mockGetDocs
      .mockResolvedValueOnce({
        docs: [
          { id: "u1", data: () => ({ uid: "spoofed", isAdmin: true }) },
          {
            id: "older",
            data: () => ({ createdAt: "2026-01-01T00:00:00.000Z" }),
          },
          {
            id: "u2",
            data: () => ({
              isAdmin: false,
              createdAt: "2026-02-01T00:00:00.000Z",
            }),
          },
        ],
      } as never)
      .mockResolvedValueOnce({ docs: [{ id: "u2" }] } as never);

    await expect(getAccounts()).resolves.toMatchObject([
      { uid: "u2", isAdmin: true },
      { uid: "older", isAdmin: false },
      { uid: "u1", isAdmin: false },
    ]);
  });

  it("getAccountは未存在ならnullを返す", async () => {
    mockGetDoc.mockResolvedValue({ exists: () => false } as never);

    await expect(getAccount("u1")).resolves.toBeNull();
  });

  it("単件取得でも旧 UID と旧権限に依存しない", async () => {
    mockGetDoc
      .mockResolvedValueOnce({
        exists: () => true,
        id: "u1",
        data: () => ({ uid: "spoofed", isAdmin: true }),
      } as never)
      .mockResolvedValueOnce({ exists: () => false } as never);

    await expect(getAccount("u1")).resolves.toMatchObject({
      uid: "u1",
      isAdmin: false,
    });
  });

  it("旧プロフィールの不正な値を表示用データに持ち込まない", async () => {
    mockGetDoc
      .mockResolvedValueOnce({
        exists: () => true,
        id: "u1",
        data: () => ({
          email: { address: "invalid" },
          displayName: ["invalid"],
        }),
      } as never)
      .mockResolvedValueOnce({ exists: () => false } as never);

    await expect(getAccount("u1")).resolves.toMatchObject({
      email: "",
      displayName: "",
    });
  });

  it.each([true, false])(
    "権限レコードの存在で管理者を判定する（%s）",
    async (exists) => {
      mockGetDoc.mockResolvedValue({ exists: () => exists } as never);

      await expect(checkIsAdmin("u1")).resolves.toBe(exists);
      expect(mockGetDoc).toHaveBeenCalledWith({
        path: "accountAdminGrants/u1",
      });
    },
  );
});
