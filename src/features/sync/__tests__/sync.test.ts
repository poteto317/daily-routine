import { getSyncStatus } from "../sync";

describe("sync compatibility", () => {
  it("sync module public API remains importable", () => {
    expect(typeof getSyncStatus).toBe("function");
  });
});
