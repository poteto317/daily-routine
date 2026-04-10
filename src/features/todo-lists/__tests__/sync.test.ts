import { saveAndSyncTodoLists } from "../sync";

jest.mock("../storage", () => ({
  saveTodoLists: jest.fn(),
}));

jest.mock("@/features/sync", () => ({
  uploadToFirestore: jest.fn(),
}));

import { saveTodoLists } from "../storage";
import { uploadToFirestore } from "@/features/sync";

describe("todo-lists sync", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("ローカル保存のみを行い自動クラウド同期は実行しない", () => {
    const lists = [
      {
        id: "list-1",
        title: "買い物",
        items: [],
        createdAt: "2026-03-10T00:00:00.000Z",
        updatedAt: "2026-03-10T00:00:00.000Z",
      },
    ];

    saveAndSyncTodoLists(lists);

    expect(saveTodoLists).toHaveBeenCalledWith(lists);
    expect(uploadToFirestore).not.toHaveBeenCalled();
  });

  it("例外を投げない", () => {
    expect(() => saveAndSyncTodoLists([])).not.toThrow();
    expect(saveTodoLists).toHaveBeenCalledWith([]);
    expect(uploadToFirestore).not.toHaveBeenCalled();
  });
});
