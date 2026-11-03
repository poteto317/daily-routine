import { generateId } from "../idGenerator";
import type { CreateJournalInput, JournalPatchInput } from "./journalInput";
import type { JournalEntry } from "./journalTypes";

/** 検証済みの入力から新しいジャーナルを作る。createdAt と updatedAt は同じ時刻にする */
export const createJournalEntry = (
  input: CreateJournalInput,
  now: Date,
): JournalEntry => {
  const timestamp = now.toISOString();
  return {
    id: generateId("journal", now),
    date: input.date,
    title: input.title,
    content: input.content,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
};

/**
 * 既存のジャーナルへパッチを適用し、updatedAt を現在時刻にする。
 * createdAt は保つ。date はパッチに含まれるときだけ変える
 * （バケットの移動は journalStore の replaceOrMoveEntry が行う）。
 */
export const applyJournalPatch = (
  existing: JournalEntry,
  patch: JournalPatchInput,
  now: Date,
): JournalEntry => ({
  ...existing,
  ...patch,
  updatedAt: now.toISOString(),
});
