import { ApiError, emptyPatch } from "../../errors";
import {
  compact,
  readDate,
  readString,
  required,
  type JsonObject,
} from "../../validation";

/** ジャーナル作成の本文に指定できるキー */
export const JOURNAL_CREATE_KEYS = ["date", "title", "content"] as const;
/** ジャーナル更新の本文に指定できるキー（date を指定すると、記録の日付を変えてその日付のバケットへ移す） */
export const JOURNAL_UPDATE_KEYS = ["date", "title", "content"] as const;

const TITLE_OPTIONS = { maxLength: 200, allowEmpty: true } as const;
const CONTENT_OPTIONS = { maxLength: 20000, allowEmpty: true } as const;

/** title と content がどちらも空（空白のみを含む）なら 400 empty_entry */
export const assertEntryNotBlank = (title: string, content: string): void => {
  if (title.trim() === "" && content.trim() === "") {
    throw new ApiError(
      400,
      "empty_entry",
      "title か content のどちらかは空にできません",
    );
  }
};

export type CreateJournalInput = {
  date: string;
  title: string;
  content: string;
};

/** 作成用の本文を検証する。date は必須、title / content は省略時 "" */
export const parseCreateJournalInput = (
  input: JsonObject,
): CreateJournalInput => {
  const date = required("date", readDate(input, "date"));
  const title = readString(input, "title", TITLE_OPTIONS) ?? "";
  const content = readString(input, "content", CONTENT_OPTIONS) ?? "";
  assertEntryNotBlank(title, content);
  return { date, title, content };
};

export type JournalPatchInput = Partial<{
  date: string;
  title: string;
  content: string;
}>;

/**
 * 更新用の本文を検証する。空の本文は 400 empty_patch。
 * date は作成と同じ検証（形式と実在。未来の日付も受け付ける）
 */
export const parseJournalPatchInput = (
  input: JsonObject,
): JournalPatchInput => {
  const patch = compact({
    date: readDate(input, "date"),
    title: readString(input, "title", TITLE_OPTIONS),
    content: readString(input, "content", CONTENT_OPTIONS),
  });
  if (Object.keys(patch).length === 0) throw emptyPatch();
  return patch;
};
