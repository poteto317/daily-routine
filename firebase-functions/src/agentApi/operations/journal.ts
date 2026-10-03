import { ApiError, notFound } from "../errors";
import {
  asJsonObject,
  assertKnownKeys,
  compact,
  parseQueryDate,
  readDate,
  readString,
  required,
} from "../validation";
import { readObject } from "./dataAccess";
import { generateId } from "./idGenerator";
import type { Operation, ResourceOperations, SyncDocData } from "./types";

type JournalEntry = {
  id: string;
  date: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
};
type JournalHistory = Record<string, JournalEntry[]>;

const TITLE_OPTIONS = { maxLength: 200, allowEmpty: true } as const;
const CONTENT_OPTIONS = { maxLength: 20000, allowEmpty: true } as const;

const readHistory = (data: SyncDocData): JournalHistory =>
  readObject(data, "journalHistory") as JournalHistory;

const findEntry = (
  history: JournalHistory,
  id: string | undefined,
): { key: string; entry: JournalEntry } | null => {
  for (const [key, entries] of Object.entries(history)) {
    const entry = entries.find((candidate) => candidate.id === id);
    if (entry) return { key, entry };
  }
  return null;
};

const sortByLatest = (entries: JournalEntry[]): JournalEntry[] =>
  [...entries].sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));

const list: Operation = ({ data, query }) => {
  const date = parseQueryDate(query.date);
  const history = readHistory(data);
  const entries = date ? (history[date] ?? []) : Object.values(history).flat();
  return { status: 200, body: { entries: sortByLatest(entries) } };
};

const create: Operation = ({ data, body, now }) => {
  const input = asJsonObject(body);
  assertKnownKeys(input, ["date", "title", "content"]);
  const date = required("date", readDate(input, "date"));
  const title = readString(input, "title", TITLE_OPTIONS) ?? "";
  const content = readString(input, "content", CONTENT_OPTIONS) ?? "";
  if (title.trim() === "" && content.trim() === "") {
    throw new ApiError(400, "empty_entry", "title か content のどちらかは空にできません");
  }

  const timestamp = now.toISOString();
  const entry: JournalEntry = {
    id: generateId("journal", now),
    date,
    title,
    content,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
  const history = readHistory(data);
  return {
    status: 201,
    body: { entry },
    changes: {
      journalHistory: { ...history, [date]: [...(history[date] ?? []), entry] },
    },
  };
};

const update: Operation = ({ data, id, body, now }) => {
  const input = asJsonObject(body);
  assertKnownKeys(input, ["title", "content"]);
  const history = readHistory(data);
  const found = findEntry(history, id);
  if (!found) throw notFound("ジャーナル");
  const { key, entry: existing } = found;
  const patch = compact({
    title: readString(input, "title", TITLE_OPTIONS),
    content: readString(input, "content", CONTENT_OPTIONS),
  });
  if (Object.keys(patch).length === 0) {
    throw new ApiError(400, "empty_patch", "更新するフィールドを指定してください");
  }

  const updated: JournalEntry = {
    ...existing,
    ...patch,
    updatedAt: now.toISOString(),
  };
  if (updated.title.trim() === "" && updated.content.trim() === "") {
    throw new ApiError(400, "empty_entry", "title か content のどちらかは空にできません");
  }
  return {
    status: 200,
    body: { entry: updated },
    changes: {
      journalHistory: {
        ...history,
        [key]: history[key].map((entry) =>
          entry.id === updated.id ? updated : entry,
        ),
      },
    },
  };
};

const remove: Operation = ({ data, id }) => {
  const history = readHistory(data);
  const found = findEntry(history, id);
  if (!found) throw notFound("ジャーナル");
  const { key } = found;
  const remaining = history[key].filter((entry) => entry.id !== id);
  const { [key]: removedDay, ...otherDays } = history;
  void removedDay;
  return {
    status: 200,
    body: { deleted: id },
    changes: {
      journalHistory:
        remaining.length > 0
          ? { ...otherDays, [key]: remaining }
          : otherDays,
    },
  };
};

export const journalOperations: ResourceOperations = {
  list,
  create,
  update,
  remove,
};
