# 不具合報告メニュー移動の単一責任リファクタ 実装プラン

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans（このプランは1タスクのみのため、subagent-driven-developmentは不要）。ステップはチェックボックス（`- [ ]`）で進捗管理する。

**Goal:** main ブランチから変更されている箇所（不具合報告機能のハンバーガーメニュー移動）を対象に単一責任原則（SRP）の観点で洗い出し、違反箇所をリファクタする。リファクタ対象コードのユニットテストも拡充する。

**Architecture:** 洗い出しの結果、新規追加した `BugReportPage.tsx` は単一責任を守れており、既存ファイルへの追加分もほとんどが1〜数行の小さな変更で責務混在を生んでいない。唯一、`headerMenuItemHelpers.ts` の `filterStaticHeaderMenuItems` 内で「常時表示させたいメニューID」の判定が `if (item.id === "home" || item.id === "settings" || item.id === "bug-report")` という条件式の羅列になっており、同ファイル内に既にある `PINNED_FIRST` / `PINNED_LAST`（名前付き `Set` で意図を表現するパターン）と一貫していない。3つ目の分岐が加わったことでこのパターンのばらつきが顕在化したため、既存パターンに揃えて `Set` に抽出する。

**Tech Stack:** TypeScript, Jest

## Global Constraints

- リファクタは振る舞いを変えない。既存の関連テストはすべて元のアサーション内容のまま通過すること
- 既存の `PINNED_FIRST` / `PINNED_LAST`（`Set` で意図を名前付けするパターン）に倣うこと
- 自動コミットはしない

---

## 洗い出し結果

main ブランチとの差分ファイル一覧と、SRP観点での判定:

| ファイル                                                              | 種別             | 判定                                                                                                                                            |
| --------------------------------------------------------------------- | ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/config/locales/ja.json`                                          | 設定データ       | 対象外（メニュー項目1件追加のみ）                                                                                                               |
| `src/features/bug-report/components/BugReportPage.tsx`                | 新規ページ       | 対象外（CardPanel+タイトル+フォームの単純な構成。状態管理は`useBugReportForm`に分離済み）                                                       |
| `src/features/bug-report/components/BugReportSection.tsx`             | 削除             | 対象外                                                                                                                                          |
| `src/features/bug-report/index.ts`                                    | export定義       | 対象外                                                                                                                                          |
| `src/features/bug-report/__tests__/BugReportPage.test.tsx`            | テスト           | 対象外                                                                                                                                          |
| `src/features/routine/pages/types.ts`                                 | 型定義           | 対象外                                                                                                                                          |
| `src/features/routine/pages/pageComponentResolver.ts`                 | ページ解決       | 対象外（1エントリ追加のみ、単一責任のマッピングを維持）                                                                                         |
| `src/features/routine/pages/__tests__/pageComponentResolver.test.tsx` | テスト           | 対象外                                                                                                                                          |
| `src/features/settings/SettingsPage.tsx`                              | 設定画面         | 対象外（BugReportSectionの参照削除のみ、コーディネーターとしての単一責任は維持）                                                                |
| `src/features/settings/__tests__/SettingsPage.features.test.tsx`      | テスト           | 対象外                                                                                                                                          |
| `src/features/settings/components/MenuOrderSection.tsx`               | 並び替えUI       | 対象外（`REORDERABLE_MENU_IDS`への1件追加のみ。ファイル自体が複数責務を持つ既存の設計だが、今回の変更で新たに生じた問題ではないためスコープ外） |
| `src/hooks/headerMenuItemHelpers.ts`                                  | メニューヘルパー | **対象**（下記参照）                                                                                                                            |
| `src/hooks/__tests__/headerMenuItemHelpers.test.ts`                   | テスト           | 対象外（対象ファイルのテストとして拡充する）                                                                                                    |

### `headerMenuItemHelpers.ts` のSRP観点の課題

`filterStaticHeaderMenuItems` 内、常時表示させたいメニューIDの判定が条件式の羅列になっている:

```ts
if (item.id === "home" || item.id === "settings" || item.id === "bug-report")
  return true;
```

同じファイル内に、同種の「特定IDの集合による判定」を表現する既存パターンが既にある:

```ts
const PINNED_FIRST = new Set(["home"]);
const PINNED_LAST = new Set(["settings", "account-admin"]);
```

「常時表示（visibleFeatures制御対象外）」という一つの概念を、条件式の羅列ではなく名前付きの`Set`で表現することで、（1）この判定が何を意図しているかがコードから直接読み取れる、（2）今後4つ目・5つ目の常時表示項目が増えても`Set`への追加で済み条件式が伸び続けない、という2点が改善される。

---

### Task 1: 常時表示メニューID判定を名前付きSetに抽出する

**Files:**

- Modify: `src/hooks/headerMenuItemHelpers.ts`
- Modify: `src/hooks/__tests__/headerMenuItemHelpers.test.ts`

**Interfaces:**

- 新規に追加する定数はモジュール内部専用（export不要）。`filterStaticHeaderMenuItems`の公開シグネチャは変更しない。

- [x] **Step 1: `ALWAYS_VISIBLE_MENU_IDS` 定数を追加する**

`headerMenuItemHelpers.ts` の `PINNED_FIRST` / `PINNED_LAST` 定義の近く（158行目付近、`filterStaticHeaderMenuItems`関数より前）に追加する:

```ts
// visibleFeaturesによる表示/非表示切り替えの対象外とし、常にメニューに表示するID
const ALWAYS_VISIBLE_MENU_IDS = new Set(["home", "settings", "bug-report"]);
```

- [x] **Step 2: `filterStaticHeaderMenuItems` 内の条件式を置き換える**

```ts
if (item.id === "home" || item.id === "settings" || item.id === "bug-report")
  return true;
```

を以下に置き換える:

```ts
if (ALWAYS_VISIBLE_MENU_IDS.has(item.id)) return true;
```

- [x] **Step 3: 既存テストが全件通過することを確認する**

Run: `npx jest src/hooks/__tests__/headerMenuItemHelpers.test.ts --no-coverage`
Expected: 既存の全ケース（「不具合報告は feature 設定に関わらず常に表示される」を含む）がPASS（振る舞いは変えていないため）

- [x] **Step 4: 判定ロジックの一元化を示すテストケースを追加する**

`headerMenuItemHelpers.test.ts` の「不具合報告は feature 設定に関わらず常に表示される」テストの後ろに、home/settings/bug-report の3つが同じ扱いであることを一括で検証するテストを追加する:

```ts
it("常時表示対象（home/settings/bug-report）はvisibleFeaturesの内容に関わらずすべて表示される", () => {
  const isPageType = (route: string): route is HeaderMenuItem["route"] =>
    route !== "invalid";

  const items = filterStaticHeaderMenuItems({
    visibleFeatures: baseVisibleFeatures,
    isAdmin: false,
    isPageType,
  });

  expect(items.some((item) => item.id === "home")).toBe(true);
  expect(items.some((item) => item.id === "settings")).toBe(true);
  expect(items.some((item) => item.id === "bug-report")).toBe(true);
});
```

- [x] **Step 5: 追加したテストが失敗せず通ることを確認する**

Run: `npx jest src/hooks/__tests__/headerMenuItemHelpers.test.ts --no-coverage`
Expected: 既存ケース + 新規ケースすべてPASS

- [x] **Step 6: hooks全体・lint・型チェックを実行する**

Run:

```bash
npx jest src/hooks --no-coverage
npx eslint src/hooks/ --quiet
npx tsc --noEmit -p tsconfig.json
npx tsc --noEmit -p tsconfig.test.json
```

Expected: すべてエラーなし

- [x] **Step 7: 全体テストスイート・E2Eを実行する**

Run:

```bash
npm test -- --runInBand
npx playwright test
```

Expected: すべてPASS（既存機能への影響がないことを確認）

- [ ] **Step 8: コミット（ユーザーに確認の上で実行）**

このプランは「自動コミットはしないでください」という指示のもと実行されるため、Step 7 まで完了したらユーザーに差分を提示し、コミットしてよいか確認してから実行する。

```bash
git add src/hooks/headerMenuItemHelpers.ts src/hooks/__tests__/headerMenuItemHelpers.test.ts
git commit -m "$(cat <<'EOF'
refactor(header-menu): 常時表示メニューID判定を名前付きSetに抽出する

EOF
)"
```

---

## Self-Review

- **Spec coverage**: 洗い出した対象ファイル13件すべてに判定を記載。SRP対象は1件のみで、そのリファクタとテスト拡充をTask 1に網羅した。
- **Placeholder scan**: なし。すべてのコードブロックは実際に貼り付け可能な完全な内容。
- **Type consistency**: `ALWAYS_VISIBLE_MENU_IDS` は既存の `PINNED_FIRST` / `PINNED_LAST` と同じ `Set<string>` 型（`new Set([...])` のリテラル推論）で、既存パターンと一致させている。
- **スコープ判断の妥当性**: `MenuOrderSection.tsx` は複数責務（データ取得・並び替えロジック・ドラッグ&ドロップ状態・レンダリング）を持つが、これは今回の変更（`REORDERABLE_MENU_IDS`への1件追加）が生んだ問題ではなく、既存の設計。今回のタスクスコープ外として対象外と判定した。
