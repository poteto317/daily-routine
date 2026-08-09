# WeatherPage テストの単一責任リファクタ 実装プラン

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans（このプランは1タスクのみのため、subagent-driven-developmentは不要）。ステップはチェックボックス（`- [ ]`）で進捗管理する。

**Goal:** main ブランチから変更されている箇所を対象に単一責任原則（SRP）の観点で洗い出し、違反箇所をリファクタする。リファクタ対象コードのユニットテストも拡充する。

**Architecture:** 洗い出しの結果、SRP改善が必要なのは `src/features/weather/__tests__/weather-page/` 配下のテスト群のみ。今回 `WeatherPage.a11y.test.tsx` を追加したことで同ディレクトリのテストが3本になり、「モックインフラの定義」と「振る舞いの検証」が各ファイルに同居・重複している状態が顕在化した。既存の `*.test.setup.ts` パターン（例: `src/features/notification/__tests__/notification-messaging.test.setup.ts`、`src/features/auth/context/__tests__/AuthContext.test-setup.tsx`）に倣い、モックインフラと共有フィクスチャを 1 つの setup ファイルへ分離する。

**Tech Stack:** Jest, React Testing Library, TypeScript

## Global Constraints

- 既存の `*.test.setup.ts` / `*.test-setup.tsx` 命名規則に従うこと
- リファクタは振る舞いを変えない。既存テストはすべて元のアサーション内容のまま通過すること
- 自動コミットはしない

---

## 洗い出し結果

main ブランチとの差分ファイル一覧と、SRP観点での判定:

| ファイル                                                              | 種別           | 判定                                                                                                              |
| --------------------------------------------------------------------- | -------------- | ----------------------------------------------------------------------------------------------------------------- |
| `docs/03-testing/README.md`                                           | ドキュメント   | 対象外                                                                                                            |
| `docs/03-testing/test-matrix.md`                                      | ドキュメント   | 対象外                                                                                                            |
| `docs/04-reference/features.md`                                       | ドキュメント   | 対象外                                                                                                            |
| `src/config/locales/ja.json`                                          | 設定データ     | 対象外（バッジ文言の変更のみ）                                                                                    |
| `src/features/weather/locales/ja.json`                                | 文言データ     | 対象外（キー1件追加のみ）                                                                                         |
| `e2e/helpers.ts`                                                      | E2E共通処理    | 対象外（ストレージ初期化・ログイン・メニュー遷移という「E2E操作の語彙」を提供する単一の役割。関数はそれぞれ独立） |
| `e2e/routine-creation.spec.ts`                                        | E2Eテスト      | 対象外（1シナリオのみ）                                                                                           |
| `e2e/todo-list.spec.ts`                                               | E2Eテスト      | 対象外（1シナリオのみ）                                                                                           |
| `e2e/settings-persistence.spec.ts`                                    | E2Eテスト      | 対象外（1シナリオのみ）                                                                                           |
| `e2e/menu-navigation.spec.ts`                                         | E2Eテスト      | 対象外（遷移確認という単一の関心事）                                                                              |
| `src/features/auth/context/__tests__/AuthContext.test-setup.tsx`      | テストsetup    | 対象外（すでにモック分離済みの setup。今回の変更はその責務内）                                                    |
| `src/features/auth/context/__tests__/AuthContext.useAuth.test.tsx`    | テスト         | 対象外（import 経路の修正のみ）                                                                                   |
| `src/features/meal/__tests__/pageStateActions.test.ts`                | テスト         | 対象外（テストケース追加のみ）                                                                                    |
| `src/features/routine/components/RoutineForm.tsx`                     | コンポーネント | 対象外（ダイアログ属性の付与のみ）                                                                                |
| `src/features/routine/components/RoutineFormHeader.tsx`               | コンポーネント | 対象外（見出しへの id 付与のみ）                                                                                  |
| `src/features/routine/components/helpers.ts`                          | 定数・ヘルパー | 対象外（既存の「フォーム関連の定数と表示ロジックを集約する」方針に沿った定数1件の追加）                           |
| `src/features/routine/components/__tests__/RoutineForm.a11y.test.tsx` | テスト         | 対象外（モックなし、アサーションのみ）                                                                            |
| `src/features/test-matrix/DetailPanel.tsx`                            | コンポーネント | 対象外（ダイアログ属性・aria-label の付与のみ。ファイル自体は181行と大きいが今回の変更で生じた問題ではない）      |
| `src/features/weather/page/WeatherPage.tsx`                           | コンポーネント | 対象外（aria-label 付与と文言参照の追加のみ）                                                                     |
| `src/features/weather/__tests__/weather-page/*.test.tsx`（3ファイル） | テスト         | **対象**（下記参照）                                                                                              |

### `weather-page` テスト群のSRP違反

`WeatherPage.a11y.test.tsx` を追加した結果、同ディレクトリの3ファイルすべてが以下2つの責務を各自で抱えている:

1. **モックインフラの定義**: `jest.mock("../../weather-api")` / `jest.mock("../../weather-cache")` と、`mockFetchWeatherData` 等の `jest.MockedFunction` キャスト（各ファイル 22〜34行）
2. **振る舞いの検証**: 各テストケース本体

さらに、`mockFetchWeatherData.mockResolvedValue({...})` に渡す天気データのフィクスチャ（東京・15行）が**3ファイルで完全に同一の内容で重複**している。

現状の重複:

| ファイル                                | モック定義部の行数 | 天気フィクスチャ |
| --------------------------------------- | ------------------ | ---------------- |
| `WeatherPage.a11y.test.tsx`             | 22行               | 重複             |
| `WeatherPage.current-location.test.tsx` | 34行               | 重複             |
| `WeatherPage.initial-load.test.tsx`     | 22行               | 重複             |

このコードベースには `notification-messaging.test.setup.ts` や `AuthContext.test-setup.tsx` のように、モック定義・フィクスチャを setup ファイルへ分離する確立されたパターンがある。このパターンに倣う。

### テスト拡充対象

`WeatherPage.a11y.test.tsx` は現在1ケースのみで、`WeatherPage` のもう一つの `aria-label` を持つ要素（DetailPanel と同様に今回 a11y 改善した箇所）を検証していない。setup 分離後、以下を追加する:

- ページ内の全ボタンがアクセシブルな名前を持つこと（名前なしボタンの再発防止）

---

### Task 1: weather-page テストのモックインフラ分離とテスト拡充

**Files:**

- Create: `src/features/weather/__tests__/weather-page/WeatherPage.test-setup.ts`
- Modify: `src/features/weather/__tests__/weather-page/WeatherPage.a11y.test.tsx`
- Modify: `src/features/weather/__tests__/weather-page/WeatherPage.current-location.test.tsx`
- Modify: `src/features/weather/__tests__/weather-page/WeatherPage.initial-load.test.tsx`

**Interfaces:**

- `WeatherPage.test-setup.ts` が export するもの:
  - `mockFetchWeatherData` / `mockGetCachedWeatherData` / `mockCacheWeatherData` / `mockGetPreferredWeatherLocation` / `mockSavePreferredWeatherLocation` / `mockClearPreferredWeatherLocation` — 各モック関数
  - `tokyoWeatherData` — 3ファイルで共有していた天気データフィクスチャ
  - `setupWeatherPageMocks()` — `jest.clearAllMocks()` と既定の戻り値設定をまとめた beforeEach 用ヘルパー
  - `WeatherPage` — テスト対象コンポーネントの再 export（下記の注意点を参照）
  - モジュール読み込み時に `weather-api` / `weather-cache` を `jest.mock` する副作用を持つ

**実装時に判明した注意点（重要）:**

`jest.mock(...)` は「それが書かれたファイルの先頭」にしか巻き上げられない。setup ファイルへ
モックを移すと、テストファイル側が `WeatherPage` を setup より先に import した時点で
`weather-api` / `weather-cache` の**実モジュール**がバインドされ、モックが一切効かなくなる。

そのため setup ファイルから `WeatherPage` も再 export し、テストファイルは
`WeatherPage` を直接 import せず必ず setup 経由で受け取る。
（`AuthContext.test-setup.tsx` が `useAuth` を再 export しているのと同じ理由）

- [x] **Step 1: `WeatherPage.test-setup.ts` を作成する**

```ts
import * as weatherApi from "../../weather-api";
import * as weatherCache from "../../weather-cache";

// weather-api / weather-cache のモックは3つのテストファイルで共通のため、
// ここに集約する。各テストファイルはこの setup を import するだけでよい。
jest.mock("../../weather-api", () => ({ fetchWeatherData: jest.fn() }));
jest.mock("../../weather-cache", () => ({
  getCachedWeatherData: jest.fn(() => null),
  getPreferredWeatherLocation: jest.fn(() => null),
  cacheWeatherData: jest.fn(),
  clearPreferredWeatherLocation: jest.fn(),
  savePreferredWeatherLocation: jest.fn(),
}));

export const mockFetchWeatherData =
  weatherApi.fetchWeatherData as jest.MockedFunction<
    typeof weatherApi.fetchWeatherData
  >;
export const mockGetCachedWeatherData =
  weatherCache.getCachedWeatherData as jest.MockedFunction<
    typeof weatherCache.getCachedWeatherData
  >;
export const mockCacheWeatherData =
  weatherCache.cacheWeatherData as jest.MockedFunction<
    typeof weatherCache.cacheWeatherData
  >;
export const mockGetPreferredWeatherLocation =
  weatherCache.getPreferredWeatherLocation as jest.MockedFunction<
    typeof weatherCache.getPreferredWeatherLocation
  >;
export const mockSavePreferredWeatherLocation =
  weatherCache.savePreferredWeatherLocation as jest.MockedFunction<
    typeof weatherCache.savePreferredWeatherLocation
  >;
export const mockClearPreferredWeatherLocation =
  weatherCache.clearPreferredWeatherLocation as jest.MockedFunction<
    typeof weatherCache.clearPreferredWeatherLocation
  >;

/** 3ファイルで同一内容が重複していた天気データのフィクスチャ */
export const tokyoWeatherData = {
  location: "東京",
  lastUpdated: "2026-02-13T00:00:00.000Z",
  forecasts: [
    {
      date: "2026-02-13",
      dayOfWeek: "金",
      weather: "sunny" as const,
      temperature: { high: 10, low: 2 },
      precipitation: 0,
      description: "快晴です。",
    },
  ],
  hourly: [],
};

/** 各テストの beforeEach で呼ぶ既定状態のセットアップ */
export const setupWeatherPageMocks = () => {
  jest.clearAllMocks();
  mockGetCachedWeatherData.mockReturnValue(null);
  mockGetPreferredWeatherLocation.mockReturnValue(null);
  mockFetchWeatherData.mockResolvedValue(tokyoWeatherData);
};
```

- [x] **Step 2: 3つのテストファイルから重複を削除し、setup から import する**

各ファイルの冒頭にある `jest.mock(...)` 2つ、`mockXxx` のキャスト定義、`beforeEach` 内の既定モック設定・天気フィクスチャを削除し、setup からの import に置き換える。`describe` 以降のテストケース本体は変更しない。

`WeatherPage` の直接 import も削除し、setup 経由に置き換える（上記「実装時に判明した注意点」）。

例（`WeatherPage.initial-load.test.tsx`）:

```ts
import { render, waitFor } from "@testing-library/react";
import {
  WeatherPage,
  mockFetchWeatherData,
  mockGetPreferredWeatherLocation,
  setupWeatherPageMocks,
} from "./WeatherPage.test-setup";
```

`beforeEach` は以下に置き換える（各ファイル共通）:

```ts
beforeEach(() => {
  setupWeatherPageMocks();
});
```

各ファイルが実際に使うモックだけを import すること（未使用 import は lint エラーになる）。

- [x] **Step 3: 既存テストが全件通過することを確認する**

Run: `npx jest src/features/weather/__tests__/weather-page --no-coverage`
Expected: 3ファイルの全ケースがPASS（振る舞いは変えていないため）

- [x] **Step 4: 全ボタンがアクセシブルな名前を持つことのテストを追加する**

`WeatherPage.a11y.test.tsx` の既存ケースの後に追加する。今回 `aria-label` を付けた閉じるボタンだけでなく、ページ内の全ボタンに名前があることを保証し、名前なしボタンの再発を防ぐ。

```ts
  it("ページ内の全てのボタンがアクセシブルな名前を持つ", async () => {
    render(<WeatherPage />);

    // 天気データの描画完了を待つ
    await screen.findByRole("button", { name: "現在地を使用" });

    const namelessButtons = screen
      .getAllByRole("button")
      .filter((button) => !button.textContent?.trim() && !button.getAttribute("aria-label"));

    expect(namelessButtons).toHaveLength(0);
  });
```

- [x] **Step 5: 追加したテストが通ることを確認する**

Run: `npx jest src/features/weather/__tests__/weather-page --no-coverage`
Expected: 既存ケース + 新規ケースすべてPASS、コンソール出力に警告なし

- [x] **Step 6: weather 全体・lint・型チェックを実行する**

Run:

```bash
npx jest src/features/weather --no-coverage
npx eslint src/features/weather/ --quiet
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

「自動コミットはしないでください」という指示のもと実行されるため、Step 7 まで完了したらユーザーに差分を提示し、コミットしてよいか確認してから実行する。

---

## Self-Review

- **Spec coverage**: 洗い出した対象ファイル20件すべてに判定を記載。SRP対象は weather-page テスト群のみで、そのリファクタとテスト拡充をTask 1に網羅した。
- **Placeholder scan**: なし。すべてのコードブロックは実際に貼り付け可能な完全な内容。
- **Type consistency**: `tokyoWeatherData` の `weather` は `as const` を付けて既存の型（天気コードのリテラル union）と一致させている。`setupWeatherPageMocks` の戻り値は `void` で、既存の `setupSettingsPageMocks`（モックを返す形）とは異なるが、weather 側はモックを個別 export しているため戻り値は不要。
- **スコープ判断の妥当性**: `DetailPanel.tsx`（181行）は複数の関心事を含むが、今回の変更（ダイアログ属性の付与）が生んだ問題ではなく既存の設計。今回のタスクスコープ外として対象外と判定した。
