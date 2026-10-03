/** @jest-environment node */
import { authenticate } from "../authenticate";
import { expectApiError } from "./testUtils";

const KEY = `drk_${"A".repeat(43)}`;

const rejects = async (promise: Promise<unknown>, code: string) => {
  await expect(promise).rejects.toMatchObject({ status: 401, code });
};

describe("authenticate", () => {
  it("Bearer キーから解決した uid を返す", async () => {
    const resolveUid = jest.fn().mockResolvedValue("u1");
    await expect(authenticate(`Bearer ${KEY}`, resolveUid)).resolves.toBe("u1");
    expect(resolveUid).toHaveBeenCalledWith(KEY);
  });

  it.each([undefined, "", "Basic abc", "Bearer"])(
    "ヘッダ %p は resolveUid を呼ばずに 401",
    async (header) => {
      const resolveUid = jest.fn();
      await rejects(authenticate(header, resolveUid), "unauthorized");
      expect(resolveUid).not.toHaveBeenCalled();
    },
  );

  it("キーが未登録（null）なら 401", async () => {
    const resolveUid = jest.fn().mockResolvedValue(null);
    await rejects(authenticate(`Bearer ${KEY}`, resolveUid), "unauthorized");
  });

  it("resolveUid の失敗（Firestore エラーなど）は 401 に変換せず伝播する", async () => {
    const resolveUid = jest.fn().mockRejectedValue(new Error("firestore down"));
    await expect(authenticate(`Bearer ${KEY}`, resolveUid)).rejects.toThrow(
      "firestore down",
    );
  });

  it("エラーは ApiError（401 unauthorized）", async () => {
    try {
      await authenticate(undefined, jest.fn());
    } catch (error) {
      expectApiError(
        () => {
          throw error;
        },
        401,
        "unauthorized",
      );
      return;
    }
    throw new Error("投げられなかった");
  });
});
