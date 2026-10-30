import {
  addWorkTemplate,
  getWorkSessionHistory,
  getWorkTemplates,
  saveWorkSessionHistory,
  saveWorkTemplates,
} from "../storage";
import {
  mockGenerateId,
  mockGetStorageItem,
  mockSetStorageItem,
  setupDefaultStorageMocks,
} from "./storage.test-utils";

jest.mock("@/lib/storage/core");

describe("work-tracker storage templates/history", () => {
  let toISOStringSpy: jest.SpyInstance | undefined;

  beforeEach(() => setupDefaultStorageMocks());

  afterEach(() => {
    toISOStringSpy?.mockRestore();
    toISOStringSpy = undefined;
  });

  it("getWorkTemplates/saveWorkTemplatesがテンプレートを入出力する", () => {
    const templates = [{ id: "t1", name: "開発" }];
    mockGetStorageItem.mockReturnValue(templates as never);

    const result = getWorkTemplates();
    saveWorkTemplates(templates as never);

    expect(result).toEqual(templates);
    expect(mockGetStorageItem).toHaveBeenCalledWith("work-templates", []);
    expect(mockSetStorageItem).toHaveBeenCalledWith(
      "work-templates",
      templates,
    );
  });

  it("addWorkTemplateがIDと日時付きで追加保存する", () => {
    mockGenerateId.mockReturnValue("wt-1");
    toISOStringSpy = jest
      .spyOn(Date.prototype, "toISOString")
      .mockReturnValue("2026-02-12T10:00:00.000Z");

    const result = addWorkTemplate("設計");

    expect(result).toEqual({
      id: "wt-1",
      name: "設計",
      createdAt: "2026-02-12T10:00:00.000Z",
      updatedAt: "2026-02-12T10:00:00.000Z",
    });
    expect(mockSetStorageItem).toHaveBeenCalledWith("work-templates", [result]);
  });

  it("getWorkSessionHistory/saveWorkSessionHistoryが履歴を入出力する", () => {
    const history = { "2026-02-12": [{ id: "s1" }] };
    mockGetStorageItem.mockReturnValue(history as never);

    const result = getWorkSessionHistory();
    saveWorkSessionHistory(history as never);

    expect(result).toEqual(history);
    expect(mockGetStorageItem).toHaveBeenCalledWith("work-sessions", {});
    expect(mockSetStorageItem).toHaveBeenCalledWith("work-sessions", history);
  });
});
