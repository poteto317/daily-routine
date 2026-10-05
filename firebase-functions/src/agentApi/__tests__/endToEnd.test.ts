/** @jest-environment node */
import type { Request } from "firebase-functions/https";
import type { Response } from "express";
import { createAgentApiHandler } from "../handler";
import type { SyncDocData } from "../syncDoc";
import { applyChanges } from "../syncWriter";
import { createFakeFirestore } from "./fakeFirestore";

jest.mock("firebase-functions/logger", () => ({ error: jest.fn() }));

const KEY = `drk_${"A".repeat(43)}`;

describe("agentApi end-to-end（フェイク Firestore）", () => {
  it("支出作成で同期メタが進み、他フィールドと既存スナップショット順が保たれる", async () => {
    const fake = createFakeFirestore({
      "users/u1": {
        routines: [{ id: "r1" }],
        budgetCategories: [],
        budgetData: { expenses: {} },
        lastModified: 1000,
        deviceId: "device-a",
      },
    });
    const handler = createAgentApiHandler({
      resolveUid: async (key) => (key === KEY ? "u1" : null),
      readData: async (uid) =>
        (fake.get(`users/${uid}`) as SyncDocData) ?? null,
      runWrite: (uid, build) =>
        applyChanges(fake.db, uid, build, {
          now: () => 5000,
          serverTimestamp: () => "SERVER_TS",
        }),
      now: () => new Date("2026-10-03T00:00:00.000Z"),
    });

    const res = { status: jest.fn(), json: jest.fn() };
    res.status.mockReturnValue(res);
    await handler(
      {
        method: "POST",
        path: "/budget/expenses",
        headers: { authorization: `Bearer ${KEY}` },
        query: {},
        body: { date: "2026-10-03", amount: 800 },
      } as unknown as Request,
      res as unknown as Response,
    );

    expect(res.status).toHaveBeenCalledWith(201);
    const doc = fake.get("users/u1") as Record<string, unknown>;
    expect(doc.lastModified).toBe(5000);
    expect(doc.deviceId).toBe("api");
    expect(doc.routines).toEqual([{ id: "r1" }]);
    expect(
      (doc.budgetData as { expenses: Record<string, unknown[]> }).expenses[
        "2026-10"
      ],
    ).toHaveLength(1);
    expect(fake.snapshotsOf("u1")).toHaveLength(1);
  });

  it("Todo のリスト作成・一覧・アイテム操作・削除の一連の流れが正しく動作する", async () => {
    const fake = createFakeFirestore({
      "users/u1": {
        todoLists: [],
        todoCategories: [],
        lastModified: 1000,
        deviceId: "device-a",
      },
    });
    const handler = createAgentApiHandler({
      resolveUid: async (key) => (key === KEY ? "u1" : null),
      readData: async (uid) =>
        (fake.get(`users/${uid}`) as SyncDocData) ?? null,
      runWrite: (uid, build) =>
        applyChanges(fake.db, uid, build, {
          now: () => 6000,
          serverTimestamp: () => "SERVER_TS",
        }),
      now: () => new Date("2026-10-05T00:00:00.000Z"),
    });

    const call = async (
      method: string,
      path: string,
      body: unknown = {},
      query: Record<string, string> = {},
    ) => {
      const res = { status: jest.fn(), json: jest.fn() };
      res.status.mockReturnValue(res);
      await handler(
        {
          method,
          path,
          headers: { authorization: `Bearer ${KEY}` },
          query,
          body,
        } as unknown as Request,
        res as unknown as Response,
      );
      return res;
    };

    // 1. リスト作成
    const createListRes = await call("POST", "/todo/lists", {
      title: "買い物リスト",
      defaultItemBgColor: "bg-red-50",
    });
    expect(createListRes.status).toHaveBeenCalledWith(201);
    const createdList = (createListRes.json as jest.Mock).mock.calls[0][0].list;
    const listId = createdList.id;
    expect(createdList.title).toBe("買い物リスト");

    // 2. リスト一覧でどのTodoか選ぶ
    const listListsRes = await call("GET", "/todo/lists");
    expect(listListsRes.status).toHaveBeenCalledWith(200);
    expect(
      (listListsRes.json as jest.Mock).mock.calls[0][0].lists,
    ).toHaveLength(1);

    // 3. アイテム作成（選択したリストに作成）
    const createItemRes = await call("POST", "/todo/items", {
      listId,
      title: "牛乳",
    });
    expect(createItemRes.status).toHaveBeenCalledWith(201);
    const createdItem = (createItemRes.json as jest.Mock).mock.calls[0][0].item;
    const itemId = createdItem.id;
    expect(createdItem.title).toBe("牛乳");
    expect(createdItem.bgColor).toBe("bg-red-50");

    // 4. アイテム一覧取得
    const listItemsRes = await call(
      "GET",
      "/todo/items",
      {},
      { listId },
    );
    expect(listItemsRes.status).toHaveBeenCalledWith(200);
    const items = (listItemsRes.json as jest.Mock).mock.calls[0][0].items;
    expect(items).toHaveLength(1);
    expect(items[0].id).toBe(itemId);

    // 5. アイテム更新（完了にする）
    const updateItemRes = await call("PATCH", `/todo/items/${itemId}`, {
      listId,
      isCompleted: true,
    });
    expect(updateItemRes.status).toHaveBeenCalledWith(200);
    expect(
      (updateItemRes.json as jest.Mock).mock.calls[0][0].item.isCompleted,
    ).toBe(true);

    // 6. アイテム削除
    const deleteItemRes = await call(
      "DELETE",
      `/todo/items/${itemId}`,
      {},
      { listId },
    );
    expect(deleteItemRes.status).toHaveBeenCalledWith(200);
    expect((deleteItemRes.json as jest.Mock).mock.calls[0][0]).toEqual({
      deleted: itemId,
    });

    // 7. リスト削除
    const deleteListRes = await call("DELETE", `/todo/lists/${listId}`);
    expect(deleteListRes.status).toHaveBeenCalledWith(200);
    expect((deleteListRes.json as jest.Mock).mock.calls[0][0]).toEqual({
      deleted: listId,
    });

    const finalDoc = fake.get("users/u1") as Record<string, unknown>;
    expect(finalDoc.todoLists).toEqual([]);
  });
});

describe("agentApi end-to-end: 古い形式の同期データ（フィールド欠損）", () => {
  const setup = (doc: Record<string, unknown>) => {
    const fake = createFakeFirestore({ "users/u1": doc });
    const handler = createAgentApiHandler({
      resolveUid: async (key) => (key === KEY ? "u1" : null),
      readData: async (uid) =>
        (fake.get(`users/${uid}`) as SyncDocData) ?? null,
      runWrite: (uid, build) =>
        applyChanges(fake.db, uid, build, {
          now: () => 5000,
          serverTimestamp: () => "SERVER_TS",
        }),
      now: () => new Date("2026-10-03T00:00:00.000Z"),
    });
    const call = async (method: string, path: string, body: unknown = {}) => {
      const res = { status: jest.fn(), json: jest.fn() };
      res.status.mockReturnValue(res);
      await handler(
        {
          method,
          path,
          headers: { authorization: `Bearer ${KEY}` },
          query: {},
          body,
        } as unknown as Request,
        res as unknown as Response,
      );
      return res;
    };
    return { fake, call };
  };

  const oldDoc = {
    routines: [{ id: "r1" }],
    lastModified: 1000,
    deviceId: "device-a",
  };

  it("対象フィールドが無いドキュメントへの作成は 409 で、ドキュメントを変更しない", async () => {
    const { fake, call } = setup(oldDoc);
    const res = await call("POST", "/budget/income-items", {
      name: "給与",
      amount: 300000,
    });

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({
      error: { code: "outdated_sync_data", message: expect.any(String) },
    });
    expect(fake.get("users/u1")).toEqual(oldDoc);
    expect(fake.snapshotsOf("u1")).toHaveLength(0);
  });

  it("budgetData が無いドキュメントへの支出作成も 409（予算設定ごと置き換えない）", async () => {
    const { fake, call } = setup({ ...oldDoc, budgetCategories: [] });
    const res = await call("POST", "/budget/expenses", {
      date: "2026-10-03",
      amount: 800,
    });
    expect(res.status).toHaveBeenCalledWith(409);
    expect(fake.get("users/u1")).toEqual({ ...oldDoc, budgetCategories: [] });
  });

  it("budgetData はあるが expenses だけ無い場合は、他のキーを保って作成できる", async () => {
    const { fake, call } = setup({
      ...oldDoc,
      budgetData: { monthlyBudget: 100000 },
    });
    const res = await call("POST", "/budget/expenses", {
      date: "2026-10-03",
      amount: 800,
    });
    expect(res.status).toHaveBeenCalledWith(201);
    const budgetData = (fake.get("users/u1") as Record<string, unknown>)
      .budgetData as Record<string, unknown>;
    expect(budgetData.monthlyBudget).toBe(100000);
    expect(budgetData.expenses).toBeDefined();
  });

  it("budgetCategories だけが欠けた状態で categoryId を指定した支出作成は、409 ではなく 400 になる", async () => {
    const doc = { ...oldDoc, budgetData: { expenses: {} } };
    const { fake, call } = setup(doc);
    const res = await call("POST", "/budget/expenses", {
      date: "2026-10-03",
      amount: 800,
      categoryId: "budget-category-1",
    });
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: { code: "invalid_field", message: expect.any(String) },
    });
    expect(fake.get("users/u1")).toEqual(doc);
  });

  it("一覧は空として返し、更新・削除は従来どおり 404 になる", async () => {
    const { call } = setup(oldDoc);
    const list = await call("GET", "/budget/income-items");
    expect(list.status).toHaveBeenCalledWith(200);
    expect(list.json).toHaveBeenCalledWith({ incomeItems: [] });

    const update = await call("PATCH", "/budget/income-items/nope", {
      amount: 1,
    });
    expect(update.status).toHaveBeenCalledWith(404);
    const remove = await call("DELETE", "/budget/income-items/nope");
    expect(remove.status).toHaveBeenCalledWith(404);
  });

  it("todoLists や todoCategories が無いドキュメントへの作成は 409", async () => {
    const { fake, call } = setup(oldDoc);
    const resList = await call("POST", "/todo/lists", { title: "リスト" });
    expect(resList.status).toHaveBeenCalledWith(409);
    expect(resList.json).toHaveBeenCalledWith({
      error: { code: "outdated_sync_data", message: expect.any(String) },
    });

    const resCat = await call("POST", "/todo/categories", { name: "カテゴリ" });
    expect(resCat.status).toHaveBeenCalledWith(409);
    expect(fake.get("users/u1")).toEqual(oldDoc);
  });
});
