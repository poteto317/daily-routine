import { createMenuOrderStateResult } from "../state/menuOrderStateResult";

describe("createMenuOrderStateResult", () => {
  it("menu order state の公開 shape を返す", () => {
    const setMenuOrder = jest.fn();

    expect(
      createMenuOrderStateResult({
        menuOrder: ["weather", "journal"],
        setMenuOrder,
      }),
    ).toEqual({
      menuOrder: ["weather", "journal"],
      setMenuOrder,
    });
  });
});
