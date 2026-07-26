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

  it("Todoカテゴリ管理ページはコンポーネントを解決できる", () => {
    expect(resolvePageComponent("todo-category-management")).toBeDefined();
  });

  it("家計簿の収入・固定費・変動費設定ページはコンポーネントを解決できる", () => {
    expect(resolvePageComponent("budget-allowance-settings")).toBeDefined();
  });

  it("家計簿の月次サマリーページはコンポーネントを解決できる", () => {
    expect(resolvePageComponent("budget-summary")).toBeDefined();
  });
});
