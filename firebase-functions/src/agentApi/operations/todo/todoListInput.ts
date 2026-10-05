import { emptyPatch } from "../../errors";
import {
  compact,
  readBoolean,
  readEnum,
  readString,
  required,
  type JsonObject,
} from "../../validation";
import { readBgColor } from "./todoBgColorField";
import {
  ADD_ITEM_POSITIONS,
  type AddItemPosition,
  type TodoBgColor,
} from "./todoTypes";

/** リスト作成・更新の本文に指定できるキー */
export const TODO_LIST_KEYS = [
  "title",
  "addItemPosition",
  "defaultItemBgColor",
  "isHidden",
  "hideCompleted",
] as const;

const LIST_TITLE_OPTIONS = { maxLength: 100, trim: true } as const;

export type ListFields = {
  title?: string;
  addItemPosition?: AddItemPosition;
  defaultItemBgColor?: TodoBgColor | null;
  isHidden?: boolean;
  hideCompleted?: boolean;
};

const readListFields = (input: JsonObject): ListFields =>
  compact({
    title: readString(input, "title", LIST_TITLE_OPTIONS),
    addItemPosition: readEnum(input, "addItemPosition", ADD_ITEM_POSITIONS),
    defaultItemBgColor: readBgColor(input, "defaultItemBgColor"),
    isHidden: readBoolean(input, "isHidden"),
    hideCompleted: readBoolean(input, "hideCompleted"),
  });

/** リスト作成用の本文を検証する。title は必須 */
export const parseCreateListInput = (
  input: JsonObject,
): ListFields & { title: string } => ({
  ...readListFields(input),
  title: required("title", readString(input, "title", LIST_TITLE_OPTIONS)),
});

/** リスト更新用の本文を検証する。空の本文は 400 empty_patch */
export const parseListPatchInput = (input: JsonObject): ListFields => {
  const patch = readListFields(input);
  if (Object.keys(patch).length === 0) throw emptyPatch();
  return patch;
};
