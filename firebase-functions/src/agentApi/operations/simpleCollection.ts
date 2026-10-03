import { ApiError, notFound } from "../errors";
import { asJsonObject, assertKnownKeys, type JsonObject } from "../validation";
import { readArray } from "./dataAccess";
import { generateId } from "./idGenerator";
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

  const list: Operation = ({ data }) => ({
    status: 200,
    body: { [responseKey]: readArray<Item>(data, field) },
  });

  const create: Operation = ({ data, body, now }) => {
    const input = asJsonObject(body);
    assertKnownKeys(input, allowedKeys);
    const item: Item = {
      id: generateId(idPrefix, now),
      ...config.parseCreate(input),
      createdAt: now.toISOString(),
    };
    return {
      status: 201,
      body: { [itemKey]: item },
      changes: { [field]: [...readArray<Item>(data, field), item] },
    };
  };

  const update: Operation = ({ data, id, body }) => {
    const input = asJsonObject(body);
    assertKnownKeys(input, allowedKeys);
    const items = readArray<Item>(data, field);
    const existing = items.find((item) => item.id === id);
    if (!existing) throw notFound("対象");
    const patch = config.parsePatch(input);
    if (Object.keys(patch).length === 0) {
      throw new ApiError(400, "empty_patch", "更新するフィールドを指定してください");
    }
    const updated: Item = { ...existing, ...patch };
    return {
      status: 200,
      body: { [itemKey]: updated },
      changes: {
        [field]: items.map((item) => (item.id === id ? updated : item)),
      },
    };
  };

  const remove: Operation = ({ data, id }) => {
    const items = readArray<Item>(data, field);
    if (!items.some((item) => item.id === id)) throw notFound("対象");
    return {
      status: 200,
      body: { deleted: id },
      changes: { [field]: items.filter((item) => item.id !== id) },
    };
  };

  return { list, create, update, remove };
};
