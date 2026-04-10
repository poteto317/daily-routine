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

  it("ローカル保存後にクラウド同期を開始する", async () => {
    (uploadToFirestore as jest.Mock).mockResolvedValue(undefined);
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
    await Promise.resolve();

    expect(saveTodoLists).toHaveBeenCalledWith(lists);
    expect(uploadToFirestore).toHaveBeenCalled();
  });

  it("クラウド同期失敗でもローカル保存は維持する", async () => {
    const rejectSpy = jest.spyOn(Promise, "resolve");
    (uploadToFirestore as jest.Mock).mockRejectedValue(
      new Error("sync failed"),
    );

    expect(() => saveAndSyncTodoLists([])).not.toThrow();
    await Promise.resolve();

    expect(saveTodoLists).toHaveBeenCalledWith([]);
    expect(uploadToFirestore).toHaveBeenCalled();

    rejectSpy.mockRestore();
  });
});
