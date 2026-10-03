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
  mockedRepository.replaceApiKeyHash.mockResolvedValue(undefined);
  mockedRepository.deleteApiKeyHashes.mockResolvedValue(undefined);
});

describe("issueApiKey", () => {
  it("旧キーが無ければ、新しいハッシュだけを保存して平文キーを返す", async () => {
    await expect(issueApiKey()).resolves.toBe("drk_new");
    expect(mockedRepository.replaceApiKeyHash).toHaveBeenCalledWith(
      "user-1",
      "hash-new",
      [],
    );
  });

  it("旧キーがあれば、新キーの保存と旧キーの削除を同じ呼び出しで行う（原子的）", async () => {
    mockedRepository.listApiKeyHashes.mockResolvedValue(["hash-old"]);

    await issueApiKey();

    expect(mockedRepository.replaceApiKeyHash).toHaveBeenCalledTimes(1);
    expect(mockedRepository.replaceApiKeyHash).toHaveBeenCalledWith(
      "user-1",
      "hash-new",
      ["hash-old"],
    );
    expect(mockedRepository.deleteApiKeyHashes).not.toHaveBeenCalled();
  });

  it("入れ替えに失敗したらエラーを伝播し、平文キーは返さない", async () => {
    mockedRepository.listApiKeyHashes.mockResolvedValue(["hash-old"]);
    mockedRepository.replaceApiKeyHash.mockRejectedValue(
      new Error("batch failed"),
    );

    await expect(issueApiKey()).rejects.toThrow("batch failed");
  });

  it("キーを生成して UTF-8 のハッシュにしたものを保存する", async () => {
    await issueApiKey();
    expect(mockedGenerator.hashApiKey).toHaveBeenCalledWith("drk_new");
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
