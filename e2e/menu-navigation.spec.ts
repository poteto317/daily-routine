import { expect, test } from "@playwright/test";
import {
  clearStorageOnFirstNavigation,
  loginAnonymously,
  navigateViaMenu,
} from "./helpers";

test.describe("ハンバーガーメニューからの遷移", () => {
  test.beforeEach(async ({ page }) => {
    await clearStorageOnFirstNavigation(page);
  });

  // 常時表示される項目と、遷移先で必ず出る見出しの組み合わせ
  const destinations = [
    { menuItem: "不具合を報告", heading: "不具合を報告" },
    { menuItem: "プリセット管理", heading: "プリセット管理" },
    { menuItem: "同期履歴管理", heading: "☁️ 同期履歴管理" },
  ];

  for (const { menuItem, heading } of destinations) {
    test(`「${menuItem}」に遷移できる`, async ({ page }) => {
      await loginAnonymously(page);
      await navigateViaMenu(page, menuItem);

      await expect(page.getByRole("heading", { name: heading })).toBeVisible();
    });
  }

  test("ルーティンに戻れる", async ({ page }) => {
    await loginAnonymously(page);
    await navigateViaMenu(page, "設定");
    await navigateViaMenu(page, "ルーティン");

    await expect(
      page.getByRole("button", { name: "ルーティンを追加", exact: true }),
    ).toBeVisible();
  });
});
