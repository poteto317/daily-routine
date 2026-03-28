import "./accountService.test.setup";
import { checkIsAdmin, getAccount, getAccounts } from "../accountService";
import {
  mockGetDoc,
  mockGetDocs,
  mockOrderBy,
  setupAccountServiceMocks,
} from "./accountService.test.setup";

describe("accountService queries", () => {
  beforeEach(() => {
    setupAccountServiceMocks();
  });

  it("getAccountsは作成日時降順クエリで一覧を返す", async () => {
    mockGetDocs.mockResolvedValue({
      docs: [
        {
          id: "u1",
          data: () => ({ email: "a@example.com", displayName: "a" }),
        },
        {
          id: "u2",
          data: () => ({ email: "b@example.com", displayName: "b" }),
        },
      ],
    } as never);

    const result = await getAccounts();

    expect(mockOrderBy).toHaveBeenCalledWith("createdAt", "desc");
    expect(result).toEqual([
      { uid: "u1", email: "a@example.com", displayName: "a" },
      { uid: "u2", email: "b@example.com", displayName: "b" },
    ]);
  });

  it("getAccountは未存在ならnullを返す", async () => {
    mockGetDoc.mockResolvedValue({ exists: () => false } as never);

    await expect(getAccount("u1")).resolves.toBeNull();
  });

  it("checkIsAdminはisAdminを判定する", async () => {
    mockGetDoc.mockResolvedValue({
      exists: () => true,
      id: "u1",
      data: () => ({ isAdmin: true }),
    } as never);

    await expect(checkIsAdmin("u1")).resolves.toBe(true);
  });
});
