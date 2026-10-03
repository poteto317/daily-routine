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
