import { expect, test, type Page } from "@playwright/test";
import {
  clearStorageOnFirstNavigation,
  loginAnonymously,
  navigateViaMenu,
} from "./helpers";

/** ホーム画面からルーティンを1件作る。曜日は初期選択（今日）のまま使う */
const createRoutine = async (page: Page, title: string, startTime: string) => {
  await page
    .getByRole("button", { name: "ルーティンを追加", exact: true })
    .click();
  await page.getByPlaceholder("例: 朝のストレッチ").fill(title);
  // 開始時間の input は label と紐付いていないため type で特定する
  await page.locator('input[type="time"]').fill(startTime);
  await page.getByRole("button", { name: "追加", exact: true }).click();
  await expect(page.getByText(title)).toBeVisible();
};

test.describe("プリセット編集", () => {
  test.beforeEach(async ({ page }) => {
    await clearStorageOnFirstNavigation(page);
  });

  test("編集画面のルーティンは作成順ではなく開始時刻の昇順で並ぶ", async ({
    page,
  }) => {
    await loginAnonymously(page);

    // 時刻がバラバラになる順で作る。作成順のまま並ぶなら 夜食→朝食→昼食 になる
    await createRoutine(page, "E2E夜食", "22:00");
    await createRoutine(page, "E2E朝食", "06:00");
    await createRoutine(page, "E2E昼食", "12:00");

    await navigateViaMenu(page, "プリセット管理");

    // プリセットを作る（作成画面のチェックは全件入れる）
    await page.getByRole("button", { name: "➕" }).click();
    await page
      .getByPlaceholder("例: 平日モーニングルーティン")
      .fill("E2Eプリセット");
    const createCheckboxes = page.getByRole("checkbox");
    const createCount = await createCheckboxes.count();
    for (let index = 0; index < createCount; index += 1) {
      await createCheckboxes.nth(index).check();
    }
    await page.getByRole("button", { name: "プリセットを作成" }).click();

    // 作ったプリセットの編集を開く
    await page.getByRole("button", { name: "プリセットを編集" }).click();

    // 編集画面の各行に出る開始時刻を上から読む
    const times = page.locator("label").getByText(/^\d{2}:\d{2}$/);
    await expect(times).toHaveText(["06:00", "12:00", "22:00"]);
  });
});
