import { emptyPatch } from "../../errors";
import {
  compact,
  readBoolean,
  readInteger,
  readString,
  required,
  type JsonObject,
} from "../../validation";
import { readBgColor } from "./todoBgColorField";
import { readNullableId } from "./todoNullableIdField";
import { MAX_INDENT, type TodoBgColor } from "./todoTypes";

/** アイテム作成の本文に指定できるキー */
export const TODO_ITEM_CREATE_KEYS = [
  "listId",
  "title",
  "bgColor",
  "categoryId",
  "indent",
  "insertAfterIndex",
] as const;

/** アイテム更新の本文に指定できるキー */
export const TODO_ITEM_UPDATE_KEYS = [
  "listId",
  "title",
  "isCompleted",
  "bgColor",
  "categoryId",
  "indent",
  "moveToIndex",
] as const;

const ITEM_TITLE_OPTIONS = { maxLength: 500, trim: true } as const;
const ID_OPTIONS = { maxLength: 200, trim: true } as const;
const INDENT_RANGE = { min: 0, max: MAX_INDENT } as const;
const INDEX_RANGE = { min: 0, max: 100000 } as const;

export type ItemFields = {
  title?: string;
  isCompleted?: boolean;
  indent?: number;
  bgColor?: TodoBgColor | null;
  categoryId?: string | null;
};

const readItemFields = (input: JsonObject): ItemFields =>
  compact({
    title: readString(input, "title", ITEM_TITLE_OPTIONS),
    isCompleted: readBoolean(input, "isCompleted"),
    indent: readInteger(input, "indent", INDENT_RANGE),
    bgColor: readBgColor(input, "bgColor"),
    categoryId: readNullableId(input, "categoryId"),
  });

const readListId = (input: JsonObject): string =>
  required("listId", readString(input, "listId", ID_OPTIONS));

export type CreateItemInput = {
  listId: string;
  fields: ItemFields & { title: string };
  insertAfterIndex?: number;
};

/** アイテム作成用の本文を検証する。listId と title は必須 */
export const parseCreateItemInput = (input: JsonObject): CreateItemInput => ({
  listId: readListId(input),
  fields: {
    ...readItemFields(input),
    title: required("title", readString(input, "title", ITEM_TITLE_OPTIONS)),
  },
  insertAfterIndex: readInteger(input, "insertAfterIndex", INDEX_RANGE),
});

export type ItemPatchInput = {
  listId: string;
  fields: ItemFields;
  moveToIndex?: number;
};

/** アイテム更新用の本文を検証する。listId 以外に指定が無ければ 400 empty_patch */
export const parseItemPatchInput = (input: JsonObject): ItemPatchInput => {
  const patch: ItemPatchInput = {
    listId: readListId(input),
    fields: readItemFields(input),
    moveToIndex: readInteger(input, "moveToIndex", INDEX_RANGE),
  };
  if (
    Object.keys(patch.fields).length === 0 &&
    patch.moveToIndex === undefined
  ) {
    throw emptyPatch();
  }
  return patch;
};
