/** @jest-environment node */
import { scrumBoardOrigin, scrumBoardProjectId } from "../config";

describe("報告・問い合わせの起票先パラメータ", () => {
  it("未指定時は daily-routine のスクラムかんばんを使用する", () => {
    expect(scrumBoardOrigin.options.default).toBe(
      "https://scrum-board-jkcejsb6ka-an.a.run.app",
    );
    expect(scrumBoardProjectId.options.default).toBe(8);
  });
});
