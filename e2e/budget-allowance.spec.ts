import { expect, test, type Page } from "@playwright/test";
import {
  clearStorageOnFirstNavigation,
  loginAnonymously,
  navigateViaMenu,
} from "./helpers";

/** 収入・固定費・変動費の設定画面まで遷移する */
const openAllowanceSettings = async (page: Page) => {
  await navigateViaMenu(page, "家計簿");
  await page.getByRole("button", { name: "📊 月次サマリー" }).click();
  await page
    .getByRole("button", { name: "収入・固定費・変動費を編集" })
    .click();
};

/** 収入セクションの「新しい項目を追加」フォームを開く */
const openIncomeItemForm = async (page: Page) => {
  await page
    .getByRole("button", { name: "＋ 新しい項目を追加" })
    .first()
    .click();
};

test.describe("収入・固定費・変動費の項目作成", () => {
  test.beforeEach(async ({ page }) => {
    await clearStorageOnFirstNavigation(page);
  });

  // 「作成後に入力欄から blur してソフトウェアキーボードを閉じる」挙動は、
  // ここでは検証できない。作成に成功するとフォームがアンマウントされ、
  // その際ブラウザは明示的な blur() と区別のつかない blur イベントを発火し、
  // フォーカスも同じく body に移るため、blur を消しても全ての観測結果が
  // 一致してしまう（実際に blur を削除して確認済み）。
  // blur の有無と対象欄はユニットテストが、実機でのキーボード開閉は
  // docs/03-testing/test-matrix.md の手動確認項目が担う。
  test("項目名・金額どちらの欄のEnterでも項目を作成できる", async ({
    page,
  }) => {
    // 入力欄が2つあるフォーム。どちらの欄から確定しても作成できることを押さえる。
    await loginAnonymously(page);
    await openAllowanceSettings(page);

    // --- 項目名の欄からEnter ---
    await openIncomeItemForm(page);
    const nameInput = page.getByPlaceholder("項目名（例: 家賃）");
    const amountInput = page.getByPlaceholder("例: 80000");
    // フォームを開くと 50ms 後に項目名欄へ自動フォーカスする既存の仕組みがある。
    // 先に別の欄を触るとフォーカスを奪い返されて不安定になるため、
    // 自動フォーカスが済むのを待ってから操作する。
    await expect(nameInput).toBeFocused();
    await nameInput.fill("給与収入");
    await amountInput.fill("300000");
    await nameInput.click();
    await expect(nameInput).toBeFocused();

    await nameInput.press("Enter");

    await expect(page.getByText("給与収入")).toBeVisible();
    // 作成に成功するとフォームが閉じ、入力欄自体が画面から消える
    await expect(nameInput).toBeHidden();

    // --- 金額の欄からEnter ---
    await openIncomeItemForm(page);
    const nameInput2 = page.getByPlaceholder("項目名（例: 家賃）");
    const amountInput2 = page.getByPlaceholder("例: 80000");
    await expect(nameInput2).toBeFocused();
    await nameInput2.fill("副業収入");
    await amountInput2.click();
    await amountInput2.fill("50000");
    await expect(amountInput2).toBeFocused();

    await amountInput2.press("Enter");

    await expect(page.getByText("副業収入")).toBeVisible();
    await expect(amountInput2).toBeHidden();
  });

  test("空欄でEnterを押しても項目は作成されない", async ({ page }) => {
    // このフォームには「開いている間は入力欄へ自動フォーカスする」既存の
    // 仕組み（setTimeout 50ms）があり、blurしても再フォーカスされる。
    // そのためフォーカスの有無ではガードの働きを検証できないので、
    // 「作成されないこと」を確認する（フォーカス側の検証はユニットテストが担う）。
    await loginAnonymously(page);
    await openAllowanceSettings(page);

    await openIncomeItemForm(page);
    const nameInput = page.getByPlaceholder("項目名（例: 家賃）");
    await nameInput.click();
    await nameInput.press("Enter");

    // フォームが開いたままで、項目は増えていない
    await expect(nameInput).toBeVisible();
    await expect(page.getByRole("button", { name: "作成" })).toBeDisabled();
    await expect(page.getByText("項目はまだありません").first()).toBeVisible();
  });
});
