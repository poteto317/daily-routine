import type { JournalEntry, JournalHistory } from "@/types/routine";
import { applyJournalEntryUpdate } from "../journalHistoryUpdate";

const NOW = "2026-02-12T10:00:00.000Z";

const makeEntry = (id: string, date: string): JournalEntry => ({
  id,
  date,
  title: `title-${id}`,
  content: `content-${id}`,
  createdAt: "2026-02-01T00:00:00.000Z",
  updatedAt: "2026-02-01T00:00:00.000Z",
});

describe("applyJournalEntryUpdate", () => {
  it("date を省略するとタイトル・本文・updatedAt だけを変え、日付と位置は保つ", () => {
    const target = makeEntry("j1", "2026-02-12");
    const other = makeEntry("j2", "2026-02-12");
    const history: JournalHistory = { "2026-02-12": [target, other] };

    const result = applyJournalEntryUpdate(
      history,
      "j1",
      { title: "t", content: "c" },
      NOW,
    );

    expect(result).toEqual({
      "2026-02-12": [
        { ...target, title: "t", content: "c", updatedAt: NOW },
        other,
      ],
    });
  });

  it("date に undefined が入っていても既存の日付を消さない", () => {
    const target = makeEntry("j1", "2026-02-12");

    const result = applyJournalEntryUpdate(
      { "2026-02-12": [target] },
      "j1",
      { title: "t", content: "c", date: undefined },
      NOW,
    );

    expect(result["2026-02-12"][0].date).toBe("2026-02-12");
  });

  it("置き場所と同じ date なら同じバケットの中で置き換え、順番を保つ", () => {
    const first = makeEntry("j0", "2026-02-12");
    const target = makeEntry("j1", "2026-02-12");
    const last = makeEntry("j2", "2026-02-12");

    const result = applyJournalEntryUpdate(
      { "2026-02-12": [first, target, last] },
      "j1",
      { title: "t", content: "c", date: "2026-02-12" },
      NOW,
    );

    expect(result["2026-02-12"].map((entry) => entry.id)).toEqual([
      "j0",
      "j1",
      "j2",
    ]);
    expect(result["2026-02-12"][1]).toEqual({
      ...target,
      title: "t",
      content: "c",
      updatedAt: NOW,
    });
  });

  it("date を変えると旧バケットから除き、変更先のバケットの末尾へ入れる", () => {
    const target = makeEntry("j1", "2026-02-12");
    const sameDay = makeEntry("j2", "2026-02-12");
    const existing = makeEntry("j3", "2026-02-01");

    const result = applyJournalEntryUpdate(
      { "2026-02-12": [target, sameDay], "2026-02-01": [existing] },
      "j1",
      { title: "t", content: "c", date: "2026-02-01" },
      NOW,
    );

    expect(result).toEqual({
      "2026-02-12": [sameDay],
      "2026-02-01": [
        existing,
        {
          ...target,
          date: "2026-02-01",
          title: "t",
          content: "c",
          updatedAt: NOW,
        },
      ],
    });
  });

  it("移動で旧バケットが空になったら旧キーごと消し、無い日付のバケットは作る", () => {
    const target = makeEntry("j1", "2026-02-12");

    const result = applyJournalEntryUpdate(
      { "2026-02-12": [target] },
      "j1",
      { title: "t", content: "c", date: "2026-02-10" },
      NOW,
    );

    expect(Object.keys(result)).toEqual(["2026-02-10"]);
    expect(result["2026-02-10"]).toEqual([
      {
        ...target,
        date: "2026-02-10",
        title: "t",
        content: "c",
        updatedAt: NOW,
      },
    ]);
  });

  describe("キーと entry.date が食い違うデータ（置き場所のキーを正とする）", () => {
    it("date を省略すれば移さない", () => {
      // キーは 2026-02-12 だが entry.date は 2026-02-01
      const mismatched = makeEntry("j1", "2026-02-01");
      const history: JournalHistory = { "2026-02-12": [mismatched] };

      expect(
        applyJournalEntryUpdate(
          history,
          "j1",
          { title: "t", content: "c" },
          NOW,
        ),
      ).toEqual({
        "2026-02-12": [
          { ...mismatched, title: "t", content: "c", updatedAt: NOW },
        ],
      });
    });

    it("entry.date と同じでもキーと違う date なら、その日付へ移す", () => {
      // キーは 2026-02-12 だが entry.date は 2026-02-01
      const mismatched = makeEntry("j1", "2026-02-01");
      const history: JournalHistory = { "2026-02-12": [mismatched] };

      expect(
        applyJournalEntryUpdate(
          history,
          "j1",
          { title: "t", content: "c", date: "2026-02-01" },
          NOW,
        ),
      ).toEqual({
        "2026-02-01": [
          { ...mismatched, title: "t", content: "c", updatedAt: NOW },
        ],
      });
    });

    it("キーと同じ date なら移さずに、配列の位置のまま entry.date をキーに直す", () => {
      // キーは 2026-02-12 だが entry.date は 2026-02-10
      const mismatched = makeEntry("j1", "2026-02-10");
      const second = makeEntry("j2", "2026-02-12");
      const history: JournalHistory = { "2026-02-12": [mismatched, second] };

      expect(
        applyJournalEntryUpdate(
          history,
          "j1",
          { title: "t", content: "c", date: "2026-02-12" },
          NOW,
        ),
      ).toEqual({
        "2026-02-12": [
          {
            ...mismatched,
            date: "2026-02-12",
            title: "t",
            content: "c",
            updatedAt: NOW,
          },
          second,
        ],
      });
    });

    it("entry.date ともキーとも違う date なら、entry.date ではなく実際の置き場所（キー）から除いて移す", () => {
      // キーは 2026-02-12 だが entry.date は 2026-02-10
      const mismatched = makeEntry("j1", "2026-02-10");
      const second = makeEntry("j2", "2026-02-12");
      const history: JournalHistory = { "2026-02-12": [mismatched, second] };

      expect(
        applyJournalEntryUpdate(
          history,
          "j1",
          { title: "t", content: "c", date: "2026-02-01" },
          NOW,
        ),
      ).toEqual({
        "2026-02-12": [second],
        "2026-02-01": [
          {
            ...mismatched,
            date: "2026-02-01",
            title: "t",
            content: "c",
            updatedAt: NOW,
          },
        ],
      });
    });
  });

  it("見つからないときは同じ history をそのまま返す", () => {
    const history: JournalHistory = {
      "2026-02-12": [makeEntry("j1", "2026-02-12")],
    };

    const result = applyJournalEntryUpdate(
      history,
      "missing",
      { title: "t", content: "c", date: "2026-02-01" },
      NOW,
    );

    expect(result).toBe(history);
  });

  it("入力の history とエントリを書き換えない", () => {
    const target = makeEntry("j1", "2026-02-12");
    const history: JournalHistory = {
      "2026-02-12": [target],
      "2026-02-01": [makeEntry("j2", "2026-02-01")],
    };
    const snapshot = JSON.parse(JSON.stringify(history)) as JournalHistory;

    applyJournalEntryUpdate(
      history,
      "j1",
      { title: "t", content: "c", date: "2026-02-01" },
      NOW,
    );
    applyJournalEntryUpdate(history, "j1", { title: "t", content: "c" }, NOW);

    expect(history).toEqual(snapshot);
  });
});
