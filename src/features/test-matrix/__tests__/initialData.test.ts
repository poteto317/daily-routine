import { buildInitialData } from "../initialData";

describe("buildInitialData", () => {
  it("テストマトリクスの初期データを返す", () => {
    const data = buildInitialData();

    expect(data.length).toBeGreaterThan(10);
    expect(data[0]).toEqual(
      expect.objectContaining({
        id: "auth",
        title: expect.stringContaining("認証"),
        items: expect.any(Array),
      }),
    );
    expect(data.every((category) => category.items.length > 0)).toBe(true);
    expect(
      data
        .flatMap((category) => category.items)
        .every((item) => {
          return (
            typeof item.id === "string" &&
            typeof item.label === "string" &&
            item.pc === "unchecked" &&
            item.sp === "unchecked" &&
            item.note === ""
          );
        }),
    ).toBe(true);
  });
});
