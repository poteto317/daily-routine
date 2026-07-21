import { hasAnyLocalSyncData } from "../sync/localDataHelpers";
import {
  budgetCategoryFixture,
  createSyncPayloadFixture,
  routineFixture,
  todoCategoryFixture,
} from "./sync.test.fixtures";

const emptyData = createSyncPayloadFixture();

describe("hasAnyLocalSyncData", () => {
  it("全て空の場合はfalseを返す", () => {
    expect(hasAnyLocalSyncData(emptyData)).toBe(false);
  });

  it("budgetCategoriesが1件でもあればtrueを返す", () => {
    expect(
      hasAnyLocalSyncData({
        ...emptyData,
        budgetCategories: [budgetCategoryFixture],
      }),
    ).toBe(true);
  });

  it("routinesが1件でもあればtrueを返す", () => {
    expect(
      hasAnyLocalSyncData({
        ...emptyData,
        routines: [routineFixture],
      }),
    ).toBe(true);
  });

  it("todoCategoriesが1件でもあればtrueを返す", () => {
    expect(
      hasAnyLocalSyncData({
        ...emptyData,
        todoCategories: [todoCategoryFixture],
      }),
    ).toBe(true);
  });
});
