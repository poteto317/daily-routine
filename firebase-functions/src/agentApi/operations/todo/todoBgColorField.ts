import { readEnum, type JsonObject } from "../../validation";
import { TODO_BG_COLORS, type TodoBgColor } from "./todoTypes";

/** 背景色フィールドを読み取る。null は「デフォルトに戻す（キーを消す）」、未指定は undefined */
export const readBgColor = (
  body: JsonObject,
  field: string,
): TodoBgColor | null | undefined =>
  body[field] === null ? null : readEnum(body, field, TODO_BG_COLORS);
