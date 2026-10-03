/** @jest-environment node */
import { hashApiKey } from "../apiKey";
import { createFirestoreHandlerDeps } from "../firestoreDeps";
import { createFakeFirestore } from "./fakeFirestore";

const KEY = `drk_${"A".repeat(43)}`;

const writeDeps = {
  now: () => 5000,
  serverTimestamp: () => "SERVER_TS",
};

const setup = (initial: Record<string, Record<string, unknown>>) => {
  const fake = createFakeFirestore(initial);
  return { fake, deps: createFirestoreHandlerDeps(fake.db, writeDeps) };
};

describe("createFirestoreHandlerDeps", () => {
  it("resolveUid は apiKeys のハッシュから uid を引く", async () => {
    const { deps } = setup({ [`apiKeys/${hashApiKey(KEY)}`]: { uid: "u1" } });
    await expect(deps.resolveUid(KEY)).resolves.toBe("u1");
    await expect(deps.resolveUid(`drk_${"B".repeat(43)}`)).resolves.toBeNull();
  });

  it("readData は users/{uid} の内容を返し、無ければ null", async () => {
    const { deps } = setup({ "users/u1": { budgetCategories: [] } });
    await expect(deps.readData("u1")).resolves.toEqual({
      budgetCategories: [],
    });
    await expect(deps.readData("u2")).resolves.toBeNull();
  });

  it("runWrite はトランザクションで書き込み、同期メタ情報を更新する", async () => {
    const { fake, deps } = setup({
      "users/u1": {
        routines: [],
        budgetCategories: [],
        lastModified: 1000,
        deviceId: "device-a",
      },
    });
    const outcome = await deps.runWrite("u1", () => ({
      status: 200,
      body: {},
      changes: { budgetCategories: [{ id: "c1" }] },
    }));

    expect(outcome.status).toBe(200);
    expect(fake.get("users/u1")).toMatchObject({
      budgetCategories: [{ id: "c1" }],
      lastModified: 5000,
      deviceId: "api",
      updatedAt: "SERVER_TS",
    });
  });

  it("runWrite は users/{uid} が無ければ no_sync_data で失敗する", async () => {
    const { deps } = setup({});
    await expect(
      deps.runWrite("u1", () => ({ status: 200, body: {} })),
    ).rejects.toMatchObject({ status: 404, code: "no_sync_data" });
  });

  it("now は注入した時計の現在時刻を Date で返す", () => {
    const { deps } = setup({});
    expect(deps.now()).toEqual(new Date(5000));
  });
});
