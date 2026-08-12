import { expect, test, type Page } from "@playwright/test";
import {
  clearStorageOnFirstNavigation,
  loginAnonymously,
  navigateViaMenu,
} from "./helpers";

/** Todoリストを1件作る */
const createTodoList = async (page: Page, title: string) => {
  await navigateViaMenu(page, "Todoリスト管理");
  await page.getByRole("button", { name: "＋ 新しいリストを追加" }).click();
  await page.getByPlaceholder("リストのタイトル").fill(title);
  await page.getByRole("button", { name: "作成" }).click();
  await expect(page.getByText(title)).toBeVisible();
};

test.describe("データのエクスポートとインポート", () => {
  test.beforeEach(async ({ page }) => {
    await clearStorageOnFirstNavigation(page);
  });

  test("書き出したファイルを読み込むとデータが戻る", async ({ page }) => {
    // 書き出しだけ、読み込みだけを個別に確かめても、両者のキー名がずれていれば
    // どちらも通ってしまう。実ブラウザで往復させて確かめる。
    await loginAnonymously(page);
    await createTodoList(page, "往復確認リスト");

    await navigateViaMenu(page, "設定");
    const download = page.waitForEvent("download");
    await page
      .getByRole("button", { name: /エクスポート/ })
      .first()
      .click();
    const file = await (await download).path();

    // 書き出したあとにデータを消す
    await page.evaluate(() => window.localStorage.clear());
    await page.reload();
    await page.getByRole("button", { name: "匿名でログイン" }).click();
    await navigateViaMenu(page, "Todoリスト管理");
    await expect(page.getByText("往復確認リスト")).toBeHidden();

    // 読み込む
    await navigateViaMenu(page, "設定");
    page.once("dialog", (dialog) => dialog.accept());
    await page.setInputFiles('input[type="file"]', file);

    // インポートに成功すると 1 秒後にページがリロードされる。
    // 固定時間で待つと、遅延を変えたときに壊れるか無駄に待つかのどちらかになる。
    // 「インポート完了」の表示はメモリ上の状態なのでリロードで消える。
    // それが消えたことをもってリロード完了とみなす。
    const importDone = page.getByRole("button", { name: /インポート完了/ });
    await expect(importDone).toBeVisible();
    await expect(importDone).toBeHidden();

    await navigateViaMenu(page, "Todoリスト管理");
    await expect(page.getByText("往復確認リスト")).toBeVisible();
  });
});
