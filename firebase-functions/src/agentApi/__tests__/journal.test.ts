/** @jest-environment node */
import { journalOperations } from "../operations/journal";
import type { OperationContext } from "../operations/types";

const NOW = new Date("2026-10-03T00:00:00.000Z");

const context = (overrides: Partial<OperationContext> = {}): OperationContext => ({
  data: {},
  query: {},
  body: {},
  now: NOW,
  ...overrides,
});

const entry = {
  id: "journal-1",
  date: "2026-10-01",
  title: "朝",
  content: "走った",
  createdAt: "2026-10-01T00:00:00.000Z",
  updatedAt: "2026-10-01T00:00:00.000Z",
};

describe("journalOperations.list", () => {
  it("date 指定でその日のみ、省略で全件を updatedAt 降順で返す", () => {
    const newer = {
      ...entry,
      id: "journal-2",
      date: "2026-10-02",
      updatedAt: "2026-10-02T00:00:00.000Z",
    };
    const data = { journalHistory: { "2026-10-01": [entry], "2026-10-02": [newer] } };
    expect(
      (journalOperations.list(context({ data, query: { date: "2026-10-01" } }))
        .body as { entries: unknown[] }).entries,
    ).toEqual([entry]);
    expect(
      (journalOperations.list(context({ data })).body as { entries: unknown[] })
        .entries,
    ).toEqual([newer, entry]);
  });

  it("未設定でも空配列、date 不正は 400", () => {
    expect(journalOperations.list(context())).toEqual({
      status: 200,
      body: { entries: [] },
    });
    expect(() =>
      journalOperations.list(context({ query: { date: "x" } })),
    ).toThrow(expect.objectContaining({ status: 400 }));
  });
});

describe("journalOperations.create", () => {
  it("日付キーに追記し、日付以外のキーは保持する", () => {
    const outcome = journalOperations.create(
      context({
        data: { journalHistory: { "2026-10-01": [entry] } },
        body: { date: "2026-10-01", title: "夜", content: "読書" },
      }),
    );
    expect(outcome.status).toBe(201);
    const created = (outcome.body as { entry: Record<string, unknown> }).entry;
    expect(created).toMatchObject({
      date: "2026-10-01",
      title: "夜",
      content: "読書",
      createdAt: NOW.toISOString(),
      updatedAt: NOW.toISOString(),
    });
    expect(created.id).toMatch(/^journal-\d+-[a-z0-9]+$/);
    expect(outcome.changes).toEqual({
      journalHistory: { "2026-10-01": [entry, created] },
    });
  });

  it("title / content を省略すると空文字、両方空白のみなら 400", () => {
    const outcome = journalOperations.create(
      context({ body: { date: "2026-10-03", content: "メモ" } }),
    );
    expect((outcome.body as { entry: { title: string } }).entry.title).toBe("");
    expect(() =>
      journalOperations.create(
        context({ body: { date: "2026-10-03", title: " ", content: "" } }),
      ),
    ).toThrow(expect.objectContaining({ code: "empty_entry" }));
  });

  it("date 欠落・上限超過は 400", () => {
    expect(() =>
      journalOperations.create(context({ body: { content: "x" } })),
    ).toThrow(expect.objectContaining({ status: 400 }));
    expect(() =>
      journalOperations.create(
        context({ body: { date: "2026-10-03", content: "a".repeat(20001) } }),
      ),
    ).toThrow(expect.objectContaining({ status: 400 }));
  });
});

describe("journalOperations.update", () => {
  it("title / content を更新し updatedAt を現在時刻にする", () => {
    const outcome = journalOperations.update(
      context({
        data: { journalHistory: { "2026-10-01": [entry] } },
        id: "journal-1",
        body: { content: "歩いた" },
      }),
    );
    expect(outcome.changes).toEqual({
      journalHistory: {
        "2026-10-01": [
          { ...entry, content: "歩いた", updatedAt: NOW.toISOString() },
        ],
      },
    });
  });

  it("date の変更は未対応(400)、存在しない ID は 404、空パッチは 400", () => {
    const data = { journalHistory: { "2026-10-01": [entry] } };
    expect(() =>
      journalOperations.update(
        context({ data, id: "journal-1", body: { date: "2026-10-02" } }),
      ),
    ).toThrow(expect.objectContaining({ code: "unknown_field" }));
    expect(() =>
      journalOperations.update(context({ data, id: "nope", body: { title: "a" } })),
    ).toThrow(expect.objectContaining({ status: 404 }));
    expect(() =>
      journalOperations.update(context({ data, id: "journal-1", body: {} })),
    ).toThrow(expect.objectContaining({ code: "empty_patch" }));
  });

  it("バケットキーと entry.date が食い違っていてもキーを使って更新できる", () => {
    const mismatched = { ...entry, date: "2026-09-30" };
    const outcome = journalOperations.update(
      context({
        data: { journalHistory: { "2026-10-01": [mismatched] } },
        id: "journal-1",
        body: { content: "歩いた" },
      }),
    );
    expect(outcome.changes).toEqual({
      journalHistory: {
        "2026-10-01": [
          { ...mismatched, content: "歩いた", updatedAt: NOW.toISOString() },
        ],
      },
    });
  });

  it("title と content を両方空にする更新は 400 empty_entry", () => {
    const data = { journalHistory: { "2026-10-01": [entry] } };
    expect(() =>
      journalOperations.update(
        context({ data, id: "journal-1", body: { title: " ", content: "" } }),
      ),
    ).toThrow(expect.objectContaining({ status: 400, code: "empty_entry" }));
  });

  it("片方を空にしても、もう片方が非空なら更新できる", () => {
    const data = { journalHistory: { "2026-10-01": [entry] } };
    const outcome = journalOperations.update(
      context({ data, id: "journal-1", body: { title: "" } }),
    );
    expect((outcome.body as { entry: { title: string } }).entry.title).toBe("");
  });
});

describe("journalOperations.remove", () => {
  it("空になった日付キーは削除する", () => {
    const other = { ...entry, id: "journal-2", date: "2026-10-02" };
    const outcome = journalOperations.remove(
      context({
        data: { journalHistory: { "2026-10-01": [entry], "2026-10-02": [other] } },
        id: "journal-1",
      }),
    );
    expect(outcome).toEqual({
      status: 200,
      body: { deleted: "journal-1" },
      changes: { journalHistory: { "2026-10-02": [other] } },
    });
  });

  it("バケットキーと entry.date が食い違っていてもキーを使って削除できる", () => {
    const mismatched = { ...entry, date: "2026-09-30" };
    const outcome = journalOperations.remove(
      context({
        data: { journalHistory: { "2026-10-01": [mismatched] } },
        id: "journal-1",
      }),
    );
    expect(outcome.changes).toEqual({ journalHistory: {} });
  });

  it("存在しない ID は 404", () => {
    expect(() => journalOperations.remove(context({ id: "nope" }))).toThrow(
      expect.objectContaining({ status: 404 }),
    );
  });
});
