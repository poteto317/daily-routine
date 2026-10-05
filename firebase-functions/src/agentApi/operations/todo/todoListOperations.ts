import { parseBody } from "../../validation";
import { createdOutcome, deletedOutcome, okOutcome } from "../outcomes";
import type { Operation, ResourceOperations } from "../types";
import { applyListPatch, createTodoList } from "./todoListEntity";
import {
  parseCreateListInput,
  parseListPatchInput,
  TODO_LIST_KEYS,
} from "./todoListInput";
import { summarizeList } from "./todoListSummary";
import {
  findList,
  readLists,
  replaceList,
  toListChanges,
} from "./todoStore";

const list: Operation = ({ data }) =>
  okOutcome({ lists: readLists(data).map(summarizeList) });

const create: Operation = ({ data, body, now }) => {
  const input = parseCreateListInput(parseBody(body, TODO_LIST_KEYS));
  const created = createTodoList(input, now);
  return createdOutcome(
    { list: summarizeList(created) },
    toListChanges([...readLists(data), created]),
  );
};

const update: Operation = ({ data, id, body, now }) => {
  const patch = parseListPatchInput(parseBody(body, TODO_LIST_KEYS));
  const lists = readLists(data);
  const found = findList(lists, id as string);
  const updated = applyListPatch(found.list, patch, now);
  return okOutcome(
    { list: summarizeList(updated) },
    toListChanges(replaceList(lists, found.index, updated)),
  );
};

const remove: Operation = ({ data, id }) => {
  const lists = readLists(data);
  const found = findList(lists, id as string);
  return deletedOutcome(
    found.list.id,
    toListChanges(lists.filter((_, index) => index !== found.index)),
  );
};

export const todoListOperations: ResourceOperations = {
  list,
  create,
  update,
  remove,
};
