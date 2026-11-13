# 設定「バックグラウンド復帰リフレッシュ間隔」の表示名と説明文 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 設定画面の「バックグラウンド復帰リフレッシュ間隔（分）」の表示名と説明文、その設定を説明している型のコメントとテストマトリクスを、実際の動作（表示したままのときの再評価の間隔。復帰時は値に関係なくすぐ再評価）に合わせる。

**Architecture:** 文言は `src/features/settings/helpers/defaultAndPomodoro.ts` の定数 `BACKGROUND_REFRESH_FIELD` にあり、`DefaultAndPomodoroSection.tsx` がそのまま入力欄へ渡している。定数の `label` と `description` だけを直し、動作・保存するキー・識別子は変えない。文言はリテラルの期待値のテストで固定する。

**Tech Stack:** Next.js 16 / React 19 / TypeScript、Jest（ts-jest、jsdom）+ Testing Library、ESLint、Prettier。

設計書: `docs/superpowers/specs/2026-11-13-settings-background-refresh-wording-design.md`（Issue #223）

## Global Constraints

- 新しい表示名（1 文字も変えない）: `表示中の定期リフレッシュ間隔（分）`
- 新しい説明文（1 文字も変えない）: `アプリを表示したままのときに、ルーティンの背景色（経過色）を再評価する間隔です。バックグラウンドから戻したときは、この値に関係なくすぐに再評価します。0を設定すると定期的な再評価は行われません。`
- 変えないもの: `BACKGROUND_REFRESH_FIELD` の `min`（`0`）・`max`（`60`）・`errorText`（`0～60分の範囲で入力してください（0で定期更新なし）`）・`hint`（`推奨: 30分`）。`errorText` の `～` は全角の波ダッシュ（U+FF5E）で、既存の文字をそのまま使う。
- 識別子と保存するキーは変えない: `backgroundRefreshIntervalMinutes`、`backgroundRefreshIntervalInput`、`BACKGROUND_REFRESH_FIELD`、`backgroundRefreshIntervalMs`。
- 動作のコード（`src/features/routine/hooks/` 以下）と `src/features/settings/components/DefaultAndPomodoroSection.tsx` は変更しない。
- `docs/superpowers/` の過去の設計書・プランは書き換えない（この設計書とこのプランを除く）。
- コメントは日本語で書く（`docs/02-development/coding-standards.md`）。
- **コミットしない。** `git add`・`git commit`・`git stash`・ブランチの切り替えをしない（コミットは、この後の開発フローのステップで行う）。
- 確認した知見（`<dev-flow-kit>/lessons/review-lessons.md`）: L-206、L-294（文言のテストはリテラルの期待値）、L-357（識別子を残すときはコメントを実際の意味に合わせる）、L-359（過去の記録は書き換えない）、L-663（無いことの確認は部分一致）、L-719（ドキュメントの表示名は実物と同じにする）。

---

### Task 1: 表示名・説明文を直し、テストとドキュメントを合わせる

**Files:**

- Modify: `src/features/settings/helpers/defaultAndPomodoro.ts:30-38`
- Modify: `src/types/routine/settings.ts:31`
- Modify: `docs/03-testing/test-matrix.md:255`
- Test: `src/features/settings/__tests__/settingsViewHelpers.test.ts`（テストを 1 件足す）
- Test: `src/features/settings/__tests__/SettingsPage.features.test.tsx:107`
- Test: `src/features/settings/__tests__/SettingsPage.render-and-save.test.tsx:26`

**Interfaces:**

- Consumes: `BACKGROUND_REFRESH_FIELD: NumberFieldViewModel`（`{ label, description, min, max, errorText, hint }`。`src/features/settings/helpers/defaultAndPomodoro.ts` が export している）
- Produces: なし（型・関数のシグネチャは変えない）

- [ ] **Step 1: 文言を固定するテストを足す（失敗するテスト）**

`src/features/settings/__tests__/settingsViewHelpers.test.ts` の import に `BACKGROUND_REFRESH_FIELD` を足す。

```ts
import {
  BACKGROUND_REFRESH_FIELD,
  DEFAULT_DURATION_FIELD,
  DEFAULT_NOTIFICATION_FIELD,
  POMODORO_FIELDS,
} from "../helpers/defaultAndPomodoro";
```

同じファイルの `describe("settings view helpers", () => {` の中の、最後の `it(...)` の後ろに、次のテストを足す。

```ts
it("定期リフレッシュ間隔の表示名と説明文が、実際の動作（表示中の間隔。復帰時はすぐ再評価）を説明している", () => {
  // 期待値は定数を参照せず、文字列をそのまま書く（定数を変えたときにテストが気づけるようにする）
  expect(BACKGROUND_REFRESH_FIELD).toEqual({
    label: "表示中の定期リフレッシュ間隔（分）",
    description:
      "アプリを表示したままのときに、ルーティンの背景色（経過色）を再評価する間隔です。バックグラウンドから戻したときは、この値に関係なくすぐに再評価します。0を設定すると定期的な再評価は行われません。",
    min: 0,
    max: 60,
    errorText: "0～60分の範囲で入力してください（0で定期更新なし）",
    hint: "推奨: 30分",
  });

  // 以前の誤解を招く言い回し（復帰してから待つ、と読める表現）が残っていない
  expect(BACKGROUND_REFRESH_FIELD.label).not.toContain("バックグラウンド復帰");
  expect(BACKGROUND_REFRESH_FIELD.description).not.toContain("最大待機時間");
});
```

`not.toContain("バックグラウンド復帰")` の行は、Prettier の幅（全角文字は 2 文字分で数える）を超えるので、上のとおり 3 行に折り返して書く。

`errorText` の文字列は、`src/features/settings/helpers/defaultAndPomodoro.ts` の 36 行目からコピーする（`～` を打ち直さない）。

- [ ] **Step 2: 画面のテスト 2 件を新しい表示名に直す**

`src/features/settings/__tests__/SettingsPage.features.test.tsx` と `src/features/settings/__tests__/SettingsPage.render-and-save.test.tsx` の、次の箇所（それぞれ 1 か所）を直す。

変更前:

```ts
const bgRefreshSection = screen
  .getByText("バックグラウンド復帰リフレッシュ間隔（分）")
  .closest("div")!;
```

変更後:

```ts
const bgRefreshSection = screen
  .getByText("表示中の定期リフレッシュ間隔（分）")
  .closest("div")!;
```

その次の行（`expect(within(bgRefreshSection).getByRole("spinbutton")).toHaveValue(30);`）は変えない。

- [ ] **Step 3: テストが失敗することを確かめる**

Run: `npx cross-env TZ=Asia/Tokyo jest src/features/settings/__tests__/settingsViewHelpers.test.ts src/features/settings/__tests__/SettingsPage.features.test.tsx src/features/settings/__tests__/SettingsPage.render-and-save.test.tsx --forceExit`

Expected: 3 ファイルとも FAIL。

- `settingsViewHelpers.test.ts`: 足したテストが、`label`・`description` の違いで失敗する。
- `SettingsPage.features.test.tsx`・`SettingsPage.render-and-save.test.tsx`: `Unable to find an element with the text: 表示中の定期リフレッシュ間隔（分）` で失敗する。

それ以外の理由（import の誤り、構文エラーなど）で失敗した場合は、テストを直してからもう一度実行する。

- [ ] **Step 4: 定数の表示名と説明文を直す**

`src/features/settings/helpers/defaultAndPomodoro.ts` の `BACKGROUND_REFRESH_FIELD` を、次のとおりにする（`label` と `description` だけが変わる）。

```ts
export const BACKGROUND_REFRESH_FIELD: NumberFieldViewModel = {
  label: "表示中の定期リフレッシュ間隔（分）",
  description:
    "アプリを表示したままのときに、ルーティンの背景色（経過色）を再評価する間隔です。バックグラウンドから戻したときは、この値に関係なくすぐに再評価します。0を設定すると定期的な再評価は行われません。",
  min: 0,
  max: 60,
  errorText: "0～60分の範囲で入力してください（0で定期更新なし）",
  hint: "推奨: 30分",
};
```

- [ ] **Step 5: テストが通ることを確かめる**

Run: `npx cross-env TZ=Asia/Tokyo jest src/features/settings/__tests__/settingsViewHelpers.test.ts src/features/settings/__tests__/SettingsPage.features.test.tsx src/features/settings/__tests__/SettingsPage.render-and-save.test.tsx --forceExit`

Expected: 3 ファイルとも PASS。

- [ ] **Step 6: 型のコメントを実際の意味に合わせる**

`src/types/routine/settings.ts` の 31〜32 行目を直す。

変更前:

```ts
  /** バックグラウンド復帰時のフォールバックリフレッシュ間隔（分）。0 で無効 */
  backgroundRefreshIntervalMinutes?: number;
```

変更後:

```ts
  /**
   * アプリを表示したままのときに、ルーティンの状態と経過色を再評価する間隔（分）。0 で定期の再評価なし。
   * バックグラウンドから戻したときは、この値に関係なくすぐに再評価する
   * （キーの名前は以前の表示名「バックグラウンド復帰リフレッシュ間隔」のまま残している）
   */
  backgroundRefreshIntervalMinutes?: number;
```

- [ ] **Step 7: テストマトリクスの 13-21 を直す**

`docs/03-testing/test-matrix.md` の 255 行目（`| 13-21 |` で始まる行）の、項目名と備考を直す。番号と確認の状態（`✅`・`⬜`・`⬜`）は変えない。

- 項目名: `表示中の定期リフレッシュ間隔（0〜60分）設定`
- 備考: `0で定期の再評価なし。デフォルト30分。表示中のフォールバックタイマーの間隔（復帰時は値に関係なくすぐ再評価）`

直した後の行（列の幅は次の手順の Prettier が整える）:

```markdown
| 13-21 | 表示中の定期リフレッシュ間隔（0〜60分）設定 | ✅ | ⬜ | ⬜ | 0で定期の再評価なし。デフォルト30分。表示中のフォールバックタイマーの間隔（復帰時は値に関係なくすぐ再評価） |
```

その後、表の列幅を整える。

Run: `npx prettier --write docs/03-testing/test-matrix.md`

Run: `git diff docs/03-testing/test-matrix.md`

Expected: 差分は、13-21 を含む表の中だけに出る。文言が変わるのは 13-21 の 1 行だけで、同じ表のほかの行は、列の幅（空白と区切りの `-` の数）だけが変わる。ほかの表や節に差分が出た場合は、その差分を元に戻す。

- [ ] **Step 8: 古い文言が残っていないことを確かめる**

Run: `grep -rn "バックグラウンド復帰\|復帰リフレッシュ\|最大待機時間" src docs README.md e2e .storybook 2>/dev/null | grep -v "^docs/superpowers/"`

Expected: 出るのは次の 2 種類だけ。

- `src/types/routine/settings.ts` のコメント（「以前の表示名「バックグラウンド復帰リフレッシュ間隔」のまま残している」）
- `src/features/settings/__tests__/settingsViewHelpers.test.ts` の `not.toContain` の引数（`"バックグラウンド復帰",` の行と、`not.toContain("最大待機時間")` の行）

ほかに出た場合は、設計書の「変更する箇所」に無い箇所なので、直さずに報告する。

- [ ] **Step 9: 全体の検証を通す**

Run: `npm test`
Expected: すべて PASS（失敗 0 件）。

Run: `npm run lint`
Expected: エラー・警告 0 件。

Run: `npm run typecheck`
Expected: エラー 0 件。

Run: `npm run format:check`
Expected: `All matched files use Prettier code style!`

Run: `npm run build`
Expected: ビルドが成功する。

失敗した場合は、原因を直してからもう一度実行する。今回の変更と関係のない失敗（変更前から起きているもの）は、`git stash` を使わずに、失敗の内容をそのまま報告する。

- [ ] **Step 10: コミットしない**

変更は作業ツリーに残したままにする。`git status --short` の結果（変更した 6 ファイルと、新しく作られた設計書・プラン）を報告する。
