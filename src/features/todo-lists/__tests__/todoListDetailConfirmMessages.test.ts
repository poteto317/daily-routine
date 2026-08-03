import { createDeleteItemConfirmMessage } from "../todoListDetailConfirmMessages";

describe("todoListDetailConfirmMessages", () => {
  describe("createDeleteItemConfirmMessage", () => {
    it("{title} をアイテム名に置換してメッセージを返す", () => {
      expect(createDeleteItemConfirmMessage("朝のランニング")).toBe(
        "「朝のランニング」を削除しますか？",
      );
    });

    it("空文字のタイトルでもメッセージを組み立てる", () => {
      expect(createDeleteItemConfirmMessage("")).toBe("「」を削除しますか？");
    });
  });
});
