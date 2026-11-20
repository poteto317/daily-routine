/** @jest-environment node */
import { createScrumBoardItem } from "../createScrumBoardItem";

const params = {
  credentials: "reporter:password",
  projectId: 8,
  origin: "https://board.example.test",
  content: { title: "😀".repeat(201), body: "改善提案と添付画像" },
};

describe("createScrumBoardItem", () => {
  const originalFetch = global.fetch;
  afterEach(() => {
    global.fetch = originalFetch;
  });

  it("対象プロジェクトの Todo に作成し、公開番号と詳細 URL を返す", async () => {
    const fetchMock = jest
      .fn()
      .mockResolvedValueOnce(
        Response.json({
          columns: [
            { name: "Doing", id: 2 },
            { name: "Todo", id: 1 },
          ],
        }),
      )
      .mockResolvedValueOnce(
        Response.json(
          { id: 242, number: 17, projectId: 8, columnId: 1 },
          { status: 201 },
        ),
      );
    global.fetch = fetchMock;

    await expect(createScrumBoardItem(params)).resolves.toEqual({
      issueNumber: 17,
      issueUrl: "https://board.example.test/items/17?project=8",
    });
    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      new URL("https://board.example.test/api/board?projectId=8"),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Basic cmVwb3J0ZXI6cGFzc3dvcmQ=",
        }),
      }),
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      new URL("https://board.example.test/api/items"),
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          projectId: 8,
          columnId: 1,
          title: "😀".repeat(200),
          description: params.content.body,
        }),
      }),
    );
  });

  it("Todo 列を解決できなければ作成しない", async () => {
    const fetchMock = jest
      .fn()
      .mockResolvedValue(Response.json({ columns: [] }));
    global.fetch = fetchMock;
    await expect(createScrumBoardItem(params)).rejects.toThrow("Todo");
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("作成が拒否されたら応答本文を露出せず再送しない", async () => {
    const fetchMock = jest
      .fn()
      .mockResolvedValueOnce(
        Response.json({ columns: [{ name: "Todo", id: 1 }] }),
      )
      .mockResolvedValueOnce(new Response("private response", { status: 403 }));
    global.fetch = fetchMock;
    await expect(createScrumBoardItem(params)).rejects.toThrow(
      /^スクラムかんばんに起票できません \(status=403\)$/,
    );
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
  it("作成応答が別プロジェクトなら起票成功として記録しない", async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce(
        Response.json({ columns: [{ name: "Todo", id: 1 }] }),
      )
      .mockResolvedValueOnce(
        Response.json(
          { number: 17, projectId: 9, columnId: 1 },
          { status: 201 },
        ),
      );

    await expect(createScrumBoardItem(params)).rejects.toThrow(
      "起票結果を確認できません",
    );
  });
  it("壊れた作成応答の本文をエラーに含めない", async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce(
        Response.json({ columns: [{ name: "Todo", id: 1 }] }),
      )
      .mockResolvedValueOnce(new Response("private response", { status: 201 }));

    await expect(createScrumBoardItem(params)).rejects.toThrow(
      /^スクラムかんばんの起票結果を確認できません$/,
    );
  });
});
