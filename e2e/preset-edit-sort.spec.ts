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

/**
 * プリセット作成・編集の「元にする曜日」は radio（sr-only）。
 * ルーティンがある曜日だけ有効なので、その label をクリックして選ぶ。
 * input 自体は不可視のため check() だと actionability 待ちでタイムアウトする。
 */
const selectEnabledSourceDay = async (page: Page) => {
  const group = page.getByRole("group", { name: "元にする曜日・祝日を選択" });
  const enabledLabel = group.locator("label").filter({
    has: page.locator('input[type="radio"]:not([disabled])'),
  });
  await expect(enabledLabel).toHaveCount(1);
  await enabledLabel.click();
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

    // プリセットを作る（元曜日を選び、その曜日の全ルーティンが入る）
    await page.getByRole("button", { name: "➕" }).click();
    await page
      .getByPlaceholder("例: 平日モーニングルーティン")
      .fill("E2Eプリセット");
    await selectEnabledSourceDay(page);
    const createButton = page.getByRole("button", { name: "プリセットを作成" });
    await expect(createButton).toBeEnabled();
    await createButton.click();

    // 作ったプリセットの編集を開き、同じ曜日を選んでプレビューの並びを見る
    await page.getByRole("button", { name: "プリセットを編集" }).click();
    await selectEnabledSourceDay(page);

    // プレビュー行の開始時刻（span）が時刻昇順であること
    const times = page.getByText(/^\d{2}:\d{2}$/);
    await expect(times).toHaveText(["06:00", "12:00", "22:00"]);
  });
});
