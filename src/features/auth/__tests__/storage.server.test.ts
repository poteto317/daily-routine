/**
 * @jest-environment node
 */

// window が無い環境（サーバー側レンダリング）では、ローカル認証は常に無効
describe("auth storage（サーバー側）", () => {
  const originalFlag = process.env.NEXT_PUBLIC_ENABLE_LOCAL_AUTH;

  beforeEach(() => {
    jest.resetModules();
    process.env.NEXT_PUBLIC_ENABLE_LOCAL_AUTH = "true";
  });

  afterEach(() => {
    if (originalFlag === undefined) {
      delete process.env.NEXT_PUBLIC_ENABLE_LOCAL_AUTH;
    } else {
      process.env.NEXT_PUBLIC_ENABLE_LOCAL_AUTH = originalFlag;
    }
  });

  const loadStorage = async () => import("../storage");

  it("環境変数が true でも isLocalAuthEnabled は false", async () => {
    const { isLocalAuthEnabled } = await loadStorage();

    expect(isLocalAuthEnabled).toBe(false);
  });

  it("スナップショットは読めず、保存は例外を投げずに何もしない", async () => {
    const { readLocalAuthSnapshot, writeLocalAuthSnapshot } =
      await loadStorage();

    expect(() =>
      writeLocalAuthSnapshot({ uid: "u1", email: null, isAnonymous: true }),
    ).not.toThrow();
    expect(readLocalAuthSnapshot()).toBeNull();
  });

  it("購読するとすぐに null を通知し、解除しても例外を投げない", async () => {
    const { subscribeLocalAuthSnapshot } = await loadStorage();
    const listener = jest.fn();

    const unsubscribe = subscribeLocalAuthSnapshot(listener);

    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith(null);
    expect(() => unsubscribe()).not.toThrow();
  });
});
