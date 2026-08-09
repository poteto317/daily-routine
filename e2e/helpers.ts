import type { Page } from "@playwright/test";

/**
 * 各テストを独立させるための前処理。
 *
 * ローカル疑似認証の匿名ログインは固定uid（local-anonymous）を使うため、
 * クリアしないと前のテストで作ったデータが次のテストに残ってしまう。
 *
 * ただしクリアするのは「そのテストで最初にページを開いたときだけ」。
 * addInitScript はリロードを含む全てのナビゲーションで実行されるため、
 * 無条件に localStorage.clear() するとリロードのたびにログアウトしてしまい、
 * 永続化を確認するテストが書けない。
 * sessionStorage は同一タブのリロードをまたいで残り、かつテストごとに
 * 新しいブラウザコンテキストで空になるため、実行済みマーカーとして使う。
 */
export const clearStorageOnFirstNavigation = async (page: Page) => {
  await page.addInitScript(() => {
    const marker = "__e2e_storage_cleared__";
    if (!window.sessionStorage.getItem(marker)) {
      window.localStorage.clear();
      window.sessionStorage.setItem(marker, "1");
    }
  });
};

/** 匿名ログインしてホーム画面（ルーティン一覧）まで進む */
export const loginAnonymously = async (page: Page) => {
  await page.goto("/");
  await page.getByRole("button", { name: "匿名でログイン" }).click();
  // ホームのツールバーが出るまで待ち、後続操作の起点を揃える
  await page
    .getByRole("button", { name: "ルーティンを追加", exact: true })
    .waitFor();
};

/**
 * ハンバーガーメニューを開いて指定項目へ遷移する。
 *
 * トグルボタンの名前は exact 指定が必須。Todoアイテムの「アクションメニュー」も
 * 「メニュー」を含むため、部分一致だと候補が複数になり strict mode violation になる。
 */
export const navigateViaMenu = async (page: Page, itemName: string) => {
  await page.getByRole("button", { name: "メニュー", exact: true }).click();
  await page.getByRole("menuitem", { name: itemName }).click();
};
