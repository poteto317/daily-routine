import { expect, test } from "@playwright/test";
import {
  clearStorageOnFirstNavigation,
  loginAnonymously,
  navigateViaMenu,
} from "./helpers";

test.describe("Todoリスト", () => {
  test.beforeEach(async ({ page }) => {
    await clearStorageOnFirstNavigation(page);
  });

  test("リストを作成してTodoを追加し、完了にできる", async ({ page }) => {
    await loginAnonymously(page);

    // リストを作成する
    await navigateViaMenu(page, "Todoリスト管理");
    await page.getByRole("button", { name: "＋ 新しいリストを追加" }).click();
    await page.getByPlaceholder("リストのタイトル").fill("E2E買い物リスト");
    await page.getByRole("button", { name: "作成" }).click();

    // 作成したリストはハンバーガーメニューの項目として現れる
    await navigateViaMenu(page, "E2E買い物リスト");

    // Todoを追加する
    await page.getByPlaceholder("Todoを追加...").fill("牛乳を買う");
    await page.getByRole("button", { name: "追加", exact: true }).click();

    await expect(page.getByText("牛乳を買う")).toBeVisible();
    await expect(page.getByText("0/1 完了")).toBeVisible();

    // 完了にすると進捗表示が更新される
    await page
      .getByRole("button", { name: "「牛乳を買う」を完了にする" })
      .click();

    await expect(page.getByText("1/1 完了")).toBeVisible();
  });
});
