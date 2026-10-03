/** @jest-environment node */
import {
  assertEntryNotBlank,
  parseCreateJournalInput,
  parseJournalPatchInput,
} from "../../operations/journal/journalInput";
import { expectApiError } from "../testUtils";

describe("assertEntryNotBlank", () => {
  it("どちらかに内容があれば通す", () => {
    expect(() => assertEntryNotBlank("題", "")).not.toThrow();
    expect(() => assertEntryNotBlank("", "本文")).not.toThrow();
  });

  it("どちらも空・空白のみなら 400 empty_entry", () => {
    expectApiError(() => assertEntryNotBlank("", ""), 400, "empty_entry");
    expectApiError(() => assertEntryNotBlank(" ", "\n"), 400, "empty_entry");
  });
});

describe("parseCreateJournalInput", () => {
  it("title / content 省略時は空文字", () => {
    expect(
      parseCreateJournalInput({ date: "2026-10-01", content: "メモ" }),
    ).toEqual({ date: "2026-10-01", title: "", content: "メモ" });
  });

  it("本文の前後の空白は保持する（trim しない）", () => {
    expect(
      parseCreateJournalInput({ date: "2026-10-01", content: " メモ " })
        .content,
    ).toBe(" メモ ");
  });

  it("date 欠落・不正は 400 invalid_field", () => {
    expectApiError(
      () => parseCreateJournalInput({ content: "x" }),
      400,
      "invalid_field",
    );
    expectApiError(
      () => parseCreateJournalInput({ date: "2026-02-30", content: "x" }),
      400,
      "invalid_field",
    );
  });

  it("両方空は 400 empty_entry", () => {
    expectApiError(
      () => parseCreateJournalInput({ date: "2026-10-01" }),
      400,
      "empty_entry",
    );
  });

  it("title は 200 文字、content は 20000 文字まで", () => {
    expect(() =>
      parseCreateJournalInput({ date: "2026-10-01", title: "a".repeat(200) }),
    ).not.toThrow();
    expectApiError(
      () =>
        parseCreateJournalInput({ date: "2026-10-01", title: "a".repeat(201) }),
      400,
      "invalid_field",
    );
    expect(() =>
      parseCreateJournalInput({
        date: "2026-10-01",
        content: "a".repeat(20000),
      }),
    ).not.toThrow();
    expectApiError(
      () =>
        parseCreateJournalInput({
          date: "2026-10-01",
          content: "a".repeat(20001),
        }),
      400,
      "invalid_field",
    );
  });
});

describe("parseJournalPatchInput", () => {
  it("指定したフィールドだけを返す（空文字も有効な指定）", () => {
    expect(parseJournalPatchInput({ title: "題" })).toEqual({ title: "題" });
    expect(parseJournalPatchInput({ content: "" })).toEqual({ content: "" });
  });

  it("空の本文は 400 empty_patch", () => {
    expectApiError(() => parseJournalPatchInput({}), 400, "empty_patch");
  });

  it("文字種・長さの違反は 400 invalid_field", () => {
    expectApiError(
      () => parseJournalPatchInput({ title: 1 }),
      400,
      "invalid_field",
    );
    expectApiError(
      () => parseJournalPatchInput({ title: "a".repeat(201) }),
      400,
      "invalid_field",
    );
  });
});
