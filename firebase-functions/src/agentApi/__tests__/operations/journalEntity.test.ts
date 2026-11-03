/** @jest-environment node */
import {
  applyJournalPatch,
  createJournalEntry,
} from "../../operations/journal/journalEntity";
import type { JournalEntry } from "../../operations/journal/journalTypes";

const NOW = new Date("2026-10-03T00:00:00.000Z");

describe("createJournalEntry", () => {
  it("id を採番し、createdAt と updatedAt を同じ時刻にする", () => {
    const entry = createJournalEntry(
      { date: "2026-10-01", title: "朝", content: "走った" },
      NOW,
    );
    expect(entry).toMatchObject({
      date: "2026-10-01",
      title: "朝",
      content: "走った",
      createdAt: NOW.toISOString(),
      updatedAt: NOW.toISOString(),
    });
    expect(entry.id).toMatch(/^journal-\d+-[a-z0-9]+$/);
  });

  it("空の title / content もそのまま保持する", () => {
    const entry = createJournalEntry(
      { date: "2026-10-01", title: "", content: "メモ" },
      NOW,
    );
    expect(entry.title).toBe("");
  });
});

describe("applyJournalPatch", () => {
  const existing: JournalEntry = {
    id: "journal-1",
    date: "2026-10-01",
    title: "朝",
    content: "走った",
    createdAt: "2026-10-01T00:00:00.000Z",
    updatedAt: "2026-10-01T00:00:00.000Z",
  };
  const later = new Date("2026-10-05T00:00:00.000Z");

  it("パッチのフィールドを上書きし、updatedAt を現在時刻にする", () => {
    expect(applyJournalPatch(existing, { content: "歩いた" }, later)).toEqual({
      ...existing,
      content: "歩いた",
      updatedAt: later.toISOString(),
    });
  });

  it("date を含まないパッチは、id・date・createdAt を変更しない", () => {
    const updated = applyJournalPatch(existing, { title: "夜" }, later);
    expect(updated.id).toBe(existing.id);
    expect(updated.date).toBe(existing.date);
    expect(updated.createdAt).toBe(existing.createdAt);
  });

  it("date を含むパッチは date を変え、id・createdAt は保つ", () => {
    const updated = applyJournalPatch(existing, { date: "2026-09-20" }, later);
    expect(updated).toEqual({
      ...existing,
      date: "2026-09-20",
      updatedAt: later.toISOString(),
    });
  });

  it("空文字のパッチも有効な更新として反映する", () => {
    expect(applyJournalPatch(existing, { title: "" }, later).title).toBe("");
  });

  it("元のエントリを変更しない", () => {
    const before = { ...existing };
    applyJournalPatch(existing, { title: "夜" }, later);
    expect(existing).toEqual(before);
  });
});
