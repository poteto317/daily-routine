import {
  addWorkTemplate,
  updateWorkTemplate,
  updateWorkTemplateLastUsed,
  deleteWorkTemplate,
  getOrCreateWorkTemplate,
} from "../storageTemplates";
import * as storageData from "../storageData";
import * as coreStorage from "@/lib/storage/core";
import { type WorkTemplate } from "@/types/routine";

jest.mock("../storageData");
jest.mock("@/lib/storage/core");

const mockGetWorkTemplates =
  storageData.getWorkTemplates as jest.MockedFunction<
    typeof storageData.getWorkTemplates
  >;
const mockSaveWorkTemplates =
  storageData.saveWorkTemplates as jest.MockedFunction<
    typeof storageData.saveWorkTemplates
  >;
const mockGenerateId = coreStorage.generateId as jest.MockedFunction<
  typeof coreStorage.generateId
>;

describe("work-tracker storageTemplates", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGenerateId.mockReturnValue("generated-template-id");
  });

  describe("addWorkTemplate", () => {
    it("新しいテンプレートを作成して保存し、作成したテンプレートを返す", () => {
      const templates: WorkTemplate[] = [];
      mockGetWorkTemplates.mockReturnValue(templates);

      const result = addWorkTemplate("資料作成");

      expect(result.id).toBe("generated-template-id");
      expect(result.name).toBe("資料作成");
      expect(result.createdAt).toBeDefined();
      expect(result.updatedAt).toBeDefined();
      expect(mockSaveWorkTemplates).toHaveBeenCalledWith([result]);
    });
  });

  describe("updateWorkTemplate", () => {
    it("指定IDのテンプレートの名前と更新日時を変更して保存する", () => {
      const template: WorkTemplate = {
        id: "t-1",
        name: "旧タスク",
        createdAt: "2026-03-01T00:00:00Z",
        updatedAt: "2026-03-01T00:00:00Z",
      };
      mockGetWorkTemplates.mockReturnValue([template]);

      updateWorkTemplate("t-1", "新タスク");

      expect(template.name).toBe("新タスク");
      expect(mockSaveWorkTemplates).toHaveBeenCalledWith([template]);
    });

    it("指定IDのテンプレートが存在しない場合は何もしない", () => {
      const template: WorkTemplate = {
        id: "t-1",
        name: "旧タスク",
        createdAt: "2026-03-01T00:00:00Z",
        updatedAt: "2026-03-01T00:00:00Z",
      };
      mockGetWorkTemplates.mockReturnValue([template]);

      updateWorkTemplate("non-existent-id", "新タスク");

      expect(mockSaveWorkTemplates).not.toHaveBeenCalled();
    });
  });

  describe("updateWorkTemplateLastUsed", () => {
    it("指定IDのテンプレートのlastUsedAtを更新して保存する", () => {
      const template: WorkTemplate = {
        id: "t-1",
        name: "開発",
        createdAt: "2026-03-01T00:00:00Z",
        updatedAt: "2026-03-01T00:00:00Z",
      };
      mockGetWorkTemplates.mockReturnValue([template]);

      updateWorkTemplateLastUsed("t-1");

      expect(template.lastUsedAt).toBeDefined();
      expect(mockSaveWorkTemplates).toHaveBeenCalledWith([template]);
    });

    it("指定IDのテンプレートが存在しない場合は何もしない", () => {
      mockGetWorkTemplates.mockReturnValue([]);

      updateWorkTemplateLastUsed("t-999");

      expect(mockSaveWorkTemplates).not.toHaveBeenCalled();
    });
  });

  describe("deleteWorkTemplate", () => {
    it("指定IDのテンプレートを除外して保存する", () => {
      const t1: WorkTemplate = {
        id: "t-1",
        name: "タスク1",
        createdAt: "2026-03-01T00:00:00Z",
        updatedAt: "2026-03-01T00:00:00Z",
      };
      const t2: WorkTemplate = {
        id: "t-2",
        name: "タスク2",
        createdAt: "2026-03-01T00:00:00Z",
        updatedAt: "2026-03-01T00:00:00Z",
      };
      mockGetWorkTemplates.mockReturnValue([t1, t2]);

      deleteWorkTemplate("t-1");

      expect(mockSaveWorkTemplates).toHaveBeenCalledWith([t2]);
    });
  });

  describe("getOrCreateWorkTemplate", () => {
    it("既に同名のテンプレートが存在する場合はそれを返す", () => {
      const existing: WorkTemplate = {
        id: "t-existing",
        name: "ミーティング",
        createdAt: "2026-03-01T00:00:00Z",
        updatedAt: "2026-03-01T00:00:00Z",
      };
      mockGetWorkTemplates.mockReturnValue([existing]);

      const result = getOrCreateWorkTemplate("ミーティング");

      expect(result).toBe(existing);
      expect(mockSaveWorkTemplates).not.toHaveBeenCalled();
    });

    it("存在しない場合は新しく作成して返す", () => {
      mockGetWorkTemplates.mockReturnValue([]);

      const result = getOrCreateWorkTemplate("新しい作業");

      expect(result.name).toBe("新しい作業");
      expect(mockSaveWorkTemplates).toHaveBeenCalled();
    });
  });
});
