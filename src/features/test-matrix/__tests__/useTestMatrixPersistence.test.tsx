import { renderHook } from "@testing-library/react";

jest.mock("../storage", () => ({
  saveTestMatrixCategories: jest.fn(),
  saveTestMatrixDetailData: jest.fn(),
}));

import { saveTestMatrixCategories, saveTestMatrixDetailData } from "../storage";
import { useTestMatrixPersistence } from "../useTestMatrixPersistence";

describe("useTestMatrixPersistence", () => {
  it("categories と detailData を永続化する", () => {
    const categories = [{ id: "auth", title: "認証", items: [] }];
    const detailData = { "1-1": [] };

    renderHook(() => useTestMatrixPersistence({ categories, detailData }));

    expect(saveTestMatrixCategories).toHaveBeenCalledWith(categories);
    expect(saveTestMatrixDetailData).toHaveBeenCalledWith(detailData);
  });
});
