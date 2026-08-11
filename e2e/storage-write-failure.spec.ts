import { expect, test, type Page } from "@playwright/test";
import {
  clearStorageOnFirstNavigation,
  loginAnonymously,
  navigateViaMenu,
} from "./helpers";

/**
 * 指定キーへの書き込みだけを失敗させる。
 *
 * 全てのキーを失敗させるとログイン自体が通らなくなるため、対象を絞る。
 */
const failWritesFor = async (page: Page, keyFragment: string) => {
  await page.addInitScript((fragment: string) => {
    const original = Storage.prototype.setItem;
    Storage.prototype.setItem = function (key: string, value: string) {
      if (key.includes(fragment)) {
        throw new DOMException("full", "QuotaExceededError");
      }
      return original.call(this, key, value);
    };
  }, keyFragment);
};

/**
 * 保存失敗バナー。
 *
 * role=alert だけでは Next.js が挿入する __next-route-announcer__ にも
 * 一致してしまうため、本文で絞り込む。
 */
const failureBanner = (page: Page) =>
  page.getByRole("alert").filter({ hasText: "保存できる容量の上限" });

test.describe("保存失敗の通知", () => {
  test.beforeEach(async ({ page }) => {
    await clearStorageOnFirstNavigation(page);
  });

  test("保存に失敗すると警告バナーが見える状態で表示される", async ({
    page,
  }) => {
    // ヘッダーが sticky top-0 z-50 で画面上部を占めているため、
    // バナーを上部に置くと DOM 順の関係で完全に隠れてしまう。
    // 「要素が存在すること」では気づけないので、実際に最前面にあるかを確かめる。
    await failWritesFor(page, "todo-lists");
    await loginAnonymously(page);
    await navigateViaMenu(page, "Todoリスト管理");

    await page.getByRole("button", { name: "＋ 新しいリストを追加" }).click();
    await page.getByPlaceholder("リストのタイトル").fill("保存失敗の確認");
    await page.getByRole("button", { name: "作成" }).click();

    const banner = failureBanner(page);
    await expect(banner).toBeVisible();

    // バナーの中心にあるのがバナー自身か（他の要素に覆われていないか）
    const covered = await banner.evaluate((el) => {
      const rect = el.getBoundingClientRect();
      const topmost = document.elementFromPoint(
        rect.x + rect.width / 2,
        rect.y + rect.height / 2,
      );
      return !el.contains(topmost);
    });
    expect(covered).toBe(false);
  });

  test("バナーが出ていても画面下部のボタンを押せる", async ({ page }) => {
    // バナーを画面下部に固定した結果、今度は下部の操作を覆う危険がある。
    // ルーティンフォームのフッターは sticky bottom-0 で下端に貼り付くため、
    // 保存できない状態でもフォームを閉じられることを確かめる。
    await loginAnonymously(page);
    await page
      .getByRole("button", { name: "ルーティンを追加", exact: true })
      .click();

    await page.evaluate(() => {
      window.dispatchEvent(
        new CustomEvent("storage-write-failed", {
          detail: { key: "routines", reason: "quota-exceeded" },
        }),
      );
    });
    await expect(failureBanner(page)).toBeVisible();
    await page.mouse.wheel(0, 3000);

    await page.getByRole("button", { name: "キャンセル" }).click();

    await expect(page.getByRole("button", { name: "キャンセル" })).toBeHidden();
  });

  test("バナーが出ていてもメニューを開ける", async ({ page }) => {
    // バナーがヘッダーを覆うと、警告が出ている間ユーザーが画面を移動できなくなる
    await failWritesFor(page, "todo-lists");
    await loginAnonymously(page);
    await navigateViaMenu(page, "Todoリスト管理");

    await page.getByRole("button", { name: "＋ 新しいリストを追加" }).click();
    await page.getByPlaceholder("リストのタイトル").fill("保存失敗の確認");
    await page.getByRole("button", { name: "作成" }).click();
    await expect(failureBanner(page)).toBeVisible();

    await page.getByRole("button", { name: "メニュー", exact: true }).click();

    await expect(page.getByRole("menuitem", { name: "設定" })).toBeVisible();
  });
});
