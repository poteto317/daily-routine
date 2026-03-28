import { resolvePageComponent } from "../pageComponentResolver";

describe("pageComponentResolver", () => {
  it("homeは専用コンポーネントを持たない", () => {
    expect(resolvePageComponent("home")).toBeUndefined();
  });

  it("設定ページはコンポーネントを解決できる", () => {
    expect(resolvePageComponent("settings")).toBeDefined();
  });

  it("管理者ページはコンポーネントを解決できる", () => {
    expect(resolvePageComponent("account-admin")).toBeDefined();
  });

  it("同期履歴管理ページはコンポーネントを解決できる", () => {
    expect(resolvePageComponent("sync-management")).toBeDefined();
  });
});
