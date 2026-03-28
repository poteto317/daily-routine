import type { TodoList } from "./types";
import { saveTodoLists } from "./storage";
import { uploadToFirestore } from "@/features/sync";

export const saveAndSyncTodoLists = (lists: TodoList[]): void => {
  saveTodoLists(lists);

  void uploadToFirestore().catch(() => {
    // Sync failed silently
  });
};
