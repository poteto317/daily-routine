# 設定「バックグラウンド復帰リフレッシュ間隔」の表示名と説明文を動作に合わせる 設計書

作成日: 2026年11月13日

対象: [Issue #223](https://github.com/poteto317/daily-routine/issues/223)「bug: 設定「バックグラウンド復帰リフレッシュ間隔」の説明文が実際の動作と合っていない」

## 背景と目的

設定画面の「デフォルト値」の節に、数値の入力欄「バックグラウンド復帰リフレッシュ間隔（分）」がある。説明文は次のとおりで、「バックグラウンドから戻してから、再評価されるまでに最大でこの時間だけ待つ」と読める。

> アプリをバックグラウンドから戻した際に、ルーティンの背景色（経過色）を再評価するまでの最大待機時間です。0を設定すると定期的な再評価は行われません。

実際の動作は違う。設定値は、アプリを表示したままのときに動くタイマーの間隔で、バックグラウンドからの復帰とは関係しない。説明文を読んだ人は「0 にすると、戻したときにも色が変わらない」「30 分にすると、戻してから最大 30 分は色が変わらない」と誤解する。

目的は、表示名・説明文と、その設定を説明しているコメント・ドキュメントを、実際の動作に合わせることである。動作は変えない。

## 実際の動作

コードで確かめた動作は次のとおり。

- **復帰時**: `useRoutineForegroundSync`（`src/features/routine/hooks/useRoutineForegroundSync.ts`）は、`visibilitychange`（表示に戻ったとき）・`pageshow`・`focus` のどれかが来ると、`setTimeout(0)` で 1 回に束ねたうえで、設定値に関係なくすぐに再評価する（現在時刻の通知 `notifyCurrentMinute()` と、ルーティンの状態の読み直し `refreshRoutineState`）。
- **表示したままのとき**: `useRoutineFallbackTimer`（`src/features/routine/hooks/useRoutineFallbackTimer.ts`）が、設定値（分をミリ秒に直した値）の間隔で `setInterval` を動かす。タイマーは画面が表示されている間だけ動き、非表示になると止まる。タイマーの回では、現在時刻の通知は必ず行う（カードの経過色が今の時刻に合う）。ルーティンの状態の読み直しは、その間隔のうちに更新や読み直しがあった場合は省く。
- **0 のとき**: タイマーを始めない。復帰時の再評価は、0 でも変わらず動く。

`src/features/routine/components/__tests__/routineItemPastColor.wiring.test.tsx` の通しのテストが、復帰の 3 つのイベントと、30 分のタイマーの回のどちらでもカードが超過の色になることを固定している。

## 決めたこと

1. **表示名を変える**（ユーザーの判断。2026年11月13日）。「バックグラウンド復帰リフレッシュ間隔（分）」を「表示中の定期リフレッシュ間隔（分）」にする。
2. **説明文を変える**。Issue の対応案をもとに、次の文にする。

   > アプリを表示したままのときに、ルーティンの背景色（経過色）を再評価する間隔です。バックグラウンドから戻したときは、この値に関係なくすぐに再評価します。0を設定すると定期的な再評価は行われません。

3. **保存するキーと識別子は変えない**。`backgroundRefreshIntervalMinutes`（保存データ・同期データのキー）、`backgroundRefreshIntervalInput`、`BACKGROUND_REFRESH_FIELD`、`backgroundRefreshIntervalMs` などの名前はそのまま残す。キーを変えると、保存済みのデータと同期データの移行が要るため（L-357）。名前と意味のずれは、型のコメントで補う。
4. **エラー文とヒントは変えない**。「0～60分の範囲で入力してください（0で定期更新なし）」「推奨: 30分」は、いまの動作と合っている。
5. **文言の置き場所は変えない**。この入力欄の文言は、同じ節のほかの入力欄（`DEFAULT_DURATION_FIELD` など）と同じく `src/features/settings/helpers/defaultAndPomodoro.ts` の定数に置かれている。`locales/ja.json` への移動は、この節の入力欄をまとめて扱う別の作業になるため、今回は行わない。
6. **過去の記録は書き換えない**。`docs/superpowers/` の過去の設計書・プランに古い表示名が出ていても、その時点の記録なので直さない（L-359）。

## 変更する箇所

| ファイル                                                                | 変更                                                                                                                                 |
| ----------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `src/features/settings/helpers/defaultAndPomodoro.ts`                   | `BACKGROUND_REFRESH_FIELD` の `label` と `description` を「決めたこと」1・2 の文にする。`min`・`max`・`errorText`・`hint` は変えない |
| `src/types/routine/settings.ts`                                         | `backgroundRefreshIntervalMinutes` のコメントを、実際の意味に合わせる（下の「型のコメント」）                                        |
| `docs/03-testing/test-matrix.md`                                        | 13-21 の項目名と備考を、新しい表示名と動作に合わせる（下の「テストマトリクス」）。表の列幅は Prettier の整形に合わせる               |
| `src/features/settings/__tests__/settingsViewHelpers.test.ts`           | `BACKGROUND_REFRESH_FIELD` の表示名・説明文・範囲・エラー文・ヒントを、リテラルの期待値で固定するテストを足す                        |
| `src/features/settings/__tests__/SettingsPage.features.test.tsx`        | 入力欄を探す文字列を新しい表示名にする                                                                                               |
| `src/features/settings/__tests__/SettingsPage.render-and-save.test.tsx` | 同上                                                                                                                                 |

`src/features/settings/components/DefaultAndPomodoroSection.tsx` は `{...BACKGROUND_REFRESH_FIELD}` を渡しているだけなので、変更しない。`src/features/routine/hooks/useRoutineForegroundSync.ts` の JSDoc（「フォールバックタイマーの間隔（ミリ秒）。0 の場合は無効。」）は、いまの動作と合っているので変更しない。

古い表示名・説明文は、上の表のほかには、アプリのコード・テスト・ドキュメント（`docs/superpowers/` を除く）・README に出てこない（`grep` で確認済み）。

### 型のコメント

`src/types/routine/settings.ts` の `backgroundRefreshIntervalMinutes` のコメントを、次の文にする。

```ts
  /**
   * アプリを表示したままのときに、ルーティンの状態と経過色を再評価する間隔（分）。0 で定期の再評価なし。
   * バックグラウンドから戻したときは、この値に関係なくすぐに再評価する
   * （キーの名前は以前の表示名「バックグラウンド復帰リフレッシュ間隔」のまま残している）
   */
  backgroundRefreshIntervalMinutes?: number;
```

### テストマトリクス

`docs/03-testing/test-matrix.md` の 13-21 を、次の内容にする。

- 項目名: 「表示中の定期リフレッシュ間隔（0〜60分）設定」
- 備考: 「0で定期の再評価なし。デフォルト30分。表示中のフォールバックタイマーの間隔（復帰時は値に関係なくすぐ再評価）」

項目の番号・確認の状態（✅ ⬜ ⬜）・項目数は変えない。

## テスト

- **文言の固定**（L-294）: `settingsViewHelpers.test.ts` に、`BACKGROUND_REFRESH_FIELD` の全項目をリテラルの期待値と比べるテストを足す。定数を参照して比べると、定数を変えてもテストが通ってしまうので、期待値は文字列をそのまま書く。
- **古い文言が残っていないこと**（L-663）: 同じテストで、説明文に「最大待機時間」が含まれないこと、表示名に「バックグラウンド復帰」が含まれないことを、`not.toContain` で確かめる。
- **画面のテスト**: `SettingsPage.features.test.tsx` と `SettingsPage.render-and-save.test.tsx` は、新しい表示名で入力欄を探し、値が 30 であることを確かめる（既存の確認を、文字列だけ変えて残す）。
- **TDD の順序**: 先に 3 つのテストを新しい文言に直し（または足し）、失敗することを確かめてから、定数を直す。
- **検証**: `npm test`、`npm run lint`、`npm run typecheck`、`npm run format:check`、`npm run build` を通す。

## 範囲外

- 動作の変更（タイマーの間隔、復帰時の再評価、0 のときの扱い）。
- 保存するキー・識別子の名前の変更と、それにともなうデータの移行。
- この節の文言を `locales/ja.json` へ移すこと、`locales/ja.json` の `defaultAndPomodoro` と定数の重複の整理。
- `docs/superpowers/` の過去の設計書・プランの書き換え。

## 確認した知見

`<dev-flow-kit>/lessons/review-lessons.md` の次の項目を確認し、設計に反映した。

- L-206（動作と画面の文言のずれ）: 今回の不具合そのもの。説明文は、コードで確かめた動作をもとに書く。
- L-294（文言のテストはリテラルの期待値で書く）: 「テスト」の「文言の固定」。
- L-357（互換のために識別子を残すときは、コメント・テスト名・ドキュメントを実際の意味に合わせる）: 「決めたこと」3 と「型のコメント」。
- L-359（文言を変えるときは、実装・テスト・ドキュメントを検索する。過去の記録は書き換えない）: 「変更する箇所」と「決めたこと」6。
- L-663（無いことの確認は、完全一致ではなく部分一致で書く）: 「テスト」の「古い文言が残っていないこと」。
- L-719（ドキュメントや PR の本文に画面の文言を書くときは、実物と照らす）: テストマトリクスと PR の本文に書く表示名は、定数の文字列と同じにする。
