import * as coreStorage from "@/lib/storage/core";

export const mockGetStorageItem =
  coreStorage.getStorageItem as jest.MockedFunction<
    typeof coreStorage.getStorageItem
  >;
export const mockSetStorageItem =
  coreStorage.setStorageItem as jest.MockedFunction<
    typeof coreStorage.setStorageItem
  >;
export const mockGenerateId = coreStorage.generateId as jest.MockedFunction<
  typeof coreStorage.generateId
>;
export const mockGetTodayString =
  coreStorage.getTodayString as jest.MockedFunction<
    typeof coreStorage.getTodayString
  >;
export const mockCalculateSessionStats =
  coreStorage.calculateSessionStats as jest.MockedFunction<
    typeof coreStorage.calculateSessionStats
  >;

export const setupDefaultStorageMocks = () => {
  jest.clearAllMocks();
  mockGetTodayString.mockReturnValue("2026-02-12");
  mockGetStorageItem.mockImplementation((key: string) => {
    if (key === "work-templates") return [] as never;
    if (key === "work-sessions") return {} as never;
    return undefined as never;
  });
};
