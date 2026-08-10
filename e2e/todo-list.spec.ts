import { expect, test, type Page } from "@playwright/test";
import {
  clearStorageOnFirstNavigation,
  loginAnonymously,
  navigateViaMenu,
} from "./helpers";

/** Todoリストを新規作成し、そのリストの詳細画面まで遷移する */
const createListAndOpen = async (page: Page, title: string) => {
  await navigateViaMenu(page, "Todoリスト管理");
  await page.getByRole("button", { name: "＋ 新しいリストを追加" }).click();
  await page.getByPlaceholder("リストのタイトル").fill(title);
  await page.getByRole("button", { name: "作成" }).click();
  // 作成したリストはハンバーガーメニューの項目として現れる
  await navigateViaMenu(page, title);
};

test.describe("Todoリスト", () => {
  test.beforeEach(async ({ page }) => {
    await clearStorageOnFirstNavigation(page);
  });

  test("リストを作成してTodoを追加し、完了にできる", async ({ page }) => {
    await loginAnonymously(page);

    await createListAndOpen(page, "E2E買い物リスト");

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

  test("Todo追加後は入力欄からフォーカスが外れる（ソフトウェアキーボードを閉じるため）", async ({
    page,
  }) => {
    // jsdomでは実ブラウザのフォーカス挙動を完全には再現できないため、
    // 実際に想定どおりキーボードが閉じる状態になるかをここで担保する。
    await loginAnonymously(page);
    await createListAndOpen(page, "フォーカス検証リスト");

    const addInput = page.getByPlaceholder("Todoを追加...");
    const addButton = page.getByRole("button", { name: "追加", exact: true });

    // 追加ボタンのクリックで追加した場合
    await addInput.click();
    await addInput.fill("ボタンで追加");
    await expect(addInput).toBeFocused();

    await addButton.click();

    await expect(page.getByText("ボタンで追加")).toBeVisible();
    // テキスト入力から離れることでソフトウェアキーボードが閉じる
    await expect(addInput).not.toBeFocused();

    // Enterキーで追加した場合も同じ
    await addInput.click();
    await addInput.fill("Enterで追加");
    await addInput.press("Enter");

    await expect(page.getByText("Enterで追加")).toBeVisible();
    await expect(addInput).not.toBeFocused();
  });

  test("空欄でEnterを押しても追加されず、入力欄のフォーカスは維持される", async ({
    page,
  }) => {
    await loginAnonymously(page);
    await createListAndOpen(page, "空欄検証リスト");

    const addInput = page.getByPlaceholder("Todoを追加...");
    await addInput.click();
    await addInput.press("Enter");

    // 空アイテムが追加されていないこと（空リストの案内が出たまま）
    await expect(page.getByText("まだTodoがありません")).toBeVisible();

    // 何も追加されていないのにキーボードが閉じると再入力しづらいため、
    // 入力欄にフォーカスが残ったままであること
    await expect(addInput).toBeFocused();
  });

  // 「作成後に入力欄から blur してソフトウェアキーボードを閉じる」挙動は、
  // ここでは検証できない。作成に成功するとフォームがアンマウントされ、
  // その際ブラウザは明示的な blur() と区別のつかない blur イベントを発火し、
  // フォーカスも同じく body に移るため、blur を消しても全ての観測結果が
  // 一致してしまう（実際に blur を削除して確認済み）。
  // blur の有無と呼び出し順序はユニットテストが、実機でのキーボード開閉は
  // docs/03-testing/test-matrix.md の手動確認項目が担う。
  test("Enterキーでリストを作成できる", async ({ page }) => {
    // 作成ボタン経由は createListAndOpen が通っているため、Enterキー経路を押さえる
    await loginAnonymously(page);
    await navigateViaMenu(page, "Todoリスト管理");

    await page.getByRole("button", { name: "＋ 新しいリストを追加" }).click();
    const titleInput = page.getByPlaceholder("リストのタイトル");
    await titleInput.click();
    await titleInput.fill("Enter作成リスト");

    await titleInput.press("Enter");

    // 作成に成功するとフォームが閉じ、入力欄自体が画面から消える
    await expect(titleInput).toBeHidden();
    await expect(page.getByText("Enter作成リスト")).toBeVisible();
  });
});
