import { notFound } from "../../errors";
import { parseBody } from "../../validation";
import { createdOutcome, deletedOutcome, okOutcome } from "../outcomes";
import type { Operation, ResourceOperations } from "../types";
import { assertCategoryExists } from "./todoCategoryRule";
import { applyItemPatch, createTodoItem } from "./todoItemEntity";
import {
  parseCreateItemInput,
  parseItemPatchInput,
  TODO_ITEM_CREATE_KEYS,
  TODO_ITEM_UPDATE_KEYS,
} from "./todoItemInput";
import { insertItem, moveItem } from "./todoItemMovement";
import { updateListItems } from "./todoListEntity";
import { parseQueryCompleted, parseQueryListId } from "./todoQueryParams";
import {
  findList,
  readLists,
  replaceList,
  toListChanges,
} from "./todoStore";

const list: Operation = ({ data, query }) => {
  const listId = parseQueryListId(query.listId);
  const completed = parseQueryCompleted(query.completed);
  const { list: found } = findList(readLists(data), listId);
  const allItemsWithIndex = found.items.map((item, index) => ({
    ...item,
    index,
  }));
  const items =
    completed === undefined
      ? allItemsWithIndex
      : allItemsWithIndex.filter((item) => item.isCompleted === completed);
  return okOutcome({
    listId,
    items,
  });
};

const create: Operation = ({ data, body, now }) => {
  const input = parseCreateItemInput(parseBody(body, TODO_ITEM_CREATE_KEYS));
  const lists = readLists(data);
  const found = findList(lists, input.listId);
  if (input.fields.categoryId) {
    assertCategoryExists(data, input.fields.categoryId);
  }

  const item = createTodoItem(input.fields, found.list, now);
  const items = insertItem(
    found.list.items,
    item,
    found.list.addItemPosition,
    input.insertAfterIndex,
  );
  return createdOutcome(
    { item, index: items.indexOf(item) },
    toListChanges(
      replaceList(lists, found.index, updateListItems(found.list, items, now)),
    ),
  );
};

const update: Operation = ({ data, id, body, now }) => {
  const input = parseItemPatchInput(parseBody(body, TODO_ITEM_UPDATE_KEYS));
  const lists = readLists(data);
  const found = findList(lists, input.listId);
  const position = found.list.items.findIndex((item) => item.id === id);
  if (position < 0) throw notFound("アイテム");
  if (input.fields.categoryId) {
    assertCategoryExists(data, input.fields.categoryId);
  }

  const updated = applyItemPatch(found.list.items[position], input.fields);
  const patched = found.list.items.map((item, i) =>
    i === position ? updated : item,
  );
  const items =
    input.moveToIndex === undefined
      ? patched
      : moveItem(patched, position, input.moveToIndex);
  return okOutcome(
    { item: updated, index: items.indexOf(updated) },
    toListChanges(
      replaceList(lists, found.index, updateListItems(found.list, items, now)),
    ),
  );
};

const remove: Operation = ({ data, id, query, now }) => {
  const listId = parseQueryListId(query.listId);
  const lists = readLists(data);
  const found = findList(lists, listId);
  if (!found.list.items.some((item) => item.id === id)) {
    throw notFound("アイテム");
  }
  const items = found.list.items.filter((item) => item.id !== id);
  return deletedOutcome(
    id as string,
    toListChanges(
      replaceList(lists, found.index, updateListItems(found.list, items, now)),
    ),
  );
};

export const todoItemOperations: ResourceOperations = {
  list,
  create,
  update,
  remove,
};
