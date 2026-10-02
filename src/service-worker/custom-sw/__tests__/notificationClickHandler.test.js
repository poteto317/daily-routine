import { handleNotificationClick } from "../notificationClickHandler";

describe("handleNotificationClick", () => {
  let mockEvent;
  let mockNotificationClose;

  beforeEach(() => {
    mockNotificationClose = jest.fn();
    mockEvent = {
      notification: { close: mockNotificationClose },
      waitUntil: jest.fn((promise) => promise),
    };
  });

  it("通知を閉じ、既存の同一オリジンウィンドウがあれば focus する", async () => {
    const mockFocus = jest.fn().mockResolvedValue(undefined);
    const origin = self.location.origin;
    const mockClients = [
      {
        url: `${origin}/routine`,
        focus: mockFocus,
      },
    ];

    global.clients = {
      matchAll: jest.fn().mockResolvedValue(mockClients),
      openWindow: jest.fn(),
    };

    handleNotificationClick(mockEvent);

    expect(mockNotificationClose).toHaveBeenCalledTimes(1);
    expect(mockEvent.waitUntil).toHaveBeenCalled();

    await mockEvent.waitUntil.mock.results[0].value;

    expect(mockFocus).toHaveBeenCalledTimes(1);
    expect(global.clients.openWindow).not.toHaveBeenCalled();
  });

  it("既存ウィンドウがない場合は openWindow を呼び出す", async () => {
    const origin = self.location.origin;
    global.clients = {
      matchAll: jest.fn().mockResolvedValue([]),
      openWindow: jest.fn().mockResolvedValue(undefined),
    };

    handleNotificationClick(mockEvent);

    await mockEvent.waitUntil.mock.results[0].value;

    expect(global.clients.openWindow).toHaveBeenCalledWith(`${origin}/`);
  });

  it("既存ウィンドウが異なるオリジンの場合は openWindow を呼び出す", async () => {
    const origin = self.location.origin;
    const mockClients = [
      {
        url: "https://different-origin.com/routine",
        focus: jest.fn(),
      },
    ];

    global.clients = {
      matchAll: jest.fn().mockResolvedValue(mockClients),
      openWindow: jest.fn().mockResolvedValue(undefined),
    };

    handleNotificationClick(mockEvent);

    await mockEvent.waitUntil.mock.results[0].value;

    expect(global.clients.openWindow).toHaveBeenCalledWith(`${origin}/`);
  });
});
