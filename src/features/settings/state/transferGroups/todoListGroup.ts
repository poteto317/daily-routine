import {
  getTodoCategories,
  getTodoLists,
  saveTodoCategories,
  saveTodoLists,
} from "@/features/todo-lists/storage";
import { DATA_TRANSFER_ERROR_MESSAGES } from "../errorMessages";
import { arrayField, type TransferField } from "../transferPayloadRestore";
import type { TransferPayload } from "../transferPayloadRestore";

const invalid = DATA_TRANSFER_ERROR_MESSAGES.invalidFieldFormat;

/** Todoリストグループ。リスト本体とカテゴリは片方だけ移すと参照が壊れる */
export const collectTodoListTransferData = (): TransferPayload => ({
  todoLists: getTodoLists(),
  todoCategories: getTodoCategories(),
});

export const TODO_LIST_TRANSFER_FIELDS: TransferField[] = [
  arrayField("todoLists", saveTodoLists, invalid("todoLists")),
  arrayField("todoCategories", saveTodoCategories, invalid("todoCategories")),
];
