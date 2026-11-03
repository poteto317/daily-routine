/** @jest-environment node */
import {
  addEntry,
  findEntry,
  listEntries,
  readHistory,
  removeEntry,
  replaceEntry,
  replaceOrMoveEntry,
  sortByLatest,
  toJournalChanges,
} from "../../operations/journal/journalStore";
import type { JournalEntry } from "../../operations/journal/journalTypes";

const entry = (overrides: Partial<JournalEntry> = {}): JournalEntry => ({
  id: "journal-1",
  date: "2026-10-01",
  title: "朝",
  content: "走った",
  createdAt: "2026-10-01T00:00:00.000Z",
  updatedAt: "2026-10-01T00:00:00.000Z",
  ...overrides,
});

describe("readHistory / toJournalChanges", () => {
  it("journalHistory を返し、未設定・型不正は空", () => {
    const history = { "2026-10-01": [entry()] };
    expect(readHistory({ journalHistory: history })).toEqual(history);
    expect(readHistory({})).toEqual({});
    expect(readHistory({ journalHistory: [] })).toEqual({});
    expect(readHistory({ journalHistory: "x" })).toEqual({});
  });

  it("toJournalChanges は journalHistory キーに包む", () => {
    expect(toJournalChanges({})).toEqual({ journalHistory: {} });
  });
});

describe("findEntry", () => {
  it("バケットのキーとエントリを返す", () => {
    const target = entry({ id: "b" });
    expect(findEntry({ "2026-10-01": [entry(), target] }, "b")).toEqual({
      key: "2026-10-01",
      entry: target,
    });
  });

  it("エントリの date とバケットのキーが食い違っていても、入っているキーを返す", () => {
    const target = entry({ id: "b", date: "2026-10-05" });
    expect(findEntry({ "2026-10-01": [target] }, "b")?.key).toBe("2026-10-01");
  });

  it("見つからない・ID 未指定は null", () => {
    expect(findEntry({ "2026-10-01": [entry()] }, "nope")).toBeNull();
    expect(findEntry({ "2026-10-01": [entry()] }, undefined)).toBeNull();
  });
});

describe("sortByLatest / listEntries", () => {
  const older = entry({ id: "old", updatedAt: "2026-10-01T00:00:00.000Z" });
  const newer = entry({
    id: "new",
    date: "2026-10-02",
    updatedAt: "2026-10-02T00:00:00.000Z",
  });

  it("更新日時の降順に並べ、元の配列を変更しない", () => {
    const source = [older, newer];
    expect(sortByLatest(source).map((e) => e.id)).toEqual(["new", "old"]);
    expect(source.map((e) => e.id)).toEqual(["old", "new"]);
  });

  it("date 指定でその日のみ、省略で全件、存在しない日は空", () => {
    const history = { "2026-10-01": [older], "2026-10-02": [newer] };
    expect(listEntries(history, "2026-10-01")).toEqual([older]);
    expect(listEntries(history, undefined).map((e) => e.id)).toEqual([
      "new",
      "old",
    ]);
    expect(listEntries(history, "2026-01-01")).toEqual([]);
  });
});

describe("addEntry", () => {
  it("既存の日の末尾、または新しい日のバケットに追加する", () => {
    const existing = entry();
    const sameDay = entry({ id: "b" });
    const otherDay = entry({ id: "c", date: "2026-10-09" });
    const history = { "2026-10-01": [existing] };
    expect(addEntry(history, sameDay)).toEqual({
      "2026-10-01": [existing, sameDay],
    });
    expect(addEntry(history, otherDay)).toEqual({
      "2026-10-01": [existing],
      "2026-10-09": [otherDay],
    });
  });

  it("元のオブジェクトを変更しない", () => {
    const history = { "2026-10-01": [entry()] };
    addEntry(history, entry({ id: "b" }));
    expect(history["2026-10-01"]).toHaveLength(1);
  });
});

describe("replaceEntry", () => {
  it("指定バケット内の同じ ID だけを置き換え、並びと他の日を保つ", () => {
    const first = entry({ id: "a" });
    const second = entry({ id: "b" });
    const otherDay = [entry({ id: "c", date: "2026-10-02" })];
    const updated = { ...first, title: "夜" };
    expect(
      replaceEntry(
        { "2026-10-01": [first, second], "2026-10-02": otherDay },
        "2026-10-01",
        updated,
      ),
    ).toEqual({ "2026-10-01": [updated, second], "2026-10-02": otherDay });
  });
});

describe("removeEntry", () => {
  it("同じ日に残りがあればそれを残す", () => {
    const keep = entry({ id: "b" });
    expect(
      removeEntry(
        { "2026-10-01": [entry({ id: "a" }), keep] },
        "2026-10-01",
        "a",
      ),
    ).toEqual({ "2026-10-01": [keep] });
  });

  it("バケットが空になったらキーごと削除し、他の日は残す", () => {
    const otherDay = [entry({ id: "c", date: "2026-10-02" })];
    expect(
      removeEntry(
        { "2026-10-01": [entry({ id: "a" })], "2026-10-02": otherDay },
        "2026-10-01",
        "a",
      ),
    ).toEqual({ "2026-10-02": otherDay });
  });

  it("元のオブジェクトを変更しない", () => {
    const history = { "2026-10-01": [entry({ id: "a" })] };
    removeEntry(history, "2026-10-01", "a");
    expect(history["2026-10-01"]).toHaveLength(1);
  });
});

describe("replaceOrMoveEntry", () => {
  it("patchDate が無ければ、キーのバケット内で置き換えて並びを保つ", () => {
    const first = entry({ id: "a" });
    const second = entry({ id: "b" });
    const updated = { ...first, title: "夜" };
    expect(
      replaceOrMoveEntry(
        { "2026-10-01": [first, second] },
        "2026-10-01",
        updated,
        undefined,
      ),
    ).toEqual({ "2026-10-01": [updated, second] });
  });

  it("patchDate がキーと同じなら移さない（キーと date が食い違うデータでも位置のまま置き換える）", () => {
    const stale = entry({ id: "a", date: "2026-09-30" });
    const updated = { ...stale, date: "2026-10-01" };
    expect(
      replaceOrMoveEntry(
        { "2026-10-01": [stale, entry({ id: "b" })] },
        "2026-10-01",
        updated,
        "2026-10-01",
      ),
    ).toEqual({ "2026-10-01": [updated, entry({ id: "b" })] });
  });

  it("date を含まない更新は、updated.date がキーと違っても移さない", () => {
    const stale = entry({ id: "a", date: "2026-09-30" });
    const updated = { ...stale, title: "夜" };
    expect(
      replaceOrMoveEntry(
        { "2026-10-01": [stale] },
        "2026-10-01",
        updated,
        undefined,
      ),
    ).toEqual({ "2026-10-01": [updated] });
  });

  it("patchDate がキーと違えば旧バケットから除き、新しい日付の末尾へ移す（空の旧キーは消す）", () => {
    const moving = entry({ id: "a" });
    const existing = entry({ id: "c", date: "2026-10-02" });
    const updated = { ...moving, date: "2026-10-02" };
    expect(
      replaceOrMoveEntry(
        { "2026-10-01": [moving], "2026-10-02": [existing] },
        "2026-10-01",
        updated,
        "2026-10-02",
      ),
    ).toEqual({ "2026-10-02": [existing, updated] });
  });

  it("旧バケットに残りがあれば残し、元のオブジェクトを変更しない", () => {
    const moving = entry({ id: "a" });
    const keep = entry({ id: "b" });
    const history = { "2026-10-01": [moving, keep] };
    const updated = { ...moving, date: "2026-09-30" };
    expect(
      replaceOrMoveEntry(history, "2026-10-01", updated, "2026-09-30"),
    ).toEqual({ "2026-10-01": [keep], "2026-09-30": [updated] });
    expect(history).toEqual({ "2026-10-01": [moving, keep] });
  });
});
