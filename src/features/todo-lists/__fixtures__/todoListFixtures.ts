import type { TodoList } from "../types";

export const sampleTodoLists: TodoList[] = [
  {
    id: "list-1",
    title: "買い物リスト",
    items: [
      {
        id: "item-1",
        title: "牛乳",
        isCompleted: false,
        createdAt: "2026-05-22T10:00:00.000Z",
      },
      {
        id: "item-2",
        title: "卵",
        isCompleted: true,
        createdAt: "2026-05-22T10:01:00.000Z",
      },
      {
        id: "item-3",
        title: "パン",
        isCompleted: false,
        createdAt: "2026-05-22T10:02:00.000Z",
      },
    ],
    createdAt: "2026-05-22T10:00:00.000Z",
    updatedAt: "2026-05-22T10:05:00.000Z",
  },
  {
    id: "list-2",
    title: "仕事タスク",
    items: [
      {
        id: "item-4",
        title: "メールの返信",
        isCompleted: false,
        createdAt: "2026-05-23T09:00:00.000Z",
      },
      {
        id: "item-5",
        title: "週次レポート作成",
        isCompleted: false,
        createdAt: "2026-05-23T09:01:00.000Z",
      },
    ],
    createdAt: "2026-05-23T09:00:00.000Z",
    updatedAt: "2026-05-23T09:10:00.000Z",
  },
];
