import { notFound } from "../../errors";
import { parseBody, parseQueryDate } from "../../validation";
import { createdOutcome, deletedOutcome, okOutcome } from "../outcomes";
import type { Operation, ResourceOperations } from "../types";
import { applyJournalPatch, createJournalEntry } from "./journalEntity";
import {
  assertEntryNotBlank,
  JOURNAL_CREATE_KEYS,
  JOURNAL_UPDATE_KEYS,
  parseCreateJournalInput,
  parseJournalPatchInput,
} from "./journalInput";
import {
  addEntry,
  findEntry,
  listEntries,
  readHistory,
  removeEntry,
  replaceEntry,
  toJournalChanges,
} from "./journalStore";

const list: Operation = ({ data, query }) => {
  const date = parseQueryDate(query.date);
  return okOutcome({ entries: listEntries(readHistory(data), date) });
};

const create: Operation = ({ data, body, now }) => {
  const input = parseCreateJournalInput(parseBody(body, JOURNAL_CREATE_KEYS));
  const entry = createJournalEntry(input, now);
  return createdOutcome(
    { entry },
    toJournalChanges(addEntry(readHistory(data), entry)),
  );
};

const update: Operation = ({ data, id, body, now }) => {
  const input = parseBody(body, JOURNAL_UPDATE_KEYS);
  const history = readHistory(data);
  const found = findEntry(history, id);
  if (!found) throw notFound("ジャーナル");

  const updated = applyJournalPatch(
    found.entry,
    parseJournalPatchInput(input),
    now,
  );
  assertEntryNotBlank(updated.title, updated.content);
  return okOutcome(
    { entry: updated },
    toJournalChanges(replaceEntry(history, found.key, updated)),
  );
};

const remove: Operation = ({ data, id }) => {
  const history = readHistory(data);
  const found = findEntry(history, id);
  if (!found) throw notFound("ジャーナル");
  return deletedOutcome(
    id,
    toJournalChanges(removeEntry(history, found.key, found.entry.id)),
  );
};

export const journalOperations: ResourceOperations = {
  list,
  create,
  update,
  remove,
};
