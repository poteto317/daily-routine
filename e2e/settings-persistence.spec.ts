import { expect, test } from "@playwright/test";
import {
  clearStorageOnFirstNavigation,
  loginAnonymously,
  navigateViaMenu,
} from "./helpers";

test.describe("設定の永続化", () => {
  test.beforeEach(async ({ page }) => {
    await clearStorageOnFirstNavigation(page);
  });

  test("ポモドーロの集中時間を変更するとリロード後も保持される", async ({
    page,
  }) => {
    await loginAnonymously(page);
    await navigateViaMenu(page, "設定");

    // locator は遅延評価されるため、リロードを挟んでも同じものを使い回せる
    const focusInput = page
      .locator("div")
      .filter({ hasText: /^集中時間（分）/ })
      .locator('input[type="number"]')
      .first();

    await expect(focusInput).toHaveValue("25");

    // 保存ボタンなしで即時保存される仕様
    await focusInput.fill("40");
    await focusInput.blur();

    // リロードしても保存済みの値が復元される
    // （表示中のページも永続化されるため、リロード後も設定画面のまま）
    await page.reload();

    await expect(focusInput).toHaveValue("40");
  });
});
