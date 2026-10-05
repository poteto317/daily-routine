import { emptyPatch, notFound } from "../errors";
import { parseBody, type JsonObject } from "../validation";
import { readArray } from "./dataAccess";
import { generateId } from "./idGenerator";
import { createdOutcome, deletedOutcome, okOutcome } from "./outcomes";
import type { Operation, ResourceOperations } from "./types";

type Item = Record<string, unknown> & { id: string };

type SimpleCollectionConfig = {
  /** users/{uid} 上のフィールド名 */
  field: string;
  /** list 応答のキー（複数形） */
  responseKey: string;
  /** create / update 応答のキー（単数形） */
  itemKey: string;
  idPrefix: string;
  allowedKeys: readonly string[];
  parseCreate: (body: JsonObject) => Record<string, unknown>;
  parsePatch: (body: JsonObject) => Record<string, unknown>;
};

export const createSimpleCollection = (
  config: SimpleCollectionConfig,
): ResourceOperations => {
  const { field, responseKey, itemKey, idPrefix, allowedKeys } = config;

  const list: Operation = ({ data }) =>
    okOutcome({ [responseKey]: readArray<Item>(data, field) });

  const create: Operation = ({ data, body, now }) => {
    const input = parseBody(body, allowedKeys);
    const createdFields = config.parseCreate(input);
    const item: Item = {
      id: generateId(idPrefix, now),
      ...createdFields,
      createdAt: now.toISOString(),
    };
    for (const [key, value] of Object.entries(createdFields)) {
      if (value === null) delete item[key];
    }
    return createdOutcome(
      { [itemKey]: item },
      { [field]: [...readArray<Item>(data, field), item] },
    );
  };

  const update: Operation = ({ data, id, body }) => {
    const input = parseBody(body, allowedKeys);
    const items = readArray<Item>(data, field);
    const existing = items.find((item) => item.id === id);
    if (!existing) throw notFound("対象");
    const patch = config.parsePatch(input);
    if (Object.keys(patch).length === 0) throw emptyPatch();
    const updated: Item = { ...existing, ...patch };
    for (const [key, value] of Object.entries(patch)) {
      if (value === null) delete updated[key];
    }
    return okOutcome(
      { [itemKey]: updated },
      { [field]: items.map((item) => (item.id === id ? updated : item)) },
    );
  };

  const remove: Operation = ({ data, id }) => {
    const items = readArray<Item>(data, field);
    if (!items.some((item) => item.id === id)) throw notFound("対象");
    return deletedOutcome(id, {
      [field]: items.filter((item) => item.id !== id),
    });
  };

  return { list, create, update, remove };
};
