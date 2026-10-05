/** @jest-environment node */
import { executeOperation } from "../executeOperation";
import type { HandlerDeps } from "../handlerDeps";
import type { OperationOutcome } from "../operations/types";
import type { SyncDocData } from "../syncDoc";

const NOW = new Date("2026-10-03T00:00:00.000Z");
const request = {
  id: undefined,
  query: {},
  body: { name: "食費" },
  now: NOW,
};

const makeDeps = (overrides: Partial<HandlerDeps> = {}): HandlerDeps => ({
  resolveUid: jest.fn(),
  readData: jest.fn().mockResolvedValue({ budgetCategories: [{ id: "c1" }] }),
  runWrite: jest.fn(
    async (_uid: string, build: (data: SyncDocData) => OperationOutcome) =>
      build({ budgetCategories: [] }),
  ),
  now: () => NOW,
  ...overrides,
});

describe("executeOperation", () => {
  it("list は readData の結果で実行し、書き込みはしない", async () => {
    const deps = makeDeps();
    const outcome = await executeOperation(
      deps,
      "u1",
      { resource: "categories", action: "list" },
      request,
    );
    expect(deps.readData).toHaveBeenCalledWith("u1");
    expect(deps.runWrite).not.toHaveBeenCalled();
    expect(outcome).toEqual({
      status: 200,
      body: { categories: [{ id: "c1" }] },
    });
  });

  it("list で同期データが無ければ 404 no_sync_data", async () => {
    const deps = makeDeps({ readData: jest.fn().mockResolvedValue(null) });
    await expect(
      executeOperation(
        deps,
        "u1",
        { resource: "categories", action: "list" },
        request,
      ),
    ).rejects.toMatchObject({ status: 404, code: "no_sync_data" });
  });

  it("create は runWrite 経由で、渡された data に対して操作を実行する", async () => {
    const deps = makeDeps();
    const outcome = await executeOperation(
      deps,
      "u1",
      { resource: "categories", action: "create" },
      request,
    );
    expect(deps.readData).not.toHaveBeenCalled();
    expect(deps.runWrite).toHaveBeenCalledWith("u1", expect.any(Function));
    expect(outcome.status).toBe(201);
    expect(outcome.changes).toEqual({
      budgetCategories: [expect.objectContaining({ name: "食費" })],
    });
  });

  it("update / remove にはルートの id が渡る", async () => {
    const deps = makeDeps({
      runWrite: jest.fn(async (_uid, build) =>
        build({ budgetCategories: [{ id: "c1", name: "旧", createdAt: "t" }] }),
      ),
    });
    const outcome = await executeOperation(
      deps,
      "u1",
      { resource: "categories", action: "remove", id: "c1" },
      { ...request, id: "c1" },
    );
    expect(outcome.body).toEqual({ deleted: "c1" });
  });

  it("runWrite や操作が投げたエラーは伝播する", async () => {
    const deps = makeDeps({
      runWrite: jest.fn().mockRejectedValue(new Error("tx failed")),
    });
    await expect(
      executeOperation(
        deps,
        "u1",
        { resource: "categories", action: "create" },
        request,
      ),
    ).rejects.toThrow("tx failed");
  });
});

describe("executeOperation（クエリパラメータの検証）", () => {
  const listRequest = (query: Record<string, string | undefined>) => ({
    ...request,
    query,
  });

  it("支出の一覧は month、ジャーナルの一覧は date を受け付ける", async () => {
    const deps = makeDeps({
      readData: jest.fn().mockResolvedValue({}),
    });
    await expect(
      executeOperation(
        deps,
        "u1",
        { resource: "expenses", action: "list" },
        listRequest({ month: "2026-10" }),
      ),
    ).resolves.toMatchObject({ status: 200 });
    await expect(
      executeOperation(
        deps,
        "u1",
        { resource: "journalEntries", action: "list" },
        listRequest({ date: "2026-10-03" }),
      ),
    ).resolves.toMatchObject({ status: 200 });
  });

  it("一覧の未知のクエリキー（打ち間違い）は 400 invalid_query で、Firestore を読まない", async () => {
    const deps = makeDeps();
    await expect(
      executeOperation(
        deps,
        "u1",
        { resource: "expenses", action: "list" },
        listRequest({ mont: "2026-10" }),
      ),
    ).rejects.toMatchObject({ status: 400, code: "invalid_query" });
    expect(deps.readData).not.toHaveBeenCalled();
  });

  it("リソースに対応しないクエリキーも 400（支出に date、ジャーナルに month）", async () => {
    const deps = makeDeps();
    await expect(
      executeOperation(
        deps,
        "u1",
        { resource: "expenses", action: "list" },
        listRequest({ date: "2026-10-03" }),
      ),
    ).rejects.toMatchObject({ code: "invalid_query" });
    await expect(
      executeOperation(
        deps,
        "u1",
        { resource: "journalEntries", action: "list" },
        listRequest({ month: "2026-10" }),
      ),
    ).rejects.toMatchObject({ code: "invalid_query" });
  });

  it("クエリを受け付けないカテゴリ・収入項目・支出項目の一覧にクエリを付けると 400", async () => {
    const deps = makeDeps();
    for (const resource of [
      "categories",
      "incomeItems",
      "expenseItems",
    ] as const) {
      await expect(
        executeOperation(
          deps,
          "u1",
          { resource, action: "list" },
          listRequest({ month: "2026-10" }),
        ),
      ).rejects.toMatchObject({ code: "invalid_query" });
    }
    expect(deps.readData).not.toHaveBeenCalled();
  });

  it("書き込み系（作成・更新・削除）に未許可のクエリを付けると 400 で、トランザクションを開始しない", async () => {
    const deps = makeDeps();
    await expect(
      executeOperation(
        deps,
        "u1",
        { resource: "categories", action: "create" },
        listRequest({ month: "2026-10" }),
      ),
    ).rejects.toMatchObject({ status: 400, code: "invalid_query" });
    expect(deps.runWrite).not.toHaveBeenCalled();
  });

  it("Todo アイテムの削除は listId クエリを受け付け、未知のクエリは 400", async () => {
    const deps = makeDeps({
      runWrite: jest.fn(async (_uid, build) =>
        build({
          todoLists: [
            {
              id: "l1",
              title: "リスト",
              items: [{ id: "i1", title: "アイテム", isCompleted: false, createdAt: "t" }],
              createdAt: "t",
              updatedAt: "t",
            },
          ],
        }),
      ),
    });
    await expect(
      executeOperation(
        deps,
        "u1",
        { resource: "todoItems", action: "remove", id: "i1" },
        { ...listRequest({ listId: "l1" }), id: "i1" },
      ),
    ).resolves.toMatchObject({ status: 200, body: { deleted: "i1" } });

    await expect(
      executeOperation(
        deps,
        "u1",
        { resource: "todoItems", action: "remove", id: "i1" },
        { ...listRequest({ listId: "l1", extra: "x" }), id: "i1" },
      ),
    ).rejects.toMatchObject({ status: 400, code: "invalid_query" });
  });
});
