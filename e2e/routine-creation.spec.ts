import { expect, test } from "@playwright/test";
import {
  clearStorageOnFirstNavigation,
  loginAnonymously,
  navigateViaMenu,
} from "./helpers";

test.describe("ルーティン作成", () => {
  test.beforeEach(async ({ page }) => {
    await clearStorageOnFirstNavigation(page);
  });

  test("匿名ログイン後にルーティンを作成すると一覧に表示される", async ({
    page,
  }) => {
    await loginAnonymously(page);

    await page
      .getByRole("button", { name: "ルーティンを追加", exact: true })
      .click();

    const routineTitle = `E2Eテストルーティン-${Date.now()}`;
    await page.getByPlaceholder("例: 朝のストレッチ").fill(routineTitle);

    // 今日の曜日は初期状態で選択済みのため、未選択の曜日だけ追加で選択する
    // （既に選択済みのボタンを再クリックすると選択解除されてしまうため）
    const dayGroup = page.getByRole("group", { name: "曜日・祝日 *" });
    const dayButtons = dayGroup.getByRole("button");
    const dayButtonCount = await dayButtons.count();
    for (let index = 0; index < dayButtonCount; index += 1) {
      const dayButton = dayButtons.nth(index);
      if ((await dayButton.getAttribute("aria-pressed")) !== "true") {
        await dayButton.click();
      }
    }

    await page.getByRole("button", { name: "追加", exact: true }).click();

    await expect(page.getByText(routineTitle)).toBeVisible();
  });

  test("週間目標を設定するとホームと統計に進捗が表示される", async ({
    page,
  }) => {
    await loginAnonymously(page);

    await page
      .getByRole("button", { name: "ルーティンを追加", exact: true })
      .click();

    const routineTitle = `週間目標E2E-${Date.now()}`;
    await page.getByPlaceholder("例: 朝のストレッチ").fill(routineTitle);
    await page.getByRole("spinbutton", { name: "週間目標" }).fill("3");
    await page.getByRole("button", { name: "追加", exact: true }).click();

    await expect(page.getByText(routineTitle)).toBeVisible();
    await expect(page.getByText("週3回", { exact: true })).toBeVisible();

    // 作成直後は編集モードなので、表示モードへ切り替えてから完了にする
    await page.getByRole("button", { name: "表示モードに切り替え" }).click();
    await page.getByText(routineTitle).click();
    await expect(page.getByText("100% 完了", { exact: true })).toBeVisible();
    await navigateViaMenu(page, "統計・レポート");

    await expect(
      page.getByRole("heading", { name: "週間目標", exact: true }),
    ).toBeVisible();
    await expect(page.getByText(routineTitle)).toBeVisible();
    await expect(page.getByText("1 / 3回", { exact: true })).toBeVisible();
    await expect(
      page.getByRole("progressbar", { name: `${routineTitle}の進捗` }),
    ).toHaveAttribute("aria-valuenow", "1");
  });
});
