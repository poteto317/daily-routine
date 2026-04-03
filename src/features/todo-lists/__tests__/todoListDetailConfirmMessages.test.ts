import {
  createDeleteItemConfirmMessage,
  createDeleteListConfirmMessage,
} from "../todoListDetailConfirmMessages";

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

  describe("createDeleteListConfirmMessage", () => {
    it("{title} をリスト名に置換してメッセージを返す", () => {
      expect(createDeleteListConfirmMessage("Inbox")).toBe(
        "「Inbox」を削除しますか？この操作は元に戻せません。",
      );
    });

    it("空文字のタイトルでもメッセージを組み立てる", () => {
      expect(createDeleteListConfirmMessage("")).toBe(
        "「」を削除しますか？この操作は元に戻せません。",
      );
    });
  });
});
