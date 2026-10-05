import { notFound } from "../../errors";
import type { SyncDocData } from "../../syncDoc";
import { readArray } from "../dataAccess";
import { TODO_LISTS_FIELD } from "./todoStoreConstants";
import type { TodoList } from "./todoTypes";

export const readLists = (data: SyncDocData): TodoList[] =>
  readArray<TodoList>(data, TODO_LISTS_FIELD);

/** 指定リストとその位置を返す。無ければ 404 */
export const findList = (
  lists: TodoList[],
  listId: string,
): { list: TodoList; index: number } => {
  const index = lists.findIndex((list) => list.id === listId);
  if (index < 0) throw notFound("リスト");
  return { list: lists[index], index };
};

export const replaceList = (
  lists: TodoList[],
  index: number,
  updated: TodoList,
): TodoList[] => lists.map((list, i) => (i === index ? updated : list));

export const toListChanges = (lists: TodoList[]): SyncDocData => ({
  [TODO_LISTS_FIELD]: lists,
});
