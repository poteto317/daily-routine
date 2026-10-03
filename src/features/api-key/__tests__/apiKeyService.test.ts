import { hasApiKey, issueApiKey, revokeApiKeys } from "../apiKeyService";
import * as repository from "../apiKeyRepository";
import * as generator from "../apiKeyGenerator";

jest.mock("@/lib/firebase", () => ({
  getOrCreateUser: jest.fn().mockResolvedValue({ uid: "user-1" }),
}));
jest.mock("../apiKeyRepository");
jest.mock("../apiKeyGenerator");

const mockedRepository = jest.mocked(repository);
const mockedGenerator = jest.mocked(generator);

beforeEach(() => {
  jest.clearAllMocks();
  mockedGenerator.generateApiKey.mockReturnValue("drk_new");
  mockedGenerator.hashApiKey.mockResolvedValue("hash-new");
  mockedRepository.listApiKeyHashes.mockResolvedValue([]);
});

describe("issueApiKey", () => {
  it("新しいハッシュを保存し、平文キーを返す", async () => {
    await expect(issueApiKey()).resolves.toBe("drk_new");
    expect(mockedRepository.saveApiKeyHash).toHaveBeenCalledWith(
      "user-1",
      "hash-new",
    );
  });

  it("旧キーは新キー保存後に削除する（キーが無い瞬間を作らない）", async () => {
    mockedRepository.listApiKeyHashes.mockResolvedValue(["hash-old"]);
    const order: string[] = [];
    mockedRepository.saveApiKeyHash.mockImplementation(async () => {
      order.push("save");
    });
    mockedRepository.deleteApiKeyHashes.mockImplementation(async () => {
      order.push("delete");
    });

    await issueApiKey();

    expect(order).toEqual(["save", "delete"]);
    expect(mockedRepository.deleteApiKeyHashes).toHaveBeenCalledWith([
      "hash-old",
    ]);
  });

  it("保存に失敗したら旧キーを削除せずエラーを伝播する", async () => {
    mockedRepository.listApiKeyHashes.mockResolvedValue(["hash-old"]);
    mockedRepository.saveApiKeyHash.mockRejectedValue(new Error("save failed"));

    await expect(issueApiKey()).rejects.toThrow("save failed");
    expect(mockedRepository.deleteApiKeyHashes).not.toHaveBeenCalled();
  });
});

describe("revokeApiKeys", () => {
  it("自分の全キーを削除する", async () => {
    mockedRepository.listApiKeyHashes.mockResolvedValue(["h1", "h2"]);
    await revokeApiKeys();
    expect(mockedRepository.deleteApiKeyHashes).toHaveBeenCalledWith([
      "h1",
      "h2",
    ]);
  });
});

describe("hasApiKey", () => {
  it("キーが 1 件以上あれば true", async () => {
    mockedRepository.listApiKeyHashes.mockResolvedValue(["h1"]);
    await expect(hasApiKey()).resolves.toBe(true);
    mockedRepository.listApiKeyHashes.mockResolvedValue([]);
    await expect(hasApiKey()).resolves.toBe(false);
  });
});
