import { logToClient } from "../logToClient";

describe("logToClient", () => {
  it("すべてのクライアントに SW_LOG メッセージを送信する", async () => {
    const mockPostMessage1 = jest.fn();
    const mockPostMessage2 = jest.fn();
    const mockClients = [
      { postMessage: mockPostMessage1 },
      { postMessage: mockPostMessage2 },
    ];

    global.self.clients = {
      matchAll: jest.fn().mockResolvedValue(mockClients),
    };

    logToClient("test message");

    // matchAll は Promise を返すので解決を待つ
    await Promise.resolve();

    expect(mockPostMessage1).toHaveBeenCalledWith({
      type: "SW_LOG",
      message: "test message",
    });
    expect(mockPostMessage2).toHaveBeenCalledWith({
      type: "SW_LOG",
      message: "test message",
    });
  });
});
