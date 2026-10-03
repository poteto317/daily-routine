import {
  deleteApiKeyHashes,
  listApiKeyHashes,
  replaceApiKeyHash,
} from "../apiKeyRepository";

const mockBatch = { set: jest.fn(), delete: jest.fn(), commit: jest.fn() };
const mockGetDocs = jest.fn();

jest.mock("@/lib/firebase", () => ({
  getFirestoreInstance: () => ({ kind: "firestore" }),
}));
jest.mock("firebase/firestore", () => ({
  collection: (_db: unknown, name: string) => ({ collection: name }),
  doc: (_db: unknown, collectionName: string, id: string) => ({
    path: `${collectionName}/${id}`,
  }),
  query: (target: unknown, constraint: unknown) => ({ target, constraint }),
  where: (field: string, op: string, value: string) => ({ field, op, value }),
  getDocs: (q: unknown) => mockGetDocs(q),
  serverTimestamp: () => "SERVER_TS",
  writeBatch: () => mockBatch,
}));

beforeEach(() => {
  jest.clearAllMocks();
  mockBatch.commit.mockResolvedValue(undefined);
});

describe("listApiKeyHashes", () => {
  it("自分の uid で絞り込み、ドキュメント ID（ハッシュ）の一覧を返す", async () => {
    mockGetDocs.mockResolvedValue({ docs: [{ id: "h1" }, { id: "h2" }] });

    await expect(listApiKeyHashes("user-1")).resolves.toEqual(["h1", "h2"]);

    expect(mockGetDocs).toHaveBeenCalledWith({
      target: { collection: "apiKeys" },
      constraint: { field: "uid", op: "==", value: "user-1" },
    });
  });

  it("キーが無ければ空配列", async () => {
    mockGetDocs.mockResolvedValue({ docs: [] });
    await expect(listApiKeyHashes("user-1")).resolves.toEqual([]);
  });
});

describe("replaceApiKeyHash", () => {
  it("新しいハッシュの作成と旧ハッシュの削除を 1 回のバッチでコミットする", async () => {
    await replaceApiKeyHash("user-1", "hash-new", ["old-1", "old-2"]);

    expect(mockBatch.set).toHaveBeenCalledTimes(1);
    expect(mockBatch.set).toHaveBeenCalledWith(
      { path: "apiKeys/hash-new" },
      { uid: "user-1", createdAt: "SERVER_TS" },
    );
    expect(mockBatch.delete).toHaveBeenCalledTimes(2);
    expect(mockBatch.delete).toHaveBeenCalledWith({ path: "apiKeys/old-1" });
    expect(mockBatch.delete).toHaveBeenCalledWith({ path: "apiKeys/old-2" });
    expect(mockBatch.commit).toHaveBeenCalledTimes(1);
  });

  it("旧ハッシュが無ければ作成のみ", async () => {
    await replaceApiKeyHash("user-1", "hash-new", []);
    expect(mockBatch.set).toHaveBeenCalledTimes(1);
    expect(mockBatch.delete).not.toHaveBeenCalled();
    expect(mockBatch.commit).toHaveBeenCalledTimes(1);
  });

  it("コミットに失敗したらエラーを伝播する", async () => {
    mockBatch.commit.mockRejectedValue(new Error("permission-denied"));
    await expect(
      replaceApiKeyHash("user-1", "hash-new", ["old-1"]),
    ).rejects.toThrow("permission-denied");
  });
});

describe("deleteApiKeyHashes", () => {
  it("すべてのハッシュを 1 回のバッチで削除する", async () => {
    await deleteApiKeyHashes(["h1", "h2", "h3"]);

    expect(mockBatch.delete).toHaveBeenCalledTimes(3);
    expect(mockBatch.set).not.toHaveBeenCalled();
    expect(mockBatch.commit).toHaveBeenCalledTimes(1);
  });

  it("コミットに失敗したらエラーを伝播する", async () => {
    mockBatch.commit.mockRejectedValue(new Error("unavailable"));
    await expect(deleteApiKeyHashes(["h1"])).rejects.toThrow("unavailable");
  });
});
