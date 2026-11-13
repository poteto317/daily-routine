# ジャーナルの日付を編集・新規追加で選べるようにする 実装プラン（Issue #201）

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:subagent-driven-development でタスクごとに新しいサブエージェントで実装し、タスクごとにレビューを挟む（実行方式はサブエージェント駆動開発に決まっている。インライン実行かどうかを聞かない）。Step はチェックボックス（`- [ ]`）で進捗を管理する。

**設計書:** `docs/superpowers/specs/2026-11-03-journal-edit-date-design.md`

**Goal:** ジャーナルの新規追加と編集（今日・過去とも）で日付を選べるようにし（今日まで）、AI エージェント API の `PATCH` でも日付を変えられるようにする。

**Architecture:** 保存層 `updateJournalEntry` に省略可能な `date` を足し、実際の置き場所（バケットのキー）から変更先のバケットの末尾へ移す。画面は日付の入力 state を `dateInput: string | null` の 1 つで持ち、UI 用ハンドラ（`handleTitleChange` など）だけが「最初の変更で日付を固定する」。リセットは素のセッターで行う。保存・更新のハンドラの入口で今日を 1 回だけ取り、純粋な検証関数 `getJournalDateError` で拒否する。API は `JOURNAL_UPDATE_KEYS` に `date` を足し、`patch.date` がキーと違うときだけ `removeEntry` → `addEntry` で移す。

**Tech Stack:** Next.js 16 / React 19（React Compiler 有効）/ TypeScript / Jest 30 + ts-jest + React Testing Library（jsdom）/ Storybook 10（`@storybook/nextjs-vite`）/ firebase-functions（別の `package.json`、テストはルートの Jest で実行）

## Global Constraints

各タスクの要件には、この節が暗黙に含まれる。

**運用（必ず守る）**

- `git commit`・`git push` をどの Step でも実行しない（コミットは後の工程で行う）。
- `git add -A`・`git stash`（共有の stash がある）・`git checkout`・`git restore`・`git reset` を使わない。実装を一時的に戻す確認は、ファイルの一時的な書き換えで行い、確認後に必ず元へ戻す。
- `npx prettier --write` は、その Step で明示したファイルだけに使う（`npm run format` は使わない）。
- このプランのコード片のうち、既存の `describe` や配列・YAML の途中へ足すものは、字下げを省いて載せていることがある（プラン自体を Prettier で整形したため）。足す場所の字下げに合わせて貼り、各タスクの最後の `npx prettier --write` で整える。
- `.env.local` や秘密の値を読む・書く・コピーしない（このワークツリーには `.env.local` が無い。作らない）。
- `node_modules` と `firebase-functions/node_modules` は、親のリポジトリの同名のディレクトリへのシンボリックリンク（指揮役が作成済み。`firebase-functions/node_modules` は `.git/info/exclude` で git の対象外）。触らない（`npm install` もしない）。

**検証コマンド（このワークツリー固有の事情）**

- このワークツリーは `.worktrees/` の下にあり、`jest.config.ts` の `testPathIgnorePatterns` の `"/\\.worktrees/"` で全テストが除外される。Jest は**必ず末尾に** `--testPathIgnorePatterns=/node_modules/ /firebase-functions/lib/ /e2e/` を付けて実行する。例: `npm test -- src/features/journal --testPathIgnorePatterns=/node_modules/ /firebase-functions/lib/ /e2e/`。`npm test` は `cross-env TZ=Asia/Tokyo jest --forceExit` なので、タイムゾーンは Asia/Tokyo に固定される（L-181）。
- ts-jest は `tsconfig.json` の `isolatedModules: true` により**型検査をしない**（トランスパイルだけ）。型の誤りはテストでは落ちないので、各タスクの最後に `npm run typecheck`（`tsc --noEmit -p tsconfig.json && tsc --noEmit -p tsconfig.test.json`。`*.stories.tsx` も対象）を必ず実行する。
- このワークツリーは `firebase-functions/node_modules` をリンクしているので、firebase-functions のテストと型検査はそのまま動く。作業前（2026-11-03 時点）のベースラインは次のとおり（失敗は 0。作業後も 0 を保つ）。
  - 全体の `npm test`（Jest は `--testPathIgnorePatterns=/node_modules/ /firebase-functions/lib/ /e2e/` を付けて実行）: `Test Suites: 1317 passed, 1317 total` / `Tests: 6474 passed, 6474 total`。判定は「`FAIL` が 1 件も無い」「`Tests:` に `failed` が無い」「passed の件数がベースライン（6474）より増えている」。
  - `npm run typecheck:functions`（`tsc --noEmit -p firebase-functions`）: エラー 0 件（exit 0）。判定は「exit 0」。
- firebase-functions の `package.json` の scripts: `lint` は `echo 'Skipping lint for now'` だけ。`build` は `lib/` を消してから `tsc`（`lib/` を書き換えるので実行しない）。firebase-functions の検証は、ルートの Jest（テスト）・`npm run typecheck:functions`（型）・ルートの `npx eslint`（lint）で行う。
- `npm run lint` は `eslint --max-warnings 0`（警告 0 件が条件）。`@typescript-eslint/consistent-type-imports`（`fixStyle: "inline-type-imports"`）で、型だけの import は `import type { X }` か `import { type X }` にする。
- `npm run format:check`（`prettier --check .`）は、作業前から `.claude/dev-flow/state.json`（開発フローの状態ファイル。git 管理外）だけが警告になる。このファイルは触らない。判定は「警告がこのファイルだけ」。
- `npm run tailwind:scan` で Tailwind の省略記法の検査をする（`verify:fast` の一部）。
- `npm run build`（`generate:fcm-sw` → `next build --webpack`）。生成される `public/firebase-messaging-sw.js` と `.next/` は git 管理外。

**コードの規則（`docs/02-development/coding-standards.md`・`architecture.md`）**

- コメント・JSDoc・テスト名は日本語。テキスト定数は `src/features/journal/locales/ja.json` に置き、コンポーネントにハードコードしない。
- ViewModel パターン: 文言は `locales/ja.json`、状態を持たない計算は `helpers.ts`・`utils/`、UI は状態とロジックの呼び出しだけ。
- feature の中に閉じる（Co-location）。`src/components`・`src/hooks` から `src/features` を参照しない。
- フォームの部品は `label` と `htmlFor`/`id` で関連付け、ダークモードは Tailwind の `dark:` を使う（既存の入力欄のクラスをそのまま使う）。
- 「今日」は既存の `getTodayDateString`（端末のローカル）のまま。JST 固定の `getTodayString` へ統一しない（範囲外）。
- 変えないもの: 同期（`journalHistory` の丸ごとの同期）・エクスポート・`firestore.rules`・今日の欄の「更新が新しい 1 件」の表示規則・二重送信の防止（今も無い。足さない）・`journalPageStateActions.ts`（barrel）・`journalPageReloadActionResult.ts`・`journalPageMutationActionsResult.ts`・`storage.ts`（再エクスポートのみ）・`journalStore.ts`（API。既存の関数をそのまま使う）。
- 日付の範囲: アプリは今日まで（未来は保存を拒否、`<input type="date">` の `max` に今日）。API は作成と同じ検証（形式と実在。未来は許す）。この非対称は意図したもの。
- テストで時刻を固定するときは `jest.useFakeTimers().setSystemTime(new Date("…+09:00"))` と書き、`afterEach` で `jest.useRealTimers()` する（L-181。タイマーをテスト間に残さない）。
- Storybook のストーリーは固定の日付を使い、相対日付（`new Date()` から計算）を使わない（L-502）。

**文言（Task 1 で足し、Task 2a・2b で使う。値はこのとおり）**

| キー                               | 値                                                           |
| ---------------------------------- | ------------------------------------------------------------ |
| `page.alertInvalidDate`            | `日付を正しく入力してください`                               |
| `page.alertFutureDate`             | `未来の日付は保存できません。今日までの日付を選んでください` |
| `todayCard.dateInputLabel`         | `日付`                                                       |
| `todayCard.dateEntryTitleTemplate` | `{date} の記録`                                              |
| `editCard.dateInputLabel`          | `日付`                                                       |

---

## ファイルの構成

| ファイル                                                                                                                                                                                                 | 責務・変更                                                                                                             | タスク |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- | ------ |
| `src/features/journal/storageEntries.ts`                                                                                                                                                                 | `updateJournalEntry(entryId, title, content, date?)`。実際の置き場所から変更先の末尾へ移す                             | 1      |
| `src/features/journal/utils/journalDate.ts`                                                                                                                                                              | `JournalDateError`・`isValidJournalDate`・`getJournalDateError` を追加。`formatJournalDate` は不正な入力をそのまま返す | 1      |
| `src/features/journal/locales/ja.json`                                                                                                                                                                   | 上の表の 5 キー                                                                                                        | 1      |
| `src/features/journal/journalPageDataActions.ts`・`journalViewStateData.ts`・`journalFormViewState.ts`・`useJournalPageInputState.ts`                                                                    | 入力 state に `dateInput: string \| null`                                                                              | 2a     |
| `src/features/journal/journalPageFormActions.ts`・`useJournalPageFormActions.ts`・`useJournalPageFormState.ts`・`journalPageFormStateResult.ts`                                                          | リセットに `setDateInput`。UI 用ハンドラ `createJournalInputChangeHandlers`（最初の変更で日付を固定）                  | 2a     |
| `src/features/journal/journalPageReloadActions.ts`・`useJournalPageReloadAction.ts`                                                                                                                      | 再読み込みで `dateInput` を `null` に戻す                                                                              | 2a     |
| `src/features/journal/journalMutationActions.ts`・`journalPageMutationHandlers.ts`・`useJournalSaveEntryAction.ts`・`useJournalUpdateEntryAction.ts`・`useJournalPageMutationActions.ts`                 | 日付の受け渡しと検証。今日は入口で 1 回だけ取る                                                                        | 2a     |
| `src/features/journal/journalPageActionBindings.ts`・`useJournalPageActions.ts`・`useJournalPageState.ts`・`journalPageStateResult.ts`・`JournalPage.tsx`（ハンドラの差し替えだけ）                      | 組み立て。`journalPageStateResult` から素のセッターを外す                                                              | 2a     |
| `src/features/journal/helpers.ts`                                                                                                                                                                        | `getJournalTodayCardHeading(date, today)`（今日のカードの見出し）                                                      | 2b     |
| `src/features/journal/components/JournalTodayCard.tsx`・`JournalEditCard.tsx`・`JournalPage.tsx`（日付の props）                                                                                         | 日付欄（`<input type="date">`）と見出し                                                                                | 2b     |
| `src/features/journal/components/JournalTodayCard.stories.tsx`・`JournalEditCard.stories.tsx`                                                                                                            | 日付の props とストーリー                                                                                              | 2b     |
| `firebase-functions/src/agentApi/operations/journal/journalInput.ts`・`journalOperations.ts`                                                                                                             | `PATCH` の `date`、バケットの移動                                                                                      | 3      |
| `（非公開の OpenAPI 仕様）`・`（非公開のエージェント API 仕様）`                                                                                                                                       | `JournalEntryPatch.date` と説明                                                                                        | 3      |
| `docs/04-reference/features.md`・`docs/03-testing/test-matrix.md`・`src/features/test-matrix/initialData.ts`・`src/features/test-matrix/detailed-test-cases/group-01-04.ts`・`journalEntity.ts`（JSDoc） | 説明・手動確認表・JSDoc                                                                                                | 4      |

---

## Task 1: 保存層・検証関数・文言

**Files:**

- Modify: `src/features/journal/storageEntries.ts`（`updateJournalEntry` を置き換え、`findJournalEntryLocation` を追加）
- Modify: `src/features/journal/utils/journalDate.ts`
- Modify: `src/features/journal/locales/ja.json`
- Test: `src/features/journal/__tests__/storage.test.ts`（末尾に `describe` を追加）
- Test: `src/features/journal/__tests__/journalDate.test.ts`

**Interfaces:**

- Consumes: なし
- Produces（後のタスクが使う）:
  - `updateJournalEntry(entryId: string, title: string, content: string, date?: string): void`（`storage.ts` から再エクスポート済み。`date` 省略時は `entry.date` も位置も触らない）
  - `export type JournalDateError = "invalid-format" | "not-real" | "future";`（`utils/journalDate.ts`）
  - `isValidJournalDate(date: string): boolean`（形式と実在だけ。未来も `true`）
  - `getJournalDateError(date: string, today: string): JournalDateError | null`
  - `formatJournalDate(dateStr: string): string`（不正な入力は入力をそのまま返す）
  - `journalTexts.page.alertInvalidDate`・`journalTexts.page.alertFutureDate`・`journalTexts.todayCard.dateInputLabel`・`journalTexts.todayCard.dateEntryTitleTemplate`・`journalTexts.editCard.dateInputLabel`

**気をつける知見:**

- L-454: `date` を省略したとき `entry.date` を `undefined` で上書きしない（`...(date === undefined ? {} : { date })` の形）。
- 2-3 節（`docs/02-development/review-lessons.md`）: エントリの `date` ではなく、見つけたバケットのキー（実際の置き場所）を正とする。キーと `entry.date` が食い違う古いデータのテストを入れる。
- 1-3 節: 実在の判定は `Date.UTC` を使わず `setUTCFullYear` で年を直接設定する（0〜99 年が 1900 年代に化けるため）。閏日・4/31・年 0050 をテストする。
- 手本: 家計簿の `updateExpense`（`src/features/budget/storageExpenses.ts:39`）。月をまたぐときだけ旧バケットから除いて新バケットの末尾へ入れる。
- 保存層は日付の形式を検査しない（呼び出し側で検査する。`saveJournalEntry` と同じ）。

- [ ] **Step 1: 保存層の失敗するテストを書く**

`src/features/journal/__tests__/storage.test.ts` の末尾（最後の `});` の後）に、次の `describe` を追加する。既存の import（`updateJournalEntry`・`mockGetStorageItem`・`mockSetStorageItem`）をそのまま使う。

```ts
describe("updateJournalEntry の日付の変更", () => {
  const NOW = "2026-02-12T10:00:00.000Z";

  const makeEntry = (id: string, date: string) => ({
    id,
    date,
    title: `${id} title`,
    content: `${id} content`,
    createdAt: `${date}T08:00:00.000Z`,
    updatedAt: `${date}T08:00:00.000Z`,
  });

  // 1 回の書き込みで保存したことを確かめ、保存した履歴を返す
  const savedHistory = () => {
    expect(mockSetStorageItem).toHaveBeenCalledTimes(1);
    expect(mockSetStorageItem.mock.calls[0][0]).toBe("journal-history");
    return mockSetStorageItem.mock.calls[0][1];
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Date.prototype, "toISOString").mockReturnValue(NOW);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("日付を変えると旧バケットから除き、変更先の末尾に入れる（変更先の既存と共存し、createdAt は据え置く）", () => {
    const target = makeEntry("j1", "2026-02-12");
    const sameDay = makeEntry("j2", "2026-02-12");
    const destination = makeEntry("j3", "2026-02-01");
    mockGetStorageItem.mockReturnValue({
      "2026-02-12": [target, sameDay],
      "2026-02-01": [destination],
    } as never);

    updateJournalEntry("j1", "new title", "new content", "2026-02-01");

    expect(savedHistory()).toEqual({
      "2026-02-12": [sameDay],
      "2026-02-01": [
        destination,
        {
          ...target,
          date: "2026-02-01",
          title: "new title",
          content: "new content",
          createdAt: "2026-02-12T08:00:00.000Z",
          updatedAt: NOW,
        },
      ],
    });
  });

  it("移したあと旧バケットが空になったら、旧バケットのキーを消す", () => {
    const target = makeEntry("j1", "2026-02-12");
    mockGetStorageItem.mockReturnValue({ "2026-02-12": [target] } as never);

    updateJournalEntry("j1", "t", "c", "2026-02-10");

    const saved = savedHistory();
    expect(saved).toEqual({
      "2026-02-10": [
        {
          ...target,
          date: "2026-02-10",
          title: "t",
          content: "c",
          updatedAt: NOW,
        },
      ],
    });
    expect(saved).not.toHaveProperty("2026-02-12");
  });

  it("同じ日付を明示したときは、配列の中の位置を変えない", () => {
    const first = makeEntry("j1", "2026-02-12");
    const second = makeEntry("j2", "2026-02-12");
    mockGetStorageItem.mockReturnValue({
      "2026-02-12": [first, second],
    } as never);

    updateJournalEntry("j1", "t", "c", "2026-02-12");

    expect(savedHistory()).toEqual({
      "2026-02-12": [
        { ...first, title: "t", content: "c", updatedAt: NOW },
        second,
      ],
    });
  });

  it("date を省略したときは、位置も entry.date も変えない（キーと entry.date が食い違うデータでも）", () => {
    const mismatched = makeEntry("j1", "2026-02-10");
    const second = makeEntry("j2", "2026-02-12");
    mockGetStorageItem.mockReturnValue({
      "2026-02-12": [mismatched, second],
    } as never);

    updateJournalEntry("j1", "t", "c");

    expect(savedHistory()).toEqual({
      "2026-02-12": [
        {
          ...mismatched,
          date: "2026-02-10",
          title: "t",
          content: "c",
          updatedAt: NOW,
        },
        second,
      ],
    });
  });

  it("キーと同じ日付を明示したときは、位置を変えずに entry.date をキーに直す", () => {
    const mismatched = makeEntry("j1", "2026-02-10");
    const second = makeEntry("j2", "2026-02-12");
    mockGetStorageItem.mockReturnValue({
      "2026-02-12": [mismatched, second],
    } as never);

    updateJournalEntry("j1", "t", "c", "2026-02-12");

    expect(savedHistory()).toEqual({
      "2026-02-12": [
        {
          ...mismatched,
          date: "2026-02-12",
          title: "t",
          content: "c",
          updatedAt: NOW,
        },
        second,
      ],
    });
  });

  it("キーと entry.date が食い違うデータでも、実際の置き場所（キー）から変更先へ移す", () => {
    const mismatched = makeEntry("j1", "2026-02-10");
    mockGetStorageItem.mockReturnValue({ "2026-02-12": [mismatched] } as never);

    updateJournalEntry("j1", "t", "c", "2026-02-01");

    expect(savedHistory()).toEqual({
      "2026-02-01": [
        {
          ...mismatched,
          date: "2026-02-01",
          title: "t",
          content: "c",
          updatedAt: NOW,
        },
      ],
    });
  });

  it("ID が見つからなければ、履歴の内容を変えない", () => {
    const history = { "2026-02-12": [makeEntry("j1", "2026-02-12")] };
    mockGetStorageItem.mockReturnValue(history as never);

    updateJournalEntry("missing", "t", "c", "2026-02-01");

    expect(savedHistory()).toEqual(history);
  });
});
```

- [ ] **Step 2: 保存層のテストが落ちることを確かめる**

Run: `npm test -- src/features/journal/__tests__/storage.test.ts --testPathIgnorePatterns=/node_modules/ /firebase-functions/lib/ /e2e/`
Expected: FAIL。「日付を変えると旧バケットから除き…」「移したあと旧バケットが空に…」「キーと同じ日付を明示…」「キーと entry.date が食い違うデータでも…」が `toEqual` の差分で落ちる（今の実装は日付を受け取らず、位置も `entry.date` も変えないため）。「同じ日付を明示…」「date を省略…」「ID が見つからなければ…」は今の実装でも通る（回帰の固定）。

- [ ] **Step 3: `updateJournalEntry` を実装する**

`src/features/journal/storageEntries.ts` の 1 行目の import を次に変え、`updateJournalEntry` 全体（49〜68 行目）を次に置き換える。

```ts
import { type JournalEntry, type JournalHistory } from "@/types/routine";
```

```ts
type JournalEntryLocation = { key: string; entry: JournalEntry };

/**
 * ID が一致するエントリと、それが実際に入っているバケットのキーを返す。
 * エントリ自身の date ではなく置き場所を正とする（キーと date が食い違うデータに耐える）
 */
const findJournalEntryLocation = (
  history: JournalHistory,
  entryId: string,
): JournalEntryLocation | null => {
  for (const [key, entries] of Object.entries(history)) {
    const entry = entries.find((candidate) => candidate.id === entryId);
    if (entry) return { key, entry };
  }
  return null;
};

/**
 * エントリのタイトル・本文（と、指定されたときは日付）を更新する。
 * date を変えたときは旧バケットから除き（空なら旧キーを消す）、変更先の末尾に入れる。
 * date を省略したときは entry.date も位置も変えない。書き込みは 1 回だけ。
 */
export const updateJournalEntry = (
  entryId: string,
  title: string,
  content: string,
  date?: string,
): void => {
  const history = getJournalHistory();
  const location = findJournalEntryLocation(history, entryId);

  if (!location) {
    // 見つからないときも、今までどおり内容を変えずに書き込む
    saveJournalHistory(history);
    return;
  }

  const { key, entry } = location;
  const updated: JournalEntry = {
    ...entry,
    title,
    content,
    // 省略時に undefined で既存の日付を上書きしない
    ...(date === undefined ? {} : { date }),
    updatedAt: new Date().toISOString(),
  };
  const shouldMove = date !== undefined && date !== key;

  if (!shouldMove) {
    saveJournalHistory({
      ...history,
      [key]: history[key].map((candidate) =>
        candidate.id === entryId ? updated : candidate,
      ),
    });
    return;
  }

  const remaining = history[key].filter(
    (candidate) => candidate.id !== entryId,
  );
  const otherDays = Object.fromEntries(
    Object.entries(history).filter(([dayKey]) => dayKey !== key),
  );
  const withoutEntry: JournalHistory =
    remaining.length > 0 ? { ...otherDays, [key]: remaining } : otherDays;

  saveJournalHistory({
    ...withoutEntry,
    [date]: [...(withoutEntry[date] ?? []), updated],
  });
};
```

- [ ] **Step 4: 保存層のテストが通ることを確かめる**

Run: `npm test -- src/features/journal/__tests__/storage.test.ts --testPathIgnorePatterns=/node_modules/ /firebase-functions/lib/ /e2e/`
Expected: PASS（既存の 8 件と追加の 7 件）。

- [ ] **Step 5: 実装を一時的に書き換えるとテストが落ちることを確かめ、元に戻す**

1. `storageEntries.ts` の `const shouldMove = date !== undefined && date !== key;` を一時的に `const shouldMove = date !== undefined && date === key;` に書き換え、Step 4 のコマンドを実行する。Expected: 移動のテスト（4 件）と「同じ日付を明示…」が落ちる。書き換えを元に戻す。
2. `...(date === undefined ? {} : { date }),` を一時的に `date: date as string,` に書き換え、Step 4 のコマンドを実行する。Expected: 「date を省略したときは…」が `date: undefined` の差分で落ちる（L-454）。書き換えを元に戻す。
3. 戻し忘れの確認: `grep -nF "const shouldMove = date !== undefined && date !== key;" src/features/journal/storageEntries.ts` と `grep -nF "...(date === undefined ? {} : { date })," src/features/journal/storageEntries.ts` がそれぞれ 1 行を出し、`grep -nF "date as string" src/features/journal/storageEntries.ts` が何も出さないこと。Step 4 のコマンドを再実行して PASS。

- [ ] **Step 6: 日付の検証関数の失敗するテストを書く**

`src/features/journal/__tests__/journalDate.test.ts` を次の内容に置き換える（既存のテストはそのまま残し、import と `describe` を足す）。

```ts
import {
  formatJournalDate,
  formatUpdatedAt,
  getJournalDateError,
  getTodayDateString,
  isValidJournalDate,
} from "../utils/journalDate";

describe("journalDate", () => {
  afterEach(() => {
    jest.useRealTimers();
  });

  describe("getTodayDateString", () => {
    it("月日を 2 桁に埋めた YYYY-MM-DD を返す", () => {
      jest.useFakeTimers().setSystemTime(new Date("2026-03-07T03:00:00+09:00"));

      expect(getTodayDateString()).toBe("2026-03-07");
    });

    it("月末と年末の境界をそのまま返す", () => {
      jest.useFakeTimers().setSystemTime(new Date("2026-12-31T23:59:59+09:00"));
      expect(getTodayDateString()).toBe("2026-12-31");

      jest.setSystemTime(new Date("2027-01-01T00:00:00+09:00"));
      expect(getTodayDateString()).toBe("2027-01-01");
    });

    it("うるう日を返す", () => {
      jest.useFakeTimers().setSystemTime(new Date("2028-02-29T12:00:00+09:00"));

      expect(getTodayDateString()).toBe("2028-02-29");
    });

    it("日本時間の 0 時台はローカル（Asia/Tokyo）の日付になる", () => {
      // ローカル時刻基準。UTC では前日の 2026-03-06 になる時刻
      jest.useFakeTimers().setSystemTime(new Date("2026-03-07T00:30:00+09:00"));

      expect(getTodayDateString()).toBe("2026-03-07");
    });
  });

  describe("isValidJournalDate", () => {
    it.each(["2026-03-07", "2028-02-29", "0050-01-01", "2099-12-31"])(
      "形式どおりで実在する日付（%s）は true（未来の日付も true）",
      (date) => {
        expect(isValidJournalDate(date)).toBe(true);
      },
    );

    it.each([
      "",
      "2026-3-7",
      "2026/03/07",
      "123456-01-01",
      "2026-02-30",
      "2026-04-31",
      "2026-02-29",
    ])("空・形式違い・実在しない日付（%s）は false", (date) => {
      expect(isValidJournalDate(date)).toBe(false);
    });
  });

  describe("getJournalDateError", () => {
    const today = "2026-03-07";

    it("今日と過去の日付は null", () => {
      expect(getJournalDateError("2026-03-07", today)).toBeNull();
      expect(getJournalDateError("2026-03-06", today)).toBeNull();
      expect(getJournalDateError("2028-02-29", "2028-03-01")).toBeNull();
      expect(getJournalDateError("0050-01-01", today)).toBeNull();
    });

    it.each(["", "2026-3-7", "2026/03/07", "123456-01-01"])(
      "空・形式違い（%s）は invalid-format",
      (date) => {
        expect(getJournalDateError(date, today)).toBe("invalid-format");
      },
    );

    it.each(["2026-02-30", "2026-04-31", "2026-02-29"])(
      "実在しない日付（%s）は not-real",
      (date) => {
        expect(getJournalDateError(date, today)).toBe("not-real");
      },
    );

    it("今日より後は future", () => {
      expect(getJournalDateError("2026-03-08", today)).toBe("future");
      expect(getJournalDateError("2027-01-01", today)).toBe("future");
    });
  });

  describe("formatJournalDate", () => {
    it("年月日と曜日を日本語で整形する", () => {
      expect(formatJournalDate("2026-03-07")).toBe("2026年3月7日(土)");
    });

    it("月末・年末・うるう日を整形する", () => {
      expect(formatJournalDate("2026-12-31")).toBe("2026年12月31日(木)");
      expect(formatJournalDate("2028-02-29")).toBe("2028年2月29日(火)");
    });

    it.each(["", "123456-01-01", "2026-02-30", "abc"])(
      "不正な入力（%s）は例外を投げず、入力をそのまま返す",
      (input) => {
        expect(formatJournalDate(input)).toBe(input);
      },
    );
  });

  describe("formatUpdatedAt", () => {
    it("日時を ja-JP のロケール表記にする", () => {
      expect(formatUpdatedAt("2026-03-07T05:06:07+09:00")).toBe(
        "2026/3/7 5:06:07",
      );
    });

    it("年をまたぐ UTC の時刻をローカル（JST）に直す", () => {
      expect(formatUpdatedAt("2026-12-31T15:00:00Z")).toBe("2027/1/1 0:00:00");
    });
  });
});
```

- [ ] **Step 7: 日付の検証関数のテストが落ちることを確かめる**

Run: `npm test -- src/features/journal/__tests__/journalDate.test.ts --testPathIgnorePatterns=/node_modules/ /firebase-functions/lib/ /e2e/`
Expected: FAIL。`isValidJournalDate is not a function`・`getJournalDateError is not a function`、`formatJournalDate` の不正な入力が `"Invalid Date"`（`""`・`"123456-01-01"`・`"abc"`）や `"2026年3月2日(月)"`（`"2026-02-30"`）で落ちる。

- [ ] **Step 8: 日付の検証関数を実装する**

`src/features/journal/utils/journalDate.ts` を次の内容に置き換える（`getTodayDateString`・`formatUpdatedAt` は変えない）。

```ts
const JOURNAL_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/** 日付の検証で保存を拒否する理由。空は invalid-format に含める */
export type JournalDateError = "invalid-format" | "not-real" | "future";

export const getTodayDateString = (): string => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

/**
 * "YYYY-MM-DD" の年月日が暦の上で実在するか（例: 2026-02-30 は false）。
 * Date.UTC は 0〜99 年を 1900 年代に補正するため、setUTCFullYear で年を直接設定する
 * （firebase-functions の validation/dateFormats.ts の isRealDate と同じ）。
 */
const isRealJournalDate = (value: string): boolean => {
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(0);
  date.setUTCFullYear(year, month - 1, day);
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
};

/** 形式（YYYY-MM-DD）と実在だけを見る。未来の日付も true（見出しの判定に使う） */
export const isValidJournalDate = (date: string): boolean =>
  JOURNAL_DATE_PATTERN.test(date) && isRealJournalDate(date);

/**
 * 保存・更新で日付を拒否する理由を返す。問題が無ければ null。
 * today は呼び出し側が 1 回だけ取った今日（YYYY-MM-DD）。
 */
export const getJournalDateError = (
  date: string,
  today: string,
): JournalDateError | null => {
  if (!JOURNAL_DATE_PATTERN.test(date)) return "invalid-format";
  if (!isRealJournalDate(date)) return "not-real";
  // どちらも YYYY-MM-DD なので、文字列の比較で日付の前後が分かる
  if (date > today) return "future";
  return null;
};

export const formatJournalDate = (dateStr: string): string => {
  // 日付欄の値が空・不正でも、例外や "Invalid Date" にせず入力をそのまま返す
  if (!isValidJournalDate(dateStr)) return dateStr;

  const date = new Date(`${dateStr}T00:00:00`);
  return date.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short",
  });
};

export const formatUpdatedAt = (dateTimeStr: string): string => {
  return new Date(dateTimeStr).toLocaleString("ja-JP");
};
```

- [ ] **Step 9: 日付の検証関数のテストが通ることを確かめる**

Run: `npm test -- src/features/journal/__tests__/journalDate.test.ts --testPathIgnorePatterns=/node_modules/ /firebase-functions/lib/ /e2e/`
Expected: PASS。

- [ ] **Step 10: 実装を一時的に書き換えるとテストが落ちることを確かめ、元に戻す**

1. `isRealJournalDate` の `const date = new Date(0);` と `date.setUTCFullYear(year, month - 1, day);` の 2 行を、一時的に `const date = new Date(Date.UTC(year, month - 1, day));` の 1 行に書き換え、Step 9 のコマンドを実行する。Expected: `0050-01-01` のケース（`isValidJournalDate` と `getJournalDateError`）が落ちる（1-3 節）。元に戻す。
2. `formatJournalDate` の `if (!isValidJournalDate(dateStr)) return dateStr;` の行を一時的に消し、Step 9 のコマンドを実行する。Expected: 「不正な入力…」の 4 件が落ちる。元に戻す。
3. 戻し忘れの確認: `grep -n "Date.UTC" src/features/journal/utils/journalDate.ts` がコメントの 1 行だけを出し、`grep -n "if (!isValidJournalDate(dateStr)) return dateStr;" src/features/journal/utils/journalDate.ts` が 1 行を出すこと。Step 9 のコマンドを再実行して PASS。

- [ ] **Step 11: 文言を足す**

`src/features/journal/locales/ja.json` を次の内容に置き換える（既存のキーは変えない）。

```json
{
  "page": {
    "title": "📔 ジャーナル",
    "confirmDeleteEntryTemplate": "{date}の記録を削除しますか？",
    "alertMissingContent": "タイトルまたは本文を入力してください",
    "alertInvalidDate": "日付を正しく入力してください",
    "alertFutureDate": "未来の日付は保存できません。今日までの日付を選んでください",
    "defaultTitle": "無題"
  },
  "todayCard": {
    "titleLabel": "今日の記録",
    "dateEntryTitleTemplate": "{date} の記録",
    "dateInputLabel": "日付",
    "titleInputLabel": "タイトル",
    "contentInputLabel": "本文",
    "titlePlaceholder": "例: 今日の出来事",
    "contentPlaceholder": "今日感じたこと、考えたことを自由に書いてください...",
    "saveLabel": "保存",
    "updateLabel": "更新",
    "cancelLabel": "キャンセル",
    "emptyLabel": "まだ今日の記録はありません",
    "editButtonLabel": "✏️ 編集",
    "addButtonLabel": "➕"
  },
  "recentEntries": {
    "title": "📖 過去の記録",
    "empty": "記録がありません",
    "edit": "✏️ 編集",
    "delete": "🗑️ 削除",
    "updatedPrefix": "最終更新:"
  },
  "editCard": {
    "editingLabel": " の記録を編集",
    "dateInputLabel": "日付",
    "titleInputLabel": "タイトル",
    "contentInputLabel": "本文",
    "titlePlaceholder": "例: 今日の出来事",
    "contentPlaceholder": "今日感じたこと、考えたことを自由に書いてください...",
    "updateLabel": "更新",
    "cancelLabel": "キャンセル"
  }
}
```

- [ ] **Step 12: タスク全体を検証する**

1. `npx prettier --write src/features/journal/storageEntries.ts src/features/journal/utils/journalDate.ts src/features/journal/locales/ja.json src/features/journal/__tests__/storage.test.ts src/features/journal/__tests__/journalDate.test.ts`
2. `npm test -- src/features/journal --testPathIgnorePatterns=/node_modules/ /firebase-functions/lib/ /e2e/` → Expected: 全スイート PASS（ジャーナルの既存のテストも通る。`formatJournalDate` の変更で `JournalEditCard`・`JournalRecentEntries` のテストが落ちないこと）。
3. `npm run typecheck` → Expected: エラー 0 件で終了コード 0。
4. `npx eslint --max-warnings 0 src/features/journal` → Expected: 出力なし・終了コード 0。
5. `git status --short` → Expected: 変更は上の 5 ファイルと、未追跡の設計書・このプランだけ。

---

## Task 2a: 画面の配線（入力 state・固定・リセット・保存と更新への受け渡し）

この Task はカードの見た目を変えない（日付欄は Task 2b）。終わった時点で、`JournalPage.tsx` はタイトル・本文の入力を UI 用ハンドラへつなぎ、日付は state と保存・更新の処理を通って保存層まで届く。`npm run typecheck` と全テストが通る状態で終える。

**Files:**

- Modify（入力 state）: `src/features/journal/journalPageDataActions.ts`・`src/features/journal/journalViewStateData.ts`・`src/features/journal/journalFormViewState.ts`・`src/features/journal/useJournalPageInputState.ts`
- Modify（フォームの state と処理）: `src/features/journal/journalPageFormActions.ts`・`src/features/journal/useJournalPageFormActions.ts`・`src/features/journal/useJournalPageFormState.ts`・`src/features/journal/journalPageFormStateResult.ts`
- Modify（再読み込み）: `src/features/journal/journalPageReloadActions.ts`・`src/features/journal/useJournalPageReloadAction.ts`
- Modify（保存・更新）: `src/features/journal/journalMutationActions.ts`・`src/features/journal/journalPageMutationHandlers.ts`・`src/features/journal/useJournalSaveEntryAction.ts`・`src/features/journal/useJournalUpdateEntryAction.ts`・`src/features/journal/useJournalPageMutationActions.ts`
- Modify（組み立て）: `src/features/journal/journalPageActionBindings.ts`・`src/features/journal/useJournalPageActions.ts`・`src/features/journal/useJournalPageState.ts`・`src/features/journal/journalPageStateResult.ts`・`src/features/journal/JournalPage.tsx`（`onTitleChange`・`onContentChange` の差し替えだけ）
- Create（テスト）: `src/features/journal/__tests__/useJournalPageFormState.dateLock.test.tsx`
- Modify（テスト。`grep -rli "contentinput" src/features/journal/__tests__` の一覧のうち、カードの 2 ファイル〔`JournalEditCard.test.tsx`・`JournalTodayCard.test.tsx`。Task 2b〕を除く 23 ファイル）:
  `journalPageDataActions.test.ts`・`pageStateActions.test.ts`・`journalViewStateData.test.ts`・`journalFormViewState.test.ts`・`useJournalPageInputState.test.tsx`・`useJournalPageDataState.test.tsx`・`journalPageFormActions.test.ts`・`useJournalPageFormActions.test.tsx`・`useJournalPageFormState.test.tsx`・`journalPageFormStateResult.test.ts`・`journalPageReloadActions.test.ts`・`useJournalPageReloadAction.test.tsx`・`journalPageStateActions.test.ts`・`journalMutationActions.test.ts`・`journalPageMutationHandlers.test.ts`・`useJournalSaveEntryAction.test.tsx`・`useJournalUpdateEntryAction.test.tsx`・`useJournalPageMutationActions.test.tsx`・`journalPageActionBindings.test.ts`・`useJournalPageActions.test.tsx`・`useJournalPageState.test.tsx`・`journalPageStateResult.test.ts`・`JournalPage.test.tsx`（すべて `src/features/journal/__tests__/` の下）。`grep -rl "contentInput"`（大文字小文字を区別）の一覧には `useJournalPageFormActions.test.tsx` と `useJournalPageReloadAction.test.tsx` が出ない（`setContentInput` だけを含む）が、引数の形が変わるので直す。

**Interfaces:**

- Consumes（Task 1）: `updateJournalEntry(entryId, title, content, date?)`・`getJournalDateError(date, today): JournalDateError | null`・`journalTexts.page.alertInvalidDate`・`journalTexts.page.alertFutureDate`
- Produces（Task 2b が使う）:
  - `useJournalPageState()` の返り値（`createJournalPageStateResult` の形）: `contentInput: string`・`dateInput: string | null`・`editingEntry: JournalEntry | null`・`recentEntries`・`showForm`・`titleInput`・`today: string`・`todayEntry`・`handleCancelForm`・`handleContentChange: (value: string) => void`・`handleDateChange: (value: string) => void`・`handleDeleteEntry`・`handleSaveEntry`・`handleTitleChange: (value: string) => void`・`handleUpdateEntry`・`openEditForm`・`openForm`・`setEditingEntry`。**`setTitleInput`・`setContentInput` は含まない。**
  - `createJournalInputChangeHandlers(params: { editingEntry: JournalEntry | null; getToday: () => string; setTitleInput; setContentInput; setDateInput }): { handleTitleChange; handleContentChange; handleDateChange }`（`journalPageFormActions.ts`）
  - `export type JournalDateAlertMessages = { invalid: string; future: string };`（`journalMutationActions.ts`）

**気をつける知見:**

- 5-1 節: 日付の入力 state は `string | null` の 1 つ（`null` = 未操作、`""` = 利用者が空にした、`YYYY-MM-DD` = 選んだ値）。「触ったか」の真偽値を別に持たない。
- L-508: 保存・更新のハンドラの入口で今日を 1 回だけ取り（`getToday()`）、未操作時の既定値（`dateInput ?? today`）と未来の判定の両方に使う。
- L-454・2-3 節: 編集の保存は、日付を変えたときだけ日付を渡す。変えないとき（`dateInput ?? originalDate === originalDate`）は 4 番目の引数を渡さない（`undefined` を明示的に渡さない）。キーと `entry.date` が食い違う古いデータで、タイトルだけ直した保存がバケットを黙って移さないため。テストでは `mock.calls[0]` の長さ 3 で固定する。
- L-060: 日付をどこかの層で落としても、その層のテストが落ちるようにする（各層のテストで `dateInput`・`setDateInput` の受け渡しを確かめる）。
- 固定は UI 用ハンドラだけが行う。リセット（開く・閉じる・保存・再読み込み）は素のセッターで行い、固定を起こさない。固定する日付は関数更新の外で 1 回だけ取る（`setDateInput((prev) => prev ?? lockedDate)`。StrictMode の二重実行でも揺れない）。新規は固定する時点で `getToday()` を呼ぶ（描画時の `today` をクロージャで使わない）。編集は `editingEntry.date`。
- 日付欄の変更（`handleDateChange`）は固定の関数更新を使わず、選んだ値（`""` を含む）をそのまま入れる。
- 編集中に履歴の別のエントリを削除すると、再読み込みで `dateInput` が `null` に戻る（`editingEntry` と `showForm` は残る）。このとき `dateInput ?? editingEntry.date` で編集前の日付として扱い、次の入力では `editingEntry.date` で固定する（今日にしない）。
- `useJournalPageState` は描画のたびに `getTodayDateString()` を取り直す（L-538。`max` と見出しが入力のたびに追いつく）。この Task では変えない。

### 2a-1: 入力 state に `dateInput` を足す

- [ ] **Step 1: 入力 state の失敗するテストを書く**

次の 6 ファイルを直す。

`src/features/journal/__tests__/journalPageDataActions.test.ts` の 2 つの `toEqual` を次にする。

```ts
expect(createJournalPageData(entryA, { [entryA.date]: [entryA] })).toEqual({
  todayEntry: entryA,
  titleInput: "",
  contentInput: "",
  dateInput: null,
  recentEntries: [entryB, entryA],
});
```

```ts
it("cancel 時のフォーム入力を空に戻し、日付を未操作（null）に戻す", () => {
  expect(resetJournalFormInputs()).toEqual({
    titleInput: "",
    contentInput: "",
    dateInput: null,
  });
});
```

`src/features/journal/__tests__/pageStateActions.test.ts` の「today entry から page data を生成する」「cancel 時のフォーム入力を空に戻す」の `toEqual` に `dateInput: null` を足す（`contentInput: ""` の次の行）。同じファイルの `saveJournalEntryAndReload` の 2 つの呼び出しは 2a-4 の Step 1 で直す。

`src/features/journal/__tests__/journalViewStateData.test.ts` の `createJournalPageData` のモックの返り値（2 か所）と、2 つの `toEqual` の期待値のすべてに `dateInput: null,` を足す（`contentInput: "",` の次の行）。

`src/features/journal/__tests__/journalFormViewState.test.ts` を次の内容に置き換える。

```ts
jest.mock("../journalPageDataActions", () => ({
  resetJournalFormInputs: jest.fn(),
}));

import { resetJournalFormInputs } from "../journalPageDataActions";
import {
  createCanceledJournalFormState,
  createEditingJournalFormState,
  createOpenedJournalFormState,
} from "../journalFormViewState";

describe("journalFormViewState", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (resetJournalFormInputs as jest.Mock).mockReturnValue({
      titleInput: "",
      contentInput: "",
      dateInput: null,
    });
  });

  it("cancel 時の form state を生成する（日付は未操作に戻す）", () => {
    expect(createCanceledJournalFormState()).toEqual({
      titleInput: "",
      contentInput: "",
      dateInput: null,
      showForm: false,
    });
    expect(resetJournalFormInputs).toHaveBeenCalledWith();
  });

  it("open 時の form state を生成する", () => {
    expect(createOpenedJournalFormState()).toEqual({
      showForm: true,
    });
  });

  it("editing 時の form state をエントリで初期化する（日付はエントリの日付）", () => {
    const entry = {
      id: "j1",
      date: "2026-01-01",
      title: "My Title",
      content: "My Content",
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    };
    expect(createEditingJournalFormState(entry)).toEqual({
      titleInput: "My Title",
      contentInput: "My Content",
      dateInput: "2026-01-01",
      editingEntry: entry,
      showForm: true,
    });
  });
});
```

`src/features/journal/__tests__/useJournalPageInputState.test.tsx` を次の内容に置き換える。

```tsx
import { act, renderHook } from "@testing-library/react";
import { useJournalPageInputState } from "../useJournalPageInputState";

describe("useJournalPageInputState", () => {
  it("title/content/date input を独立して保持する", () => {
    const { result } = renderHook(() =>
      useJournalPageInputState({
        titleInput: "初期タイトル",
        contentInput: "初期本文",
        dateInput: null,
      }),
    );

    expect(result.current.titleInput).toBe("初期タイトル");
    expect(result.current.contentInput).toBe("初期本文");
    expect(result.current.dateInput).toBeNull();

    act(() => {
      result.current.setTitleInput("更新タイトル");
      result.current.setContentInput("更新本文");
      result.current.setDateInput("2026-03-10");
    });

    expect(result.current.titleInput).toBe("更新タイトル");
    expect(result.current.contentInput).toBe("更新本文");
    expect(result.current.dateInput).toBe("2026-03-10");

    act(() => {
      result.current.setDateInput("");
    });

    // 空にした値は null（未操作）と区別して保持する
    expect(result.current.dateInput).toBe("");
  });
});
```

`src/features/journal/__tests__/useJournalPageDataState.test.tsx` の `initialState` に `dateInput: null,` を足す（`contentInput: "",` の次の行）。

- [ ] **Step 2: 落ちることを確かめる**

Run: `npm test -- src/features/journal/__tests__/journalPageDataActions.test.ts src/features/journal/__tests__/pageStateActions.test.ts src/features/journal/__tests__/journalViewStateData.test.ts src/features/journal/__tests__/journalFormViewState.test.ts src/features/journal/__tests__/useJournalPageInputState.test.tsx --testPathIgnorePatterns=/node_modules/ /firebase-functions/lib/ /e2e/`
Expected: FAIL。`dateInput` が無い差分（`journalPageDataActions`・`pageStateActions`・`journalViewStateData`・`journalFormViewState` の editing）と `result.current.setDateInput is not a function`（`useJournalPageInputState`）。

- [ ] **Step 3: 入力 state を実装する**

`src/features/journal/journalPageDataActions.ts` を次の内容に置き換える。

```ts
import type { JournalEntry, JournalHistory } from "@/types/routine";
export { getRecentJournalEntries } from "./journalRecentEntries";
import { getRecentJournalEntries } from "./journalRecentEntries";

type JournalPageData = {
  todayEntry: JournalEntry | null;
  titleInput: string;
  contentInput: string;
  /**
   * 日付の入力。null は未操作（新規は今日、編集は編集前の日付に従う）、
   * "" は利用者が空にした、YYYY-MM-DD は選んだ値
   */
  dateInput: string | null;
  recentEntries: JournalEntry[];
};

export const createJournalPageData = (
  todayEntry: JournalEntry | null,
  history: JournalHistory,
): JournalPageData => {
  return {
    todayEntry,
    titleInput: "",
    contentInput: "",
    dateInput: null,
    recentEntries: getRecentJournalEntries(history),
  };
};

export const resetJournalFormInputs = (): Pick<
  JournalPageData,
  "titleInput" | "contentInput" | "dateInput"
> => {
  return {
    titleInput: "",
    contentInput: "",
    dateInput: null,
  };
};
```

`src/features/journal/journalViewStateData.ts` を次の内容に置き換える。

```ts
import type { JournalEntry, JournalHistory } from "@/types/routine";
import { createJournalPageData } from "./journalPageDataActions";

export type JournalViewState = {
  todayEntry: JournalEntry | null;
  titleInput: string;
  contentInput: string;
  dateInput: string | null;
  recentEntries: JournalEntry[];
  showForm: boolean;
};

export const createInitialJournalViewState = (
  todayEntry: JournalEntry | null,
  history: JournalHistory,
): JournalViewState => {
  const pageData = createJournalPageData(todayEntry, history);

  return {
    todayEntry: pageData.todayEntry,
    titleInput: pageData.titleInput,
    contentInput: pageData.contentInput,
    dateInput: pageData.dateInput,
    recentEntries: pageData.recentEntries,
    showForm: false,
  };
};

export const createReloadedJournalViewState = (
  todayEntry: JournalEntry | null,
  history: JournalHistory,
): Omit<JournalViewState, "showForm"> => {
  const pageData = createJournalPageData(todayEntry, history);

  return {
    todayEntry: pageData.todayEntry,
    titleInput: pageData.titleInput,
    contentInput: pageData.contentInput,
    dateInput: pageData.dateInput,
    recentEntries: pageData.recentEntries,
  };
};
```

`src/features/journal/journalFormViewState.ts` の `createEditingJournalFormState` を次にする（他の関数は変えない。`createCanceledJournalFormState` は `resetJournalFormInputs()` を展開しているので `dateInput: null` が入る）。

```ts
export const createEditingJournalFormState = (entry: JournalEntry) => {
  return {
    titleInput: entry.title,
    contentInput: entry.content,
    dateInput: entry.date,
    editingEntry: entry,
    showForm: true,
  };
};
```

`src/features/journal/useJournalPageInputState.ts` を次の内容に置き換える。

```ts
import { useState } from "react";
import type { JournalViewState } from "./journalViewStateActions";

type JournalPageInputInitialState = Pick<
  JournalViewState,
  "titleInput" | "contentInput" | "dateInput"
>;

export const useJournalPageInputState = (
  initialState: JournalPageInputInitialState,
) => {
  const [titleInput, setTitleInput] = useState(initialState.titleInput);
  const [contentInput, setContentInput] = useState(initialState.contentInput);
  // null（未操作）・""（空にした）・YYYY-MM-DD（選んだ値）を 1 つの state で表す
  const [dateInput, setDateInput] = useState<string | null>(
    initialState.dateInput,
  );

  return {
    contentInput,
    dateInput,
    setContentInput,
    setDateInput,
    setTitleInput,
    titleInput,
  };
};
```

- [ ] **Step 4: 通ることを確かめる**

Run: Step 2 と同じコマンド。
Expected: `journalPageDataActions`・`journalViewStateData`・`journalFormViewState`・`useJournalPageInputState` が PASS。`pageStateActions.test.ts` は `saveJournalEntryAndReload` の 2 件以外が PASS（その 2 件は 2a-4 で直すまで今のまま通る）。

### 2a-2: フォームのリセットと UI 用ハンドラ（最初の変更で日付を固定する）

- [ ] **Step 5: フォームの処理の失敗するテストを書く**

`src/features/journal/__tests__/journalPageFormActions.test.ts` を次の内容に置き換える。

```ts
import type { JournalEntry } from "@/types/routine";
import {
  createCancelJournalFormHandler,
  createJournalInputChangeHandlers,
  createOpenEditJournalFormAction,
  createOpenJournalFormAction,
} from "../journalPageFormActions";
import {
  createCanceledJournalFormState,
  createEditingJournalFormState,
  createOpenedJournalFormState,
} from "../journalViewStateActions";

jest.mock("../journalViewStateActions", () => ({
  createCanceledJournalFormState: jest.fn(),
  createEditingJournalFormState: jest.fn(),
  createOpenedJournalFormState: jest.fn(),
}));

const createSetters = () => ({
  setTitleInput: jest.fn(),
  setContentInput: jest.fn(),
  setDateInput: jest.fn(),
  setShowForm: jest.fn(),
  setEditingEntry: jest.fn(),
});

describe("journalPageFormActions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("cancel handler がフォーム入力を空に戻し、日付を null に戻し、editingEntry をクリアする", () => {
    const setters = createSetters();
    (createCanceledJournalFormState as jest.Mock).mockReturnValue({
      titleInput: "",
      contentInput: "",
      dateInput: null,
      showForm: false,
    });

    createCancelJournalFormHandler(setters)();

    expect(createCanceledJournalFormState).toHaveBeenCalledWith();
    expect(setters.setTitleInput).toHaveBeenCalledWith("");
    expect(setters.setContentInput).toHaveBeenCalledWith("");
    expect(setters.setDateInput).toHaveBeenCalledWith(null);
    expect(setters.setShowForm).toHaveBeenCalledWith(false);
    expect(setters.setEditingEntry).toHaveBeenCalledWith(null);
  });

  it("open action がフォームを開き、入力・日付・editingEntry をリセットする", () => {
    const setters = createSetters();
    (createCanceledJournalFormState as jest.Mock).mockReturnValue({
      titleInput: "",
      contentInput: "",
      dateInput: null,
      showForm: false,
    });
    (createOpenedJournalFormState as jest.Mock).mockReturnValue({
      showForm: true,
    });

    createOpenJournalFormAction(setters)();

    expect(createCanceledJournalFormState).toHaveBeenCalled();
    expect(createOpenedJournalFormState).toHaveBeenCalled();
    expect(setters.setTitleInput).toHaveBeenCalledWith("");
    expect(setters.setContentInput).toHaveBeenCalledWith("");
    expect(setters.setDateInput).toHaveBeenCalledWith(null);
    expect(setters.setEditingEntry).toHaveBeenCalledWith(null);
    expect(setters.setShowForm).toHaveBeenCalledWith(true);
  });

  it("openEdit action がエントリの内容と日付でフォームを初期化する", () => {
    const setters = createSetters();
    const entry = {
      id: "j1",
      date: "2026-01-01",
      title: "My Title",
      content: "My Content",
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    };
    (createEditingJournalFormState as jest.Mock).mockReturnValue({
      titleInput: "My Title",
      contentInput: "My Content",
      dateInput: "2026-01-01",
      editingEntry: entry,
      showForm: true,
    });

    createOpenEditJournalFormAction(setters)(entry);

    expect(createEditingJournalFormState).toHaveBeenCalledWith(entry);
    expect(setters.setTitleInput).toHaveBeenCalledWith("My Title");
    expect(setters.setContentInput).toHaveBeenCalledWith("My Content");
    expect(setters.setDateInput).toHaveBeenCalledWith("2026-01-01");
    expect(setters.setEditingEntry).toHaveBeenCalledWith(entry);
    expect(setters.setShowForm).toHaveBeenCalledWith(true);
  });
});

describe("createJournalInputChangeHandlers", () => {
  const pastEntry: JournalEntry = {
    id: "past",
    date: "2026-03-10",
    title: "過去",
    content: "本文",
    createdAt: "2026-03-10T10:00:00.000Z",
    updatedAt: "2026-03-10T10:00:00.000Z",
  };

  const setup = (editingEntry: JournalEntry | null) => {
    const setTitleInput = jest.fn();
    const setContentInput = jest.fn();
    const setDateInput = jest.fn();
    const getToday = jest.fn(() => "2026-03-15");
    const handlers = createJournalInputChangeHandlers({
      editingEntry,
      getToday,
      setTitleInput,
      setContentInput,
      setDateInput,
    });
    return { handlers, setTitleInput, setContentInput, setDateInput, getToday };
  };

  // setDateInput に渡された関数更新を、前の値に適用した結果を返す
  const applyDateUpdate = (setDateInput: jest.Mock, prev: string | null) => {
    const updater = setDateInput.mock.calls[0][0] as (
      value: string | null,
    ) => string | null;
    return updater(prev);
  };

  it("新規のタイトル入力は、未操作（null）なら今日で日付を固定し、タイトルを入れる", () => {
    const { handlers, setTitleInput, setDateInput, getToday } = setup(null);

    handlers.handleTitleChange("タイトル");

    expect(setTitleInput).toHaveBeenCalledWith("タイトル");
    expect(getToday).toHaveBeenCalledTimes(1);
    expect(applyDateUpdate(setDateInput, null)).toBe("2026-03-15");
  });

  it("新規の本文入力も、未操作（null）なら今日で日付を固定し、本文を入れる", () => {
    const { handlers, setContentInput, setDateInput } = setup(null);

    handlers.handleContentChange("本文");

    expect(setContentInput).toHaveBeenCalledWith("本文");
    expect(applyDateUpdate(setDateInput, null)).toBe("2026-03-15");
  });

  it("既に日付がある（固定済み・選んだ値・空にした値）なら上書きしない", () => {
    const { handlers, setDateInput } = setup(null);

    handlers.handleContentChange("本文");

    expect(applyDateUpdate(setDateInput, "2026-03-01")).toBe("2026-03-01");
    expect(applyDateUpdate(setDateInput, "")).toBe("");
  });

  it("編集はエントリの日付で固定し、今日を取らない（null に戻っていても今日にしない）", () => {
    const { handlers, setDateInput, getToday } = setup(pastEntry);

    handlers.handleTitleChange("直したタイトル");

    expect(getToday).not.toHaveBeenCalled();
    expect(applyDateUpdate(setDateInput, null)).toBe("2026-03-10");
  });

  it("日付欄の変更は固定せず、選んだ値（空を含む）をそのまま入れる", () => {
    const { handlers, setDateInput, setTitleInput, getToday } = setup(null);

    handlers.handleDateChange("2026-03-01");
    handlers.handleDateChange("");

    expect(setDateInput).toHaveBeenNthCalledWith(1, "2026-03-01");
    expect(setDateInput).toHaveBeenNthCalledWith(2, "");
    expect(getToday).not.toHaveBeenCalled();
    expect(setTitleInput).not.toHaveBeenCalled();
  });
});
```

`src/features/journal/__tests__/useJournalPageFormActions.test.tsx` を次の内容に置き換える。

```tsx
import { renderHook } from "@testing-library/react";

jest.mock("../journalPageFormActions", () => ({
  createCancelJournalFormHandler: jest.fn(),
  createOpenJournalFormAction: jest.fn(),
  createOpenEditJournalFormAction: jest.fn(),
}));

import {
  createCancelJournalFormHandler,
  createOpenJournalFormAction,
  createOpenEditJournalFormAction,
} from "../journalPageFormActions";
import { useJournalPageFormActions } from "../useJournalPageFormActions";

describe("useJournalPageFormActions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("journal form action を組み立てる（日付のセッターも渡す）", () => {
    const handleCancelForm = jest.fn();
    const openForm = jest.fn();
    const openEditForm = jest.fn();
    const params = {
      setTitleInput: jest.fn(),
      setContentInput: jest.fn(),
      setDateInput: jest.fn(),
      setShowForm: jest.fn(),
      setEditingEntry: jest.fn(),
    };

    (createCancelJournalFormHandler as jest.Mock).mockReturnValue(
      handleCancelForm,
    );
    (createOpenJournalFormAction as jest.Mock).mockReturnValue(openForm);
    (createOpenEditJournalFormAction as jest.Mock).mockReturnValue(
      openEditForm,
    );

    const { result } = renderHook(() => useJournalPageFormActions(params));

    expect(createCancelJournalFormHandler).toHaveBeenCalledWith(params);
    expect(createOpenJournalFormAction).toHaveBeenCalledWith(params);
    expect(createOpenEditJournalFormAction).toHaveBeenCalledWith(params);
    expect(result.current).toEqual({
      handleCancelForm,
      openForm,
      openEditForm,
    });
  });
});
```

`src/features/journal/__tests__/useJournalPageFormState.test.tsx` を次の内容に置き換える。

```tsx
import { renderHook } from "@testing-library/react";

jest.mock("../journalPageFormStateResult", () => ({
  createJournalPageFormStateResult: jest.fn(),
}));

jest.mock("../useJournalPageInputState", () => ({
  useJournalPageInputState: jest.fn(),
}));

jest.mock("../useJournalPageFormVisibilityState", () => ({
  useJournalPageFormVisibilityState: jest.fn(),
}));

jest.mock("../useJournalPageFormActions", () => ({
  useJournalPageFormActions: jest.fn(),
}));

import { createJournalPageFormStateResult } from "../journalPageFormStateResult";
import { useJournalPageFormActions } from "../useJournalPageFormActions";
import { useJournalPageInputState } from "../useJournalPageInputState";
import { useJournalPageFormVisibilityState } from "../useJournalPageFormVisibilityState";
import { useJournalPageFormState } from "../useJournalPageFormState";

describe("useJournalPageFormState", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("input/visibility/action hook と UI 用ハンドラを compose する", () => {
    const inputState = {
      titleInput: "",
      contentInput: "",
      dateInput: null,
      setTitleInput: jest.fn(),
      setContentInput: jest.fn(),
      setDateInput: jest.fn(),
    };
    const visibilityState = {
      showForm: false,
      setShowForm: jest.fn(),
    };
    const actions = {
      handleCancelForm: jest.fn(),
      openForm: jest.fn(),
      openEditForm: jest.fn(),
    };
    (useJournalPageInputState as jest.Mock).mockReturnValue(inputState);
    (useJournalPageFormVisibilityState as jest.Mock).mockReturnValue(
      visibilityState,
    );
    (useJournalPageFormActions as jest.Mock).mockReturnValue(actions);
    const resultState = { composed: true };
    (createJournalPageFormStateResult as jest.Mock).mockReturnValue(
      resultState,
    );
    const initialState = {
      titleInput: "",
      contentInput: "",
      dateInput: null,
      showForm: false,
    };

    const { result } = renderHook(() => useJournalPageFormState(initialState));

    expect(useJournalPageInputState).toHaveBeenCalledWith(initialState);
    expect(useJournalPageFormVisibilityState).toHaveBeenCalledWith(
      initialState,
    );
    expect(useJournalPageFormActions).toHaveBeenCalledWith({
      setTitleInput: inputState.setTitleInput,
      setContentInput: inputState.setContentInput,
      setDateInput: inputState.setDateInput,
      setShowForm: visibilityState.setShowForm,
      setEditingEntry: expect.any(Function),
    });
    expect(createJournalPageFormStateResult).toHaveBeenCalledWith({
      inputState,
      visibilityState,
      editingEntry: null,
      setEditingEntry: expect.any(Function),
      handleCancelForm: actions.handleCancelForm,
      openForm: actions.openForm,
      openEditForm: actions.openEditForm,
      handleTitleChange: expect.any(Function),
      handleContentChange: expect.any(Function),
      handleDateChange: expect.any(Function),
    });
    expect(result.current).toBe(resultState);

    // UI 用ハンドラが入力 state のセッターにつながっている
    const args = (createJournalPageFormStateResult as jest.Mock).mock
      .calls[0][0] as {
      handleTitleChange: (value: string) => void;
      handleContentChange: (value: string) => void;
      handleDateChange: (value: string) => void;
    };
    args.handleTitleChange("タイトル");
    args.handleContentChange("本文");
    args.handleDateChange("2026-03-01");
    expect(inputState.setTitleInput).toHaveBeenCalledWith("タイトル");
    expect(inputState.setContentInput).toHaveBeenCalledWith("本文");
    expect(inputState.setDateInput).toHaveBeenCalledWith("2026-03-01");
  });
});
```

`src/features/journal/__tests__/journalPageFormStateResult.test.ts` を次の内容に置き換える。

```ts
import { createJournalPageFormStateResult } from "../journalPageFormStateResult";

describe("createJournalPageFormStateResult", () => {
  it("input と visibility と form actions と UI 用ハンドラの公開 shape をまとめて返す", () => {
    const inputState = {
      titleInput: "Diary",
      contentInput: "Today was good",
      dateInput: "2026-03-10",
      setTitleInput: jest.fn(),
      setContentInput: jest.fn(),
      setDateInput: jest.fn(),
    };
    const visibilityState = {
      showForm: true,
      setShowForm: jest.fn(),
    };
    const handleCancelForm = jest.fn();
    const openForm = jest.fn();
    const openEditForm = jest.fn();
    const setEditingEntry = jest.fn();
    const handleTitleChange = jest.fn();
    const handleContentChange = jest.fn();
    const handleDateChange = jest.fn();
    const editingEntry = null;

    const result = createJournalPageFormStateResult({
      inputState,
      visibilityState,
      editingEntry,
      setEditingEntry,
      handleCancelForm,
      openForm,
      openEditForm,
      handleTitleChange,
      handleContentChange,
      handleDateChange,
    });

    expect(result).toEqual({
      contentInput: "Today was good",
      dateInput: "2026-03-10",
      showForm: true,
      titleInput: "Diary",
      editingEntry,
      setEditingEntry,
      handleCancelForm,
      openForm,
      openEditForm,
      handleTitleChange,
      handleContentChange,
      handleDateChange,
      setContentInput: inputState.setContentInput,
      setDateInput: inputState.setDateInput,
      setShowForm: visibilityState.setShowForm,
      setTitleInput: inputState.setTitleInput,
    });
  });
});
```

新しいファイル `src/features/journal/__tests__/useJournalPageFormState.dateLock.test.tsx` を作る（モックを使わず、実物のフックで固定とリセットを確かめる）。

```tsx
import { act, renderHook } from "@testing-library/react";
import type { JournalEntry } from "@/types/routine";
import { useJournalPageFormState } from "../useJournalPageFormState";

const pastEntry: JournalEntry = {
  id: "past",
  date: "2026-03-10",
  title: "過去のタイトル",
  content: "過去の本文",
  createdAt: "2026-03-10T10:00:00.000Z",
  updatedAt: "2026-03-10T10:00:00.000Z",
};

const initialState = {
  titleInput: "",
  contentInput: "",
  dateInput: null,
  showForm: false,
};

describe("useJournalPageFormState の日付の固定", () => {
  afterEach(() => {
    jest.useRealTimers();
  });

  it("新規は最初のタイトル入力の時点の今日で固定し、日をまたいでも変えない", () => {
    jest.useFakeTimers().setSystemTime(new Date("2026-03-15T23:59:00+09:00"));
    const { result } = renderHook(() => useJournalPageFormState(initialState));

    act(() => {
      result.current.openForm();
    });
    expect(result.current.dateInput).toBeNull();

    act(() => {
      result.current.handleTitleChange("夜のメモ");
    });
    expect(result.current.dateInput).toBe("2026-03-15");

    jest.setSystemTime(new Date("2026-03-16T00:01:00+09:00"));
    act(() => {
      result.current.handleContentChange("日をまたいだ");
    });
    expect(result.current.dateInput).toBe("2026-03-15");
    expect(result.current.titleInput).toBe("夜のメモ");
    expect(result.current.contentInput).toBe("日をまたいだ");
  });

  it("新規で最初の変更が日付欄なら、選んだ値で固定する（今日にならない）", () => {
    jest.useFakeTimers().setSystemTime(new Date("2026-03-15T12:00:00+09:00"));
    const { result } = renderHook(() => useJournalPageFormState(initialState));

    act(() => {
      result.current.openForm();
      result.current.handleDateChange("2026-03-10");
    });
    act(() => {
      result.current.handleTitleChange("十日の記録");
    });

    expect(result.current.dateInput).toBe("2026-03-10");
  });

  it("日付欄を空にした値はそのまま入り、その後の入力で今日に戻らない", () => {
    jest.useFakeTimers().setSystemTime(new Date("2026-03-15T12:00:00+09:00"));
    const { result } = renderHook(() => useJournalPageFormState(initialState));

    act(() => {
      result.current.openForm();
      result.current.handleTitleChange("タイトル");
    });
    act(() => {
      result.current.handleDateChange("");
    });
    act(() => {
      result.current.handleContentChange("本文");
    });

    expect(result.current.dateInput).toBe("");
  });

  it("フォームを開く・閉じるリセットは日付を固定しない（null に戻す）", () => {
    jest.useFakeTimers().setSystemTime(new Date("2026-03-15T12:00:00+09:00"));
    const { result } = renderHook(() => useJournalPageFormState(initialState));

    act(() => {
      result.current.openForm();
      result.current.handleTitleChange("タイトル");
    });
    expect(result.current.dateInput).toBe("2026-03-15");

    act(() => {
      result.current.handleCancelForm();
    });
    expect(result.current.dateInput).toBeNull();
    expect(result.current.titleInput).toBe("");

    act(() => {
      result.current.openForm();
    });
    expect(result.current.dateInput).toBeNull();
  });

  it("編集はエントリの日付を入れ、再読み込みで null に戻っても次の入力でエントリの日付に戻す", () => {
    jest.useFakeTimers().setSystemTime(new Date("2026-03-15T12:00:00+09:00"));
    const { result } = renderHook(() => useJournalPageFormState(initialState));

    act(() => {
      result.current.openEditForm(pastEntry);
    });
    expect(result.current.dateInput).toBe("2026-03-10");

    // 再読み込み（createLoadJournalDataAction）と同じく素のセッターで戻す
    act(() => {
      result.current.setTitleInput("");
      result.current.setContentInput("");
      result.current.setDateInput(null);
    });
    expect(result.current.dateInput).toBeNull();
    expect(result.current.editingEntry).toBe(pastEntry);

    act(() => {
      result.current.handleContentChange("打ち直した本文");
    });
    expect(result.current.dateInput).toBe("2026-03-10");
  });
});
```

- [ ] **Step 6: 落ちることを確かめる**

Run: `npm test -- src/features/journal/__tests__/journalPageFormActions.test.ts src/features/journal/__tests__/useJournalPageFormActions.test.tsx src/features/journal/__tests__/useJournalPageFormState.test.tsx src/features/journal/__tests__/journalPageFormStateResult.test.ts src/features/journal/__tests__/useJournalPageFormState.dateLock.test.tsx --testPathIgnorePatterns=/node_modules/ /firebase-functions/lib/ /e2e/`
Expected: FAIL。`createJournalInputChangeHandlers is not a function`、`setDateInput` が呼ばれない、`handleTitleChange` などが結果に無い（`result.current.handleTitleChange is not a function`）。

- [ ] **Step 7: フォームの処理を実装する**

`src/features/journal/journalPageFormActions.ts` を次の内容に置き換える。

```ts
import type { Dispatch, SetStateAction } from "react";
import type { JournalEntry } from "@/types/routine";
import {
  createCanceledJournalFormState,
  createEditingJournalFormState,
  createOpenedJournalFormState,
} from "./journalViewStateActions";

type SetValue<T> = Dispatch<SetStateAction<T>>;

type JournalFormSetters = {
  setTitleInput: SetValue<string>;
  setContentInput: SetValue<string>;
  setDateInput: SetValue<string | null>;
  setShowForm: SetValue<boolean>;
  setEditingEntry: SetValue<JournalEntry | null>;
};

export const createCancelJournalFormHandler = (params: JournalFormSetters) => {
  const {
    setTitleInput,
    setContentInput,
    setDateInput,
    setShowForm,
    setEditingEntry,
  } = params;

  return () => {
    const resetInputs = createCanceledJournalFormState();
    setTitleInput(resetInputs.titleInput);
    setContentInput(resetInputs.contentInput);
    setDateInput(resetInputs.dateInput);
    setShowForm(resetInputs.showForm);
    setEditingEntry(null);
  };
};

export const createOpenJournalFormAction = (params: JournalFormSetters) => {
  const {
    setTitleInput,
    setContentInput,
    setDateInput,
    setShowForm,
    setEditingEntry,
  } = params;

  return () => {
    const resetState = createCanceledJournalFormState();
    setTitleInput(resetState.titleInput);
    setContentInput(resetState.contentInput);
    setDateInput(resetState.dateInput);
    setEditingEntry(null);
    setShowForm(createOpenedJournalFormState().showForm);
  };
};

export const createOpenEditJournalFormAction = (params: JournalFormSetters) => {
  const {
    setTitleInput,
    setContentInput,
    setDateInput,
    setShowForm,
    setEditingEntry,
  } = params;

  return (entry: JournalEntry) => {
    const state = createEditingJournalFormState(entry);
    setTitleInput(state.titleInput);
    setContentInput(state.contentInput);
    setDateInput(state.dateInput);
    setEditingEntry(state.editingEntry);
    setShowForm(state.showForm);
  };
};

/**
 * UI からの入力を受けるハンドラ。タイトル・本文の最初の変更で日付を固定する
 * （新規はその時点の今日、編集は編集対象のエントリの日付）。
 * フォームを開く・閉じる・保存・再読み込みのリセットは素のセッターで行い、固定を起こさない。
 */
export const createJournalInputChangeHandlers = (params: {
  editingEntry: JournalEntry | null;
  getToday: () => string;
  setTitleInput: SetValue<string>;
  setContentInput: SetValue<string>;
  setDateInput: SetValue<string | null>;
}) => {
  const {
    editingEntry,
    getToday,
    setTitleInput,
    setContentInput,
    setDateInput,
  } = params;

  const lockDate = () => {
    // 固定する日付は関数更新の外で 1 回だけ取る（StrictMode の二重実行でも揺れない）
    const lockedDate = editingEntry?.date ?? getToday();
    setDateInput((prev) => prev ?? lockedDate);
  };

  return {
    handleTitleChange: (value: string) => {
      lockDate();
      setTitleInput(value);
    },
    handleContentChange: (value: string) => {
      lockDate();
      setContentInput(value);
    },
    // 日付欄の変更はそれ自体が最初の変更。選んだ値（"" を含む）をそのまま入れる
    handleDateChange: (value: string) => {
      setDateInput(value);
    },
  };
};
```

`src/features/journal/useJournalPageFormActions.ts` を次の内容に置き換える。

```ts
import type { Dispatch, SetStateAction } from "react";
import type { JournalEntry } from "@/types/routine";
import {
  createCancelJournalFormHandler,
  createOpenEditJournalFormAction,
  createOpenJournalFormAction,
} from "./journalPageFormActions";

type UseJournalPageFormActionsArgs = {
  setTitleInput: Dispatch<SetStateAction<string>>;
  setContentInput: Dispatch<SetStateAction<string>>;
  setDateInput: Dispatch<SetStateAction<string | null>>;
  setShowForm: Dispatch<SetStateAction<boolean>>;
  setEditingEntry: Dispatch<SetStateAction<JournalEntry | null>>;
};

export const useJournalPageFormActions = ({
  setTitleInput,
  setContentInput,
  setDateInput,
  setShowForm,
  setEditingEntry,
}: UseJournalPageFormActionsArgs) => {
  const setters = {
    setTitleInput,
    setContentInput,
    setDateInput,
    setShowForm,
    setEditingEntry,
  };

  return {
    handleCancelForm: createCancelJournalFormHandler(setters),
    openForm: createOpenJournalFormAction(setters),
    openEditForm: createOpenEditJournalFormAction(setters),
  };
};
```

`src/features/journal/journalPageFormStateResult.ts` を次の内容に置き換える。

```ts
import type { Dispatch, SetStateAction } from "react";
import type { JournalEntry } from "@/types/routine";
import type { useJournalPageFormVisibilityState } from "./useJournalPageFormVisibilityState";
import type { useJournalPageInputState } from "./useJournalPageInputState";

type JournalPageInputState = ReturnType<typeof useJournalPageInputState>;
type JournalPageFormVisibilityState = ReturnType<
  typeof useJournalPageFormVisibilityState
>;

type CreateJournalPageFormStateResultArgs = {
  inputState: JournalPageInputState;
  visibilityState: JournalPageFormVisibilityState;
  editingEntry: JournalEntry | null;
  setEditingEntry: Dispatch<SetStateAction<JournalEntry | null>>;
  handleCancelForm: () => void;
  openForm: () => void;
  openEditForm: (entry: JournalEntry) => void;
  handleTitleChange: (value: string) => void;
  handleContentChange: (value: string) => void;
  handleDateChange: (value: string) => void;
};

/**
 * フォームの state の公開 shape。UI には handle*Change を渡し、
 * 素のセッター（set*Input）は再読み込み・リセットの組み立てにだけ渡す。
 */
export const createJournalPageFormStateResult = ({
  inputState,
  visibilityState,
  editingEntry,
  setEditingEntry,
  handleCancelForm,
  openForm,
  openEditForm,
  handleTitleChange,
  handleContentChange,
  handleDateChange,
}: CreateJournalPageFormStateResultArgs) => {
  return {
    contentInput: inputState.contentInput,
    dateInput: inputState.dateInput,
    showForm: visibilityState.showForm,
    titleInput: inputState.titleInput,
    editingEntry,
    setEditingEntry,
    handleCancelForm,
    openForm,
    openEditForm,
    handleTitleChange,
    handleContentChange,
    handleDateChange,
    setContentInput: inputState.setContentInput,
    setDateInput: inputState.setDateInput,
    setShowForm: visibilityState.setShowForm,
    setTitleInput: inputState.setTitleInput,
  };
};
```

`src/features/journal/useJournalPageFormState.ts` を次の内容に置き換える。

```ts
import { useState } from "react";
import type { JournalEntry } from "@/types/routine";
import type { JournalViewState } from "./journalViewStateActions";
import { getTodayDateString } from "./utils/journalDate";
import { createJournalInputChangeHandlers } from "./journalPageFormActions";
import { useJournalPageFormVisibilityState } from "./useJournalPageFormVisibilityState";
import { useJournalPageFormActions } from "./useJournalPageFormActions";
import { useJournalPageInputState } from "./useJournalPageInputState";
import { createJournalPageFormStateResult } from "./journalPageFormStateResult";

type JournalFormInitialState = Pick<
  JournalViewState,
  "titleInput" | "contentInput" | "dateInput" | "showForm"
>;

export const useJournalPageFormState = (
  initialState: JournalFormInitialState,
) => {
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null);
  const inputState = useJournalPageInputState(initialState);
  const visibilityState = useJournalPageFormVisibilityState(initialState);
  const { handleCancelForm, openForm, openEditForm } =
    useJournalPageFormActions({
      setTitleInput: inputState.setTitleInput,
      setContentInput: inputState.setContentInput,
      setDateInput: inputState.setDateInput,
      setShowForm: visibilityState.setShowForm,
      setEditingEntry,
    });
  // 入力 state と editingEntry の両方を知るこの層で、UI 用ハンドラを作る
  const { handleTitleChange, handleContentChange, handleDateChange } =
    createJournalInputChangeHandlers({
      editingEntry,
      getToday: getTodayDateString,
      setTitleInput: inputState.setTitleInput,
      setContentInput: inputState.setContentInput,
      setDateInput: inputState.setDateInput,
    });

  return createJournalPageFormStateResult({
    inputState,
    visibilityState,
    editingEntry,
    setEditingEntry,
    handleCancelForm,
    openForm,
    openEditForm,
    handleTitleChange,
    handleContentChange,
    handleDateChange,
  });
};
```

- [ ] **Step 8: 通ることを確かめる**

Run: Step 6 と同じコマンド。
Expected: PASS（5 ファイル）。

### 2a-3: 再読み込みで `dateInput` を戻す

- [ ] **Step 9: 再読み込みの失敗するテストを書く**

`src/features/journal/__tests__/journalPageReloadActions.test.ts` を次の内容に置き換える。

```ts
import { createLoadJournalDataAction } from "../journalPageReloadActions";
import { createReloadedJournalViewState } from "../journalViewStateActions";
import { getJournalHistory, getTodayJournalEntry } from "../storage";

jest.mock("../journalViewStateActions", () => ({
  createReloadedJournalViewState: jest.fn(),
}));

jest.mock("../storage", () => ({
  getJournalHistory: jest.fn(),
  getTodayJournalEntry: jest.fn(),
}));

describe("journalPageReloadActions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("load action が storage と view state をつないで setter に反映する（日付は null に戻す）", () => {
    const todayEntry = {
      id: "today",
      date: "2024-01-12",
      title: "今日",
      content: "本文",
      createdAt: "2024-01-12T00:00:00.000Z",
      updatedAt: "2024-01-12T00:00:00.000Z",
    };
    const history = { [todayEntry.date]: [todayEntry] };
    const viewState = {
      todayEntry,
      titleInput: "",
      contentInput: "",
      dateInput: null,
      recentEntries: [todayEntry],
    };
    const setTodayEntry = jest.fn();
    const setTitleInput = jest.fn();
    const setContentInput = jest.fn();
    const setDateInput = jest.fn();
    const setRecentEntries = jest.fn();

    (getTodayJournalEntry as jest.Mock).mockReturnValue(todayEntry);
    (getJournalHistory as jest.Mock).mockReturnValue(history);
    (createReloadedJournalViewState as jest.Mock).mockReturnValue(viewState);

    createLoadJournalDataAction({
      setTodayEntry,
      setTitleInput,
      setContentInput,
      setDateInput,
      setRecentEntries,
    })();

    expect(createReloadedJournalViewState).toHaveBeenCalledWith(
      todayEntry,
      history,
    );
    expect(setTodayEntry).toHaveBeenCalledWith(todayEntry);
    expect(setTitleInput).toHaveBeenCalledWith("");
    expect(setContentInput).toHaveBeenCalledWith("");
    expect(setDateInput).toHaveBeenCalledWith(null);
    expect(setRecentEntries).toHaveBeenCalledWith([todayEntry]);
  });
});
```

`src/features/journal/__tests__/useJournalPageReloadAction.test.tsx` の `params` に `setDateInput: jest.fn(),` を足す（`setContentInput: jest.fn(),` の次の行）。`expect(createLoadJournalDataAction).toHaveBeenCalledWith(params);` はそのまま（`setDateInput` を含む `params` 全体で受け渡しを確かめる）。

`src/features/journal/__tests__/journalPageStateActions.test.ts` の「load action が storage と view state を…」を次のように直す: `viewState` に `dateInput: null,`、`const setDateInput = jest.fn();` を足し、`createLoadJournalDataAction({ … })` の引数に `setDateInput,`、期待に `expect(setDateInput).toHaveBeenCalledWith(null);` を足す。同じファイルの「cancel handler…」「open action…」は、`canceledState` に `dateInput: null,`、`const setDateInput = jest.fn();` と、呼び出しの引数に `setDateInput,`、期待に `expect(setDateInput).toHaveBeenCalledWith(null);` を足す。「save handler…」は 2a-4 の Step 13 で直す。

- [ ] **Step 10: 落ちることを確かめる**

Run: `npm test -- src/features/journal/__tests__/journalPageReloadActions.test.ts src/features/journal/__tests__/useJournalPageReloadAction.test.tsx src/features/journal/__tests__/journalPageStateActions.test.ts --testPathIgnorePatterns=/node_modules/ /firebase-functions/lib/ /e2e/`
Expected: FAIL。`journalPageReloadActions.test.ts` と `journalPageStateActions.test.ts` の load action が `setDateInput` 未呼び出しで落ちる。`useJournalPageReloadAction.test.tsx` は `toHaveBeenCalledWith(params)` の差分（`setDateInput` が渡らない）で落ちる。

- [ ] **Step 11: 再読み込みを実装する**

`src/features/journal/journalPageReloadActions.ts` を次の内容に置き換える。

```ts
import type { Dispatch, SetStateAction } from "react";
import type { JournalEntry } from "@/types/routine";
import { getJournalHistory, getTodayJournalEntry } from "./storage";
import { createReloadedJournalViewState } from "./journalViewStateActions";

type SetValue<T> = Dispatch<SetStateAction<T>>;

export const createLoadJournalDataAction = (params: {
  setTodayEntry: SetValue<JournalEntry | null>;
  setTitleInput: SetValue<string>;
  setContentInput: SetValue<string>;
  setDateInput: SetValue<string | null>;
  setRecentEntries: SetValue<JournalEntry[]>;
}) => {
  const {
    setTodayEntry,
    setTitleInput,
    setContentInput,
    setDateInput,
    setRecentEntries,
  } = params;

  return () => {
    const pageData = createReloadedJournalViewState(
      getTodayJournalEntry(),
      getJournalHistory(),
    );
    setTodayEntry(pageData.todayEntry);
    setTitleInput(pageData.titleInput);
    setContentInput(pageData.contentInput);
    setDateInput(pageData.dateInput);
    setRecentEntries(pageData.recentEntries);
  };
};
```

`src/features/journal/useJournalPageReloadAction.ts` を次の内容に置き換える。

```ts
import { useCallback } from "react";
import type { Dispatch, SetStateAction } from "react";
import type { JournalEntry } from "@/types/routine";
import { createJournalPageReloadActionResult } from "./journalPageReloadActionResult";
import { createLoadJournalDataAction } from "./journalPageReloadActions";

type SetValue<T> = Dispatch<SetStateAction<T>>;

type UseJournalPageReloadActionParams = {
  setTodayEntry: SetValue<JournalEntry | null>;
  setTitleInput: SetValue<string>;
  setContentInput: SetValue<string>;
  setDateInput: SetValue<string | null>;
  setRecentEntries: SetValue<JournalEntry[]>;
};

export const useJournalPageReloadAction = ({
  setTodayEntry,
  setTitleInput,
  setContentInput,
  setDateInput,
  setRecentEntries,
}: UseJournalPageReloadActionParams) => {
  const loadData = useCallback(() => {
    createLoadJournalDataAction({
      setTodayEntry,
      setTitleInput,
      setContentInput,
      setDateInput,
      setRecentEntries,
    })();
  }, [
    setContentInput,
    setDateInput,
    setRecentEntries,
    setTitleInput,
    setTodayEntry,
  ]);

  return createJournalPageReloadActionResult({ loadData });
};
```

- [ ] **Step 12: 通ることを確かめる**

Run: Step 10 と同じコマンド。
Expected: `journalPageReloadActions`・`useJournalPageReloadAction` が PASS。`journalPageStateActions.test.ts` は「save handler…」以外が PASS（「save handler…」は Step 13 で直すまで今のまま通る）。

### 2a-4: 保存・更新の処理へ日付を渡し、検証する

- [ ] **Step 13: 保存・更新の失敗するテストを書く**

`src/features/journal/__tests__/journalMutationActions.test.ts` を次の内容に置き換える。

```ts
import {
  deleteJournalEntryAndReload,
  saveJournalEntryAndReload,
  updateJournalEntryAndReload,
} from "../journalMutationActions";

const dateAlertMessages = {
  invalid: "日付を正しく入力してください",
  future: "未来の日付は保存できません",
};

describe("journalMutationActions", () => {
  describe("saveJournalEntryAndReload", () => {
    const baseArgs = {
      today: "2024-01-12",
      date: "2024-01-12",
      titleInput: "タイトル",
      contentInput: "本文",
      defaultTitle: "無題",
      alertMessage: "内容を入力してください",
      dateAlertMessages,
    };

    it("空入力なら保存せず alert する", () => {
      const alertFn = jest.fn();
      const saveEntry = jest.fn();

      const result = saveJournalEntryAndReload({
        ...baseArgs,
        titleInput: "  ",
        contentInput: "  ",
        saveEntry,
        reloadData: jest.fn(),
        closeForm: jest.fn(),
        alertFn,
      });

      expect(result).toBe(false);
      expect(alertFn).toHaveBeenCalledWith("内容を入力してください");
      expect(saveEntry).not.toHaveBeenCalled();
    });

    it("入力があれば、渡された日付で保存して再読込しフォームを閉じる", () => {
      const saveEntry = jest.fn();
      const reloadData = jest.fn();
      const closeForm = jest.fn();

      const result = saveJournalEntryAndReload({
        ...baseArgs,
        date: "2024-01-10",
        titleInput: "  ",
        contentInput: " memo ",
        saveEntry,
        reloadData,
        closeForm,
      });

      expect(result).toBe(true);
      expect(saveEntry).toHaveBeenCalledWith("2024-01-10", "無題", "memo");
      expect(reloadData).toHaveBeenCalled();
      expect(closeForm).toHaveBeenCalled();
    });

    it("今日の日付は保存できる", () => {
      const saveEntry = jest.fn();

      const result = saveJournalEntryAndReload({
        ...baseArgs,
        saveEntry,
        reloadData: jest.fn(),
        closeForm: jest.fn(),
      });

      expect(result).toBe(true);
      expect(saveEntry).toHaveBeenCalledWith("2024-01-12", "タイトル", "本文");
    });

    it.each(["", "2024/01/10", "2024-02-30", "123456-01-01"])(
      "日付が空・不正（%s）なら保存せず、不正の文言で alert して入力を残す",
      (date) => {
        const alertFn = jest.fn();
        const saveEntry = jest.fn();
        const reloadData = jest.fn();
        const closeForm = jest.fn();

        const result = saveJournalEntryAndReload({
          ...baseArgs,
          date,
          saveEntry,
          reloadData,
          closeForm,
          alertFn,
        });

        expect(result).toBe(false);
        expect(alertFn).toHaveBeenCalledWith(dateAlertMessages.invalid);
        expect(saveEntry).not.toHaveBeenCalled();
        expect(reloadData).not.toHaveBeenCalled();
        expect(closeForm).not.toHaveBeenCalled();
      },
    );

    it("今日より後の日付なら保存せず、未来の文言で alert する", () => {
      const alertFn = jest.fn();
      const saveEntry = jest.fn();

      const result = saveJournalEntryAndReload({
        ...baseArgs,
        date: "2024-01-13",
        saveEntry,
        reloadData: jest.fn(),
        closeForm: jest.fn(),
        alertFn,
      });

      expect(result).toBe(false);
      expect(alertFn).toHaveBeenCalledWith(dateAlertMessages.future);
      expect(saveEntry).not.toHaveBeenCalled();
    });
  });

  describe("deleteJournalEntryAndReload", () => {
    it("削除確認で同意したときだけ削除して再読込する", () => {
      const deleteEntry = jest.fn();
      const reloadData = jest.fn();
      const confirmFn = jest.fn(() => true);

      expect(
        deleteJournalEntryAndReload({
          entryId: "entry-1",
          confirmMessage: "delete?",
          deleteEntry,
          reloadData,
          confirmFn,
        }),
      ).toBe(true);
      expect(deleteEntry).toHaveBeenCalledWith("entry-1");
      expect(reloadData).toHaveBeenCalled();
    });

    it("削除確認で拒否したときは何もしない", () => {
      const deleteEntry = jest.fn();
      const reloadData = jest.fn();

      expect(
        deleteJournalEntryAndReload({
          entryId: "entry-1",
          confirmMessage: "delete?",
          deleteEntry,
          reloadData,
          confirmFn: jest.fn(() => false),
        }),
      ).toBe(false);
      expect(deleteEntry).not.toHaveBeenCalled();
      expect(reloadData).not.toHaveBeenCalled();
    });
  });

  describe("updateJournalEntryAndReload", () => {
    const baseArgs = {
      entryId: "entry-1",
      originalDate: "2024-01-10",
      dateInput: null,
      today: "2024-01-12",
      titleInput: "タイトル",
      contentInput: "本文",
      defaultTitle: "無題",
      alertMessage: "内容を入力してください",
      dateAlertMessages,
    };

    it("entryId が空なら Error を投げる", () => {
      const updateEntry = jest.fn();

      expect(() =>
        updateJournalEntryAndReload({
          ...baseArgs,
          entryId: "",
          updateEntry,
          reloadData: jest.fn(),
          closeForm: jest.fn(),
        }),
      ).toThrow("updateJournalEntryAndReload: entryId is required");
      expect(updateEntry).not.toHaveBeenCalled();
    });

    it("空入力なら更新せず alert する", () => {
      const alertFn = jest.fn();
      const updateEntry = jest.fn();

      const result = updateJournalEntryAndReload({
        ...baseArgs,
        titleInput: "  ",
        contentInput: "  ",
        updateEntry,
        reloadData: jest.fn(),
        closeForm: jest.fn(),
        alertFn,
      });

      expect(result).toBe(false);
      expect(alertFn).toHaveBeenCalledWith("内容を入力してください");
      expect(updateEntry).not.toHaveBeenCalled();
    });

    it("日付を変えない（dateInput が null）なら、日付を渡さずに更新して再読込しフォームを閉じる", () => {
      const updateEntry = jest.fn();
      const reloadData = jest.fn();
      const closeForm = jest.fn();

      const result = updateJournalEntryAndReload({
        ...baseArgs,
        titleInput: "  ",
        contentInput: " 更新内容 ",
        updateEntry,
        reloadData,
        closeForm,
      });

      expect(result).toBe(true);
      expect(updateEntry).toHaveBeenCalledWith("entry-1", "無題", "更新内容");
      // 4 番目の引数（日付）を渡さない。undefined も明示しない
      expect(updateEntry.mock.calls[0]).toHaveLength(3);
      expect(reloadData).toHaveBeenCalled();
      expect(closeForm).toHaveBeenCalled();
    });

    it("dateInput が編集前の日付と同じなら、日付を渡さない", () => {
      const updateEntry = jest.fn();

      updateJournalEntryAndReload({
        ...baseArgs,
        dateInput: "2024-01-10",
        updateEntry,
        reloadData: jest.fn(),
        closeForm: jest.fn(),
      });

      expect(updateEntry.mock.calls[0]).toEqual([
        "entry-1",
        "タイトル",
        "本文",
      ]);
    });

    it("日付を変えたときは、検証に通れば日付を渡す", () => {
      const updateEntry = jest.fn();

      const result = updateJournalEntryAndReload({
        ...baseArgs,
        dateInput: "2024-01-05",
        updateEntry,
        reloadData: jest.fn(),
        closeForm: jest.fn(),
      });

      expect(result).toBe(true);
      expect(updateEntry).toHaveBeenCalledWith(
        "entry-1",
        "タイトル",
        "本文",
        "2024-01-05",
      );
    });

    it("日付を変えないときは検証しない（編集前が未来日でも、タイトルだけ直す保存が通る）", () => {
      const alertFn = jest.fn();
      const updateEntry = jest.fn();

      const result = updateJournalEntryAndReload({
        ...baseArgs,
        originalDate: "2099-12-31",
        dateInput: null,
        updateEntry,
        reloadData: jest.fn(),
        closeForm: jest.fn(),
        alertFn,
      });

      expect(result).toBe(true);
      expect(alertFn).not.toHaveBeenCalled();
      expect(updateEntry.mock.calls[0]).toEqual([
        "entry-1",
        "タイトル",
        "本文",
      ]);
    });

    it("日付を空にして更新すると、更新せず不正の文言で alert し、フォームを閉じない", () => {
      const alertFn = jest.fn();
      const updateEntry = jest.fn();
      const closeForm = jest.fn();

      const result = updateJournalEntryAndReload({
        ...baseArgs,
        dateInput: "",
        updateEntry,
        reloadData: jest.fn(),
        closeForm,
        alertFn,
      });

      expect(result).toBe(false);
      expect(alertFn).toHaveBeenCalledWith(dateAlertMessages.invalid);
      expect(updateEntry).not.toHaveBeenCalled();
      expect(closeForm).not.toHaveBeenCalled();
    });

    it("日付を未来に変えて更新すると、更新せず未来の文言で alert する", () => {
      const alertFn = jest.fn();
      const updateEntry = jest.fn();

      const result = updateJournalEntryAndReload({
        ...baseArgs,
        dateInput: "2024-01-13",
        updateEntry,
        reloadData: jest.fn(),
        closeForm: jest.fn(),
        alertFn,
      });

      expect(result).toBe(false);
      expect(alertFn).toHaveBeenCalledWith(dateAlertMessages.future);
      expect(updateEntry).not.toHaveBeenCalled();
    });
  });
});
```

`src/features/journal/__tests__/pageStateActions.test.ts` の `saveJournalEntryAndReload` の 2 つの呼び出し（「空入力なら保存せず alert する」「入力があれば保存して再読込しフォームを閉じる」）に、`today: "2024-01-12",` の次の行として `date: "2024-01-12",` を、`alertMessage: "内容を入力してください",` の次の行として `dateAlertMessages: { invalid: "日付を正しく入力してください", future: "未来の日付は保存できません" },` を足す。期待値（`saveEntry` が `"2024-01-12", "無題", "memo"` で呼ばれる）は変えない。

`src/features/journal/__tests__/journalPageMutationHandlers.test.ts` の「save handler…」「update handler…」の 2 つの `it` を、次の 4 つの `it` に置き換える（ファイルの先頭の import と `jest.mock`、「delete handler…」は変えない）。

```ts
const dateAlertMessages = {
  invalid: journalTexts.page.alertInvalidDate,
  future: journalTexts.page.alertFutureDate,
};

it("save handler は今日を 1 回だけ取り、未操作（null）なら今日を日付として保存処理を組み立てる", () => {
  const reloadData = jest.fn();
  const closeForm = jest.fn();
  const getToday = jest.fn(() => "2024-01-12");

  (saveJournalEntryAndReload as jest.Mock).mockReturnValue(true);

  const result = createSaveJournalEntryHandler({
    getToday,
    dateInput: null,
    titleInput: " タイトル ",
    contentInput: " 本文 ",
    reloadData,
    closeForm,
  })();

  expect(result).toBe(true);
  expect(getToday).toHaveBeenCalledTimes(1);
  expect(saveJournalEntryAndReload).toHaveBeenCalledWith({
    today: "2024-01-12",
    date: "2024-01-12",
    titleInput: " タイトル ",
    contentInput: " 本文 ",
    defaultTitle: journalTexts.page.defaultTitle,
    alertMessage: journalTexts.page.alertMissingContent,
    dateAlertMessages,
    saveEntry: saveJournalEntry,
    reloadData,
    closeForm,
  });
});

it("save handler は選んだ日付（固定済みの日付）を渡し、今日は未来の判定にだけ使う", () => {
  const getToday = jest.fn(() => "2024-01-12");

  createSaveJournalEntryHandler({
    getToday,
    dateInput: "2024-01-05",
    titleInput: "タイトル",
    contentInput: "本文",
    reloadData: jest.fn(),
    closeForm: jest.fn(),
  })();

  expect(saveJournalEntryAndReload).toHaveBeenCalledWith(
    expect.objectContaining({ today: "2024-01-12", date: "2024-01-05" }),
  );
});

it('save handler は空にした日付（""）を今日に置き換えない', () => {
  createSaveJournalEntryHandler({
    getToday: () => "2024-01-12",
    dateInput: "",
    titleInput: "タイトル",
    contentInput: "本文",
    reloadData: jest.fn(),
    closeForm: jest.fn(),
  })();

  expect(saveJournalEntryAndReload).toHaveBeenCalledWith(
    expect.objectContaining({ today: "2024-01-12", date: "" }),
  );
});

it("update handler は今日を 1 回だけ取り、編集前の日付と日付の入力を渡して更新処理を組み立てる", () => {
  const reloadData = jest.fn();
  const closeForm = jest.fn();
  const getToday = jest.fn(() => "2024-01-12");

  (updateJournalEntryAndReload as jest.Mock).mockReturnValue(true);

  const result = createUpdateJournalEntryHandler({
    entryId: "entry-1",
    originalDate: "2024-01-10",
    dateInput: "2024-01-05",
    getToday,
    titleInput: " タイトル ",
    contentInput: " 本文 ",
    reloadData,
    closeForm,
  })();

  expect(result).toBe(true);
  expect(getToday).toHaveBeenCalledTimes(1);
  expect(updateJournalEntryAndReload).toHaveBeenCalledWith({
    entryId: "entry-1",
    originalDate: "2024-01-10",
    dateInput: "2024-01-05",
    today: "2024-01-12",
    titleInput: " タイトル ",
    contentInput: " 本文 ",
    defaultTitle: journalTexts.page.defaultTitle,
    alertMessage: journalTexts.page.alertMissingContent,
    dateAlertMessages,
    updateEntry: updateJournalEntry,
    reloadData,
    closeForm,
  });
});
```

`src/features/journal/__tests__/journalPageStateActions.test.ts` の「save handler が既定文言と保存処理を組み立てる」を次の内容に置き換える。

```ts
it("save handler が既定文言と保存処理を組み立てる", () => {
  const reloadData = jest.fn();
  const closeForm = jest.fn();
  const getToday = jest.fn(() => "2024-01-12");

  (saveJournalEntryAndReload as jest.Mock).mockReturnValue(true);

  const result = createSaveJournalEntryHandler({
    getToday,
    dateInput: null,
    titleInput: " タイトル ",
    contentInput: " 本文 ",
    reloadData,
    closeForm,
  })();

  expect(result).toBe(true);
  expect(getToday).toHaveBeenCalledTimes(1);
  expect(saveJournalEntryAndReload).toHaveBeenCalledWith({
    today: "2024-01-12",
    date: "2024-01-12",
    titleInput: " タイトル ",
    contentInput: " 本文 ",
    defaultTitle: journalTexts.page.defaultTitle,
    alertMessage: journalTexts.page.alertMissingContent,
    dateAlertMessages: {
      invalid: journalTexts.page.alertInvalidDate,
      future: journalTexts.page.alertFutureDate,
    },
    saveEntry: saveJournalEntry,
    reloadData,
    closeForm,
  });
});
```

`src/features/journal/__tests__/useJournalSaveEntryAction.test.tsx` を次の内容に置き換える。

```tsx
import { act, renderHook } from "@testing-library/react";

jest.mock("../journalPageMutationHandlers", () => ({
  createSaveJournalEntryHandler: jest.fn(),
}));

import { createSaveJournalEntryHandler } from "../journalPageMutationHandlers";
import { useJournalSaveEntryAction } from "../useJournalSaveEntryAction";
import { getTodayDateString } from "../utils/journalDate";

describe("useJournalSaveEntryAction", () => {
  it("日付の入力と今日の取得関数を渡して save handler を組み立て、委譲する", () => {
    const saveAction = jest.fn();
    (createSaveJournalEntryHandler as jest.Mock).mockReturnValue(saveAction);
    const loadData = jest.fn();
    const setShowForm = jest.fn();

    const { result } = renderHook(() =>
      useJournalSaveEntryAction({
        titleInput: "タイトル",
        contentInput: "本文",
        dateInput: "2026-03-10",
        loadData,
        setShowForm,
      }),
    );

    act(() => {
      result.current();
    });

    expect(createSaveJournalEntryHandler).toHaveBeenCalledWith({
      getToday: getTodayDateString,
      dateInput: "2026-03-10",
      titleInput: "タイトル",
      contentInput: "本文",
      reloadData: loadData,
      closeForm: expect.any(Function),
    });
    expect(saveAction).toHaveBeenCalled();
  });
});
```

`src/features/journal/__tests__/useJournalUpdateEntryAction.test.tsx` を次の内容に置き換える。

```tsx
import { act, renderHook } from "@testing-library/react";

jest.mock("../journalPageMutationHandlers", () => ({
  createUpdateJournalEntryHandler: jest.fn(),
}));

import { createUpdateJournalEntryHandler } from "../journalPageMutationHandlers";
import { useJournalUpdateEntryAction } from "../useJournalUpdateEntryAction";
import { getTodayDateString } from "../utils/journalDate";

describe("useJournalUpdateEntryAction", () => {
  it("編集前の日付・日付の入力・今日の取得関数を渡して update handler を組み立て、委譲する", () => {
    const updateAction = jest.fn();
    (createUpdateJournalEntryHandler as jest.Mock).mockReturnValue(
      updateAction,
    );
    const loadData = jest.fn();
    const closeForm = jest.fn();

    const { result } = renderHook(() =>
      useJournalUpdateEntryAction({
        entryId: "entry-1",
        originalDate: "2026-03-10",
        dateInput: "2026-03-08",
        titleInput: "タイトル",
        contentInput: "本文",
        loadData,
        closeForm,
      }),
    );

    act(() => {
      result.current();
    });

    expect(createUpdateJournalEntryHandler).toHaveBeenCalledWith({
      entryId: "entry-1",
      originalDate: "2026-03-10",
      dateInput: "2026-03-08",
      getToday: getTodayDateString,
      titleInput: "タイトル",
      contentInput: "本文",
      reloadData: loadData,
      closeForm,
    });
    expect(updateAction).toHaveBeenCalled();
  });
});
```

`src/features/journal/__tests__/useJournalPageMutationActions.test.tsx` を次の内容に置き換える。

```tsx
jest.mock("../journalPageMutationActionsResult", () => ({
  createJournalPageMutationActionsResult: jest.fn(),
}));

jest.mock("../useJournalDeleteEntryAction", () => ({
  useJournalDeleteEntryAction: jest.fn(),
}));

jest.mock("../useJournalSaveEntryAction", () => ({
  useJournalSaveEntryAction: jest.fn(),
}));

jest.mock("../useJournalUpdateEntryAction", () => ({
  useJournalUpdateEntryAction: jest.fn(),
}));

import { act, renderHook } from "@testing-library/react";
import { useJournalDeleteEntryAction } from "../useJournalDeleteEntryAction";
import { createJournalPageMutationActionsResult } from "../journalPageMutationActionsResult";
import { useJournalPageMutationActions } from "../useJournalPageMutationActions";
import { useJournalSaveEntryAction } from "../useJournalSaveEntryAction";
import { useJournalUpdateEntryAction } from "../useJournalUpdateEntryAction";

const entry = {
  id: "entry-1",
  date: "2024-01-12",
  title: "t",
  content: "c",
  createdAt: "2024-01-12T00:00:00.000Z",
  updatedAt: "2024-01-12T00:00:00.000Z",
};

type BuiltActions = {
  handleDeleteEntry: (target: typeof entry) => void;
  handleSaveEntry: () => void;
  handleUpdateEntry: () => void;
};

describe("useJournalPageMutationActions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (createJournalPageMutationActionsResult as jest.Mock).mockImplementation(
      (value) => value,
    );
  });

  it("save/delete/update action hooks を compose する（日付の入力を保存と更新へ渡す）", () => {
    const deleteAction = jest.fn();
    const saveAction = jest.fn();
    const updateAction = jest.fn();
    const resultShape = {
      handleDeleteEntry: jest.fn(),
      handleSaveEntry: jest.fn(),
      handleUpdateEntry: jest.fn(),
      composed: true,
    };
    (useJournalDeleteEntryAction as jest.Mock).mockReturnValue(deleteAction);
    (useJournalSaveEntryAction as jest.Mock).mockReturnValue(saveAction);
    (useJournalUpdateEntryAction as jest.Mock).mockReturnValue(updateAction);
    (createJournalPageMutationActionsResult as jest.Mock).mockReturnValue(
      resultShape,
    );

    const loadData = jest.fn();
    const setShowForm = jest.fn();
    const closeForm = jest.fn();
    const { result } = renderHook(() =>
      useJournalPageMutationActions({
        titleInput: "タイトル",
        contentInput: "本文",
        dateInput: "2024-01-10",
        editingEntry: null,
        setShowForm,
        closeForm,
        loadData,
      }),
    );

    expect(result.current).toBe(resultShape);
    expect(useJournalDeleteEntryAction).toHaveBeenCalledWith({ loadData });
    expect(useJournalSaveEntryAction).toHaveBeenCalledWith({
      titleInput: "タイトル",
      contentInput: "本文",
      dateInput: "2024-01-10",
      loadData,
      setShowForm,
    });
    expect(useJournalUpdateEntryAction).toHaveBeenCalledWith({
      entryId: "",
      originalDate: "",
      dateInput: "2024-01-10",
      titleInput: "タイトル",
      contentInput: "本文",
      loadData,
      closeForm,
    });
    expect(createJournalPageMutationActionsResult).toHaveBeenCalledWith({
      handleDeleteEntry: expect.any(Function),
      handleSaveEntry: expect.any(Function),
      handleUpdateEntry: expect.any(Function),
    });

    const builtActions = (createJournalPageMutationActionsResult as jest.Mock)
      .mock.calls[0][0] as BuiltActions;

    act(() => {
      builtActions.handleDeleteEntry(entry);
      builtActions.handleSaveEntry();
      builtActions.handleUpdateEntry();
    });

    expect(deleteAction).toHaveBeenCalledWith(entry);
    expect(saveAction).toHaveBeenCalled();
    // editingEntry が null のため updateEntryBase は no-op にラップされており呼ばれない
    expect(updateAction).not.toHaveBeenCalled();
  });

  it("編集中は、エントリの ID と日付（編集前の日付）を更新へ渡す", () => {
    const updateAction = jest.fn();
    (useJournalDeleteEntryAction as jest.Mock).mockReturnValue(jest.fn());
    (useJournalSaveEntryAction as jest.Mock).mockReturnValue(jest.fn());
    (useJournalUpdateEntryAction as jest.Mock).mockReturnValue(updateAction);

    const loadData = jest.fn();
    const closeForm = jest.fn();
    renderHook(() =>
      useJournalPageMutationActions({
        titleInput: "タイトル",
        contentInput: "本文",
        dateInput: null,
        editingEntry: entry,
        setShowForm: jest.fn(),
        closeForm,
        loadData,
      }),
    );

    expect(useJournalUpdateEntryAction).toHaveBeenCalledWith({
      entryId: "entry-1",
      originalDate: "2024-01-12",
      dateInput: null,
      titleInput: "タイトル",
      contentInput: "本文",
      loadData,
      closeForm,
    });

    const builtActions = (createJournalPageMutationActionsResult as jest.Mock)
      .mock.calls[0][0] as BuiltActions;
    act(() => {
      builtActions.handleUpdateEntry();
    });
    expect(updateAction).toHaveBeenCalled();
  });
});
```

- [ ] **Step 14: 落ちることを確かめる**

Run: `npm test -- src/features/journal/__tests__/journalMutationActions.test.ts src/features/journal/__tests__/pageStateActions.test.ts src/features/journal/__tests__/journalPageMutationHandlers.test.ts src/features/journal/__tests__/journalPageStateActions.test.ts src/features/journal/__tests__/useJournalSaveEntryAction.test.tsx src/features/journal/__tests__/useJournalUpdateEntryAction.test.tsx src/features/journal/__tests__/useJournalPageMutationActions.test.tsx --testPathIgnorePatterns=/node_modules/ /firebase-functions/lib/ /e2e/`
Expected: FAIL。`saveEntry` が `today` で呼ばれる（`"2024-01-10"` を期待した箇所）、日付の検証が無いので不正・未来でも保存される、`toHaveBeenCalledWith` の引数の差分（`date`・`dateAlertMessages`・`originalDate`・`dateInput`・`getToday` が無い）。

- [ ] **Step 15: 保存・更新の処理を実装する**

`src/features/journal/journalMutationActions.ts` を次の内容に置き換える。

```ts
import { getJournalDateError } from "./utils/journalDate";

/** 日付を拒否するときの文言。invalid は空・形式違い・実在しない日付、future は今日より後 */
export type JournalDateAlertMessages = {
  invalid: string;
  future: string;
};

/** 日付の検証に通らなければ理由を alert して true を返す */
const alertIfInvalidDate = (
  date: string,
  today: string,
  messages: JournalDateAlertMessages,
  alertFn: (message?: string) => void,
): boolean => {
  const error = getJournalDateError(date, today);
  if (error === null) return false;
  alertFn(error === "future" ? messages.future : messages.invalid);
  return true;
};

type SaveJournalEntryArgs = {
  /** 保存する日付（呼び出し側で dateInput ?? today に解決済み） */
  date: string;
  /** 呼び出し側が 1 回だけ取った今日。未来の判定に使う */
  today: string;
  titleInput: string;
  contentInput: string;
  defaultTitle: string;
  alertMessage: string;
  dateAlertMessages: JournalDateAlertMessages;
  saveEntry: (date: string, title: string, content: string) => void;
  reloadData: () => void;
  closeForm: () => void;
  alertFn?: (message?: string) => void;
};

export const saveJournalEntryAndReload = ({
  date,
  today,
  titleInput,
  contentInput,
  defaultTitle,
  alertMessage,
  dateAlertMessages,
  saveEntry,
  reloadData,
  closeForm,
  alertFn = window.alert,
}: SaveJournalEntryArgs): boolean => {
  const trimmedTitle = titleInput.trim();
  const trimmedContent = contentInput.trim();

  if (!trimmedTitle && !trimmedContent) {
    alertFn(alertMessage);
    return false;
  }

  // 新規追加は常に日付を検証する（空・不正・未来は保存しない。入力とフォームは残す）
  if (alertIfInvalidDate(date, today, dateAlertMessages, alertFn)) {
    return false;
  }

  saveEntry(date, trimmedTitle || defaultTitle, trimmedContent);
  reloadData();
  closeForm();
  return true;
};

type DeleteJournalEntryArgs = {
  entryId: string;
  confirmMessage: string;
  deleteEntry: (entryId: string) => void;
  reloadData: () => void;
  confirmFn?: (message?: string) => boolean;
};

export const deleteJournalEntryAndReload = ({
  entryId,
  confirmMessage,
  deleteEntry,
  reloadData,
  confirmFn = window.confirm,
}: DeleteJournalEntryArgs): boolean => {
  if (!confirmFn(confirmMessage)) {
    return false;
  }

  deleteEntry(entryId);
  reloadData();
  return true;
};

type UpdateJournalEntryArgs = {
  entryId: string;
  /** 編集前のエントリの日付（editingEntry.date） */
  originalDate: string;
  /** 日付の入力。null は未操作で、編集前の日付として扱う */
  dateInput: string | null;
  /** 呼び出し側が 1 回だけ取った今日。未来の判定に使う */
  today: string;
  titleInput: string;
  contentInput: string;
  defaultTitle: string;
  alertMessage: string;
  dateAlertMessages: JournalDateAlertMessages;
  updateEntry: (
    entryId: string,
    title: string,
    content: string,
    date?: string,
  ) => void;
  reloadData: () => void;
  closeForm: () => void;
  alertFn?: (message?: string) => void;
};

export const updateJournalEntryAndReload = ({
  entryId,
  originalDate,
  dateInput,
  today,
  titleInput,
  contentInput,
  defaultTitle,
  alertMessage,
  dateAlertMessages,
  updateEntry,
  reloadData,
  closeForm,
  alertFn = window.alert,
}: UpdateJournalEntryArgs): boolean => {
  if (!entryId) {
    throw new Error("updateJournalEntryAndReload: entryId is required");
  }

  const trimmedTitle = titleInput.trim();
  const trimmedContent = contentInput.trim();

  if (!trimmedTitle && !trimmedContent) {
    alertFn(alertMessage);
    return false;
  }

  const title = trimmedTitle || defaultTitle;
  const nextDate = dateInput ?? originalDate;

  if (nextDate !== originalDate) {
    // 日付を変えたときだけ検証する（API で作った未来日などのエントリも、日付を変えなければ直せる）
    if (alertIfInvalidDate(nextDate, today, dateAlertMessages, alertFn)) {
      return false;
    }
    updateEntry(entryId, title, trimmedContent, nextDate);
  } else {
    // 日付を変えないときは日付を渡さない（保存層でバケットを動かさない）
    updateEntry(entryId, title, trimmedContent);
  }

  reloadData();
  closeForm();
  return true;
};
```

`src/features/journal/journalPageMutationHandlers.ts` を次の内容に置き換える。

```ts
import type { JournalEntry } from "@/types/routine";
import journalTexts from "./locales/ja.json";
import { confirmDeleteEntry } from "./helpers";
import {
  deleteJournalEntry,
  saveJournalEntry,
  updateJournalEntry,
} from "./storage";
import {
  deleteJournalEntryAndReload,
  saveJournalEntryAndReload,
  updateJournalEntryAndReload,
  type JournalDateAlertMessages,
} from "./journalMutationActions";

const JOURNAL_DATE_ALERT_MESSAGES: JournalDateAlertMessages = {
  invalid: journalTexts.page.alertInvalidDate,
  future: journalTexts.page.alertFutureDate,
};

export const createDeleteJournalEntryHandler = (params: {
  reloadData: () => void;
}) => {
  const { reloadData } = params;

  return (entry: JournalEntry) => {
    return deleteJournalEntryAndReload({
      entryId: entry.id,
      confirmMessage: confirmDeleteEntry(entry.date),
      deleteEntry: deleteJournalEntry,
      reloadData,
    });
  };
};

export const createUpdateJournalEntryHandler = (params: {
  entryId: string;
  originalDate: string;
  dateInput: string | null;
  getToday: () => string;
  titleInput: string;
  contentInput: string;
  reloadData: () => void;
  closeForm: () => void;
}) => {
  const {
    entryId,
    originalDate,
    dateInput,
    getToday,
    titleInput,
    contentInput,
    reloadData,
    closeForm,
  } = params;

  return () => {
    return updateJournalEntryAndReload({
      entryId,
      originalDate,
      dateInput,
      // 今日は入口で 1 回だけ取る
      today: getToday(),
      titleInput,
      contentInput,
      defaultTitle: journalTexts.page.defaultTitle,
      alertMessage: journalTexts.page.alertMissingContent,
      dateAlertMessages: JOURNAL_DATE_ALERT_MESSAGES,
      updateEntry: updateJournalEntry,
      reloadData,
      closeForm,
    });
  };
};

export const createSaveJournalEntryHandler = (params: {
  getToday: () => string;
  dateInput: string | null;
  titleInput: string;
  contentInput: string;
  reloadData: () => void;
  closeForm: () => void;
}) => {
  const {
    getToday,
    dateInput,
    titleInput,
    contentInput,
    reloadData,
    closeForm,
  } = params;

  return () => {
    // 今日は入口で 1 回だけ取り、未操作時の既定値と未来の判定の両方に使う
    const today = getToday();
    return saveJournalEntryAndReload({
      today,
      date: dateInput ?? today,
      titleInput,
      contentInput,
      defaultTitle: journalTexts.page.defaultTitle,
      alertMessage: journalTexts.page.alertMissingContent,
      dateAlertMessages: JOURNAL_DATE_ALERT_MESSAGES,
      saveEntry: saveJournalEntry,
      reloadData,
      closeForm,
    });
  };
};
```

`src/features/journal/useJournalSaveEntryAction.ts` を次の内容に置き換える。

```ts
import { useCallback } from "react";
import type { Dispatch, SetStateAction } from "react";
import { createSaveJournalEntryHandler } from "./journalPageMutationHandlers";
import { getTodayDateString } from "./utils/journalDate";

type UseJournalSaveEntryActionParams = {
  titleInput: string;
  contentInput: string;
  dateInput: string | null;
  loadData: () => void;
  setShowForm: Dispatch<SetStateAction<boolean>>;
};

export const useJournalSaveEntryAction = ({
  titleInput,
  contentInput,
  dateInput,
  loadData,
  setShowForm,
}: UseJournalSaveEntryActionParams) => {
  return useCallback(() => {
    return createSaveJournalEntryHandler({
      getToday: getTodayDateString,
      dateInput,
      titleInput,
      contentInput,
      reloadData: loadData,
      closeForm: () => setShowForm(false),
    })();
  }, [contentInput, dateInput, loadData, setShowForm, titleInput]);
};
```

`src/features/journal/useJournalUpdateEntryAction.ts` を次の内容に置き換える。

```ts
import { useCallback } from "react";
import { createUpdateJournalEntryHandler } from "./journalPageMutationHandlers";
import { getTodayDateString } from "./utils/journalDate";

type UseJournalUpdateEntryActionParams = {
  entryId: string;
  originalDate: string;
  dateInput: string | null;
  titleInput: string;
  contentInput: string;
  loadData: () => void;
  closeForm: () => void;
};

export const useJournalUpdateEntryAction = ({
  entryId,
  originalDate,
  dateInput,
  titleInput,
  contentInput,
  loadData,
  closeForm,
}: UseJournalUpdateEntryActionParams) => {
  return useCallback(() => {
    return createUpdateJournalEntryHandler({
      entryId,
      originalDate,
      dateInput,
      getToday: getTodayDateString,
      titleInput,
      contentInput,
      reloadData: loadData,
      closeForm,
    })();
  }, [
    entryId,
    originalDate,
    dateInput,
    titleInput,
    contentInput,
    loadData,
    closeForm,
  ]);
};
```

`src/features/journal/useJournalPageMutationActions.ts` を次の内容に置き換える。

```ts
import type { Dispatch, SetStateAction } from "react";
import type { JournalEntry } from "@/types/routine";
import { createJournalPageMutationActionsResult } from "./journalPageMutationActionsResult";
import { useJournalDeleteEntryAction } from "./useJournalDeleteEntryAction";
import { useJournalSaveEntryAction } from "./useJournalSaveEntryAction";
import { useJournalUpdateEntryAction } from "./useJournalUpdateEntryAction";

type SetValue<T> = Dispatch<SetStateAction<T>>;

type UseJournalPageMutationActionsParams = {
  titleInput: string;
  contentInput: string;
  dateInput: string | null;
  editingEntry: JournalEntry | null;
  setShowForm: SetValue<boolean>;
  closeForm: () => void;
  loadData: () => void;
};

export const useJournalPageMutationActions = ({
  titleInput,
  contentInput,
  dateInput,
  editingEntry,
  setShowForm,
  closeForm,
  loadData,
}: UseJournalPageMutationActionsParams) => {
  const handleDeleteEntry = useJournalDeleteEntryAction({
    loadData,
  });
  const handleSaveEntry = useJournalSaveEntryAction({
    titleInput,
    contentInput,
    dateInput,
    loadData,
    setShowForm,
  });
  const updateEntryBase = useJournalUpdateEntryAction({
    entryId: editingEntry?.id ?? "",
    // 編集前の日付。日付を変えたかどうかの比較と、null（未操作）の解決に使う
    originalDate: editingEntry?.date ?? "",
    dateInput,
    titleInput,
    contentInput,
    loadData,
    closeForm,
  });
  const handleUpdateEntry = editingEntry ? updateEntryBase : () => {};

  return createJournalPageMutationActionsResult({
    handleDeleteEntry,
    handleSaveEntry,
    handleUpdateEntry,
  });
};
```

- [ ] **Step 16: 通ることを確かめる**

Run: Step 14 と同じコマンド。
Expected: PASS（7 ファイル）。

### 2a-5: 組み立て（`journalPageStateResult` から素のセッターを外す）

- [ ] **Step 17: 組み立ての失敗するテストを書く**

`src/features/journal/__tests__/journalPageActionBindings.test.ts` を次の内容に置き換える。

```ts
import { createJournalPageActionBindings } from "../journalPageActionBindings";

describe("journalPageActionBindings", () => {
  it("journal action 用の依存を束ねる（日付の入力と素のセッターを含む）", () => {
    const args = {
      titleInput: "title",
      contentInput: "content",
      dateInput: "2026-03-10",
      editingEntry: null,
      handleCancelForm: jest.fn(),
      setTodayEntry: jest.fn(),
      setTitleInput: jest.fn(),
      setContentInput: jest.fn(),
      setDateInput: jest.fn(),
      setRecentEntries: jest.fn(),
      setShowForm: jest.fn(),
    };

    expect(createJournalPageActionBindings(args)).toEqual(args);
  });
});
```

`src/features/journal/__tests__/useJournalPageActions.test.tsx` を次の内容に置き換える。

```tsx
import { renderHook } from "@testing-library/react";

jest.mock("../useJournalPageMutationActions", () => ({
  useJournalPageMutationActions: jest.fn(),
}));

jest.mock("../useJournalPageReloadAction", () => ({
  useJournalPageReloadAction: jest.fn(),
}));

jest.mock("../journalPageActionsResult", () => ({
  createJournalPageActionsResult: jest.fn(),
}));

import { useJournalPageMutationActions } from "../useJournalPageMutationActions";
import { createJournalPageActionsResult } from "../journalPageActionsResult";
import { useJournalPageReloadAction } from "../useJournalPageReloadAction";
import { useJournalPageActions } from "../useJournalPageActions";

describe("useJournalPageActions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("load/save/delete/update handler を組み立てて委譲する（日付を再読み込みと保存・更新へ渡す）", () => {
    const loadAction = jest.fn();
    const saveAction = jest.fn();
    const deleteAction = jest.fn();
    const updateAction = jest.fn();
    const resultShape = { composed: true };
    (useJournalPageReloadAction as jest.Mock).mockReturnValue({
      loadData: loadAction,
    });
    (useJournalPageMutationActions as jest.Mock).mockReturnValue({
      handleSaveEntry: saveAction,
      handleDeleteEntry: deleteAction,
      handleUpdateEntry: updateAction,
    });
    (createJournalPageActionsResult as jest.Mock).mockReturnValue(resultShape);

    const params = {
      titleInput: "タイトル",
      contentInput: "本文",
      dateInput: "2026-03-10",
      editingEntry: null,
      handleCancelForm: jest.fn(),
      setTodayEntry: jest.fn(),
      setTitleInput: jest.fn(),
      setContentInput: jest.fn(),
      setDateInput: jest.fn(),
      setRecentEntries: jest.fn(),
      setShowForm: jest.fn(),
    };

    const { result } = renderHook(() => useJournalPageActions(params));

    expect(useJournalPageReloadAction).toHaveBeenCalledWith({
      setTodayEntry: params.setTodayEntry,
      setTitleInput: params.setTitleInput,
      setContentInput: params.setContentInput,
      setDateInput: params.setDateInput,
      setRecentEntries: params.setRecentEntries,
    });
    expect(useJournalPageMutationActions).toHaveBeenCalledWith({
      titleInput: "タイトル",
      contentInput: "本文",
      dateInput: "2026-03-10",
      editingEntry: null,
      loadData: loadAction,
      setShowForm: params.setShowForm,
      closeForm: params.handleCancelForm,
    });
    expect(createJournalPageActionsResult).toHaveBeenCalledWith({
      handleDeleteEntry: deleteAction,
      handleSaveEntry: saveAction,
      handleUpdateEntry: updateAction,
      loadData: loadAction,
    });
    expect(result.current).toBe(resultShape);
  });
});
```

`src/features/journal/__tests__/useJournalPageState.test.tsx` を次の内容に置き換える。

```tsx
import { renderHook } from "@testing-library/react";

jest.mock("../journalPageActionBindings", () => ({
  createJournalPageActionBindings: jest.fn(),
}));

jest.mock("../journalPageStateResult", () => ({
  createJournalPageStateResult: jest.fn(),
}));

jest.mock("../useJournalPageActions", () => ({
  useJournalPageActions: jest.fn(),
}));

jest.mock("../useJournalPageDataState", () => ({
  useJournalPageDataState: jest.fn(),
}));

jest.mock("../useJournalPageFormState", () => ({
  useJournalPageFormState: jest.fn(),
}));

jest.mock("../utils/journalDate", () => ({
  getTodayDateString: jest.fn(() => "2024-01-12"),
}));

import { createJournalPageActionBindings } from "../journalPageActionBindings";
import { createJournalPageStateResult } from "../journalPageStateResult";
import { getTodayDateString } from "../utils/journalDate";
import { useJournalPageActions } from "../useJournalPageActions";
import { useJournalPageDataState } from "../useJournalPageDataState";
import { useJournalPageFormState } from "../useJournalPageFormState";
import { useJournalPageState } from "../useJournalPageState";

describe("useJournalPageState", () => {
  const formState = {
    contentInput: "",
    dateInput: "2024-01-10",
    showForm: false,
    titleInput: "",
    editingEntry: null,
    openEditForm: jest.fn(),
    setEditingEntry: jest.fn(),
    handleCancelForm: jest.fn(),
    handleTitleChange: jest.fn(),
    handleContentChange: jest.fn(),
    handleDateChange: jest.fn(),
    openForm: jest.fn(),
    setContentInput: jest.fn(),
    setDateInput: jest.fn(),
    setShowForm: jest.fn(),
    setTitleInput: jest.fn(),
  };
  const dataState = {
    initialState: {
      titleInput: "",
      contentInput: "",
      dateInput: null,
      showForm: false,
    },
    recentEntries: [],
    setRecentEntries: jest.fn(),
    setTodayEntry: jest.fn(),
    todayEntry: null,
  };
  const actions = {
    handleDeleteEntry: jest.fn(),
    handleSaveEntry: jest.fn(),
    handleUpdateEntry: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useJournalPageDataState as jest.Mock).mockReturnValue(dataState);
    (useJournalPageFormState as jest.Mock).mockReturnValue(formState);
    (createJournalPageActionBindings as jest.Mock).mockReturnValue({
      bound: true,
    });
    (useJournalPageActions as jest.Mock).mockReturnValue(actions);
    (createJournalPageStateResult as jest.Mock).mockReturnValue({
      composed: true,
    });
  });

  it("today/data/form/actions/result を compose する", () => {
    const { result } = renderHook(() => useJournalPageState());

    expect(getTodayDateString).toHaveBeenCalled();
    expect(useJournalPageFormState).toHaveBeenCalledWith(
      dataState.initialState,
    );
    expect(createJournalPageActionBindings).toHaveBeenCalledWith({
      titleInput: "",
      contentInput: "",
      dateInput: "2024-01-10",
      editingEntry: null,
      handleCancelForm: formState.handleCancelForm,
      setTodayEntry: dataState.setTodayEntry,
      setTitleInput: formState.setTitleInput,
      setContentInput: formState.setContentInput,
      setDateInput: formState.setDateInput,
      setRecentEntries: dataState.setRecentEntries,
      setShowForm: formState.setShowForm,
    });
    expect(useJournalPageActions).toHaveBeenCalledWith({ bound: true });
    expect(createJournalPageStateResult).toHaveBeenCalledWith({
      contentInput: "",
      dateInput: "2024-01-10",
      editingEntry: null,
      openEditForm: formState.openEditForm,
      recentEntries: [],
      showForm: false,
      titleInput: "",
      today: "2024-01-12",
      todayEntry: null,
      handleCancelForm: formState.handleCancelForm,
      handleContentChange: formState.handleContentChange,
      handleDateChange: formState.handleDateChange,
      handleDeleteEntry: actions.handleDeleteEntry,
      handleSaveEntry: actions.handleSaveEntry,
      handleTitleChange: formState.handleTitleChange,
      handleUpdateEntry: actions.handleUpdateEntry,
      openForm: formState.openForm,
      setEditingEntry: formState.setEditingEntry,
    });
    expect(result.current).toEqual({ composed: true });
  });
});
```

`src/features/journal/__tests__/journalPageStateResult.test.ts` を次の内容に置き換える。

```ts
import { createJournalPageStateResult } from "../journalPageStateResult";

describe("journalPageStateResult", () => {
  it("journal page の result を組み立てる（UI 用ハンドラを含み、素のセッターは含まない）", () => {
    const args = {
      contentInput: "本文",
      dateInput: "2024-01-10",
      editingEntry: null,
      recentEntries: [
        {
          id: "saved",
          date: "2024-01-12",
          title: "保存済み",
          content: "本文",
          createdAt: "2024-01-12T00:00:00.000Z",
          updatedAt: "2024-01-12T00:00:00.000Z",
        },
      ],
      showForm: true,
      titleInput: "保存済み",
      today: "2024-01-12",
      todayEntry: null,
      handleCancelForm: jest.fn(),
      handleContentChange: jest.fn(),
      handleDateChange: jest.fn(),
      handleDeleteEntry: jest.fn(),
      handleSaveEntry: jest.fn(),
      handleTitleChange: jest.fn(),
      handleUpdateEntry: jest.fn(),
      openEditForm: jest.fn(),
      openForm: jest.fn(),
      setEditingEntry: jest.fn(),
    };

    const result = createJournalPageStateResult(args);

    expect(result).toEqual(args);
    expect(result).not.toHaveProperty("setTitleInput");
    expect(result).not.toHaveProperty("setContentInput");
    expect(result).not.toHaveProperty("setDateInput");
  });
});
```

`src/features/journal/__tests__/JournalPage.test.tsx` を次の内容に置き換える。

```tsx
import { fireEvent, render, screen } from "@testing-library/react";
import { JournalPage } from "../JournalPage";
import { useJournalPageState } from "../useJournalPageState";
import journalTexts from "../locales/ja.json";
import { type JournalEntry } from "@/types/routine";

jest.mock("../useJournalPageState");

const mockUseJournalPageState = useJournalPageState as jest.MockedFunction<
  typeof useJournalPageState
>;

describe("JournalPage", () => {
  const sampleEntry: JournalEntry = {
    id: "entry-1",
    date: "2026-03-15",
    title: "今日のタイトル",
    content: "今日の内容",
    createdAt: "2026-03-15T12:00:00Z",
    updatedAt: "2026-03-15T12:00:00Z",
  };

  const pastEntry: JournalEntry = {
    id: "entry-past",
    date: "2026-03-10",
    title: "過去のタイトル",
    content: "過去の内容",
    createdAt: "2026-03-10T10:00:00Z",
    updatedAt: "2026-03-10T10:00:00Z",
  };

  const createState = (overrides: Record<string, unknown> = {}) => ({
    today: "2026-03-15",
    todayEntry: sampleEntry,
    editingEntry: null,
    showForm: false,
    titleInput: "",
    contentInput: "",
    dateInput: null,
    recentEntries: [sampleEntry],
    openForm: jest.fn(),
    openEditForm: jest.fn(),
    setEditingEntry: jest.fn(),
    handleTitleChange: jest.fn(),
    handleContentChange: jest.fn(),
    handleDateChange: jest.fn(),
    handleSaveEntry: jest.fn(),
    handleUpdateEntry: jest.fn(),
    handleCancelForm: jest.fn(),
    handleDeleteEntry: jest.fn(),
    ...overrides,
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("基本レイアウトとタイトル、JournalTodayCard、JournalRecentEntries をレンダリングする", () => {
    mockUseJournalPageState.mockReturnValue(createState() as never);

    render(<JournalPage />);

    expect(screen.getByText(journalTexts.page.title)).toBeInTheDocument();
    expect(screen.queryByText(/beta/i)).not.toBeInTheDocument();
  });

  it("過去の日記エントリを編集中の場合は JournalEditCard を表示する", () => {
    mockUseJournalPageState.mockReturnValue(
      createState({
        editingEntry: pastEntry,
        showForm: true,
        titleInput: "過去のタイトル",
        contentInput: "過去の内容編集",
        dateInput: pastEntry.date,
        recentEntries: [sampleEntry, pastEntry],
      }) as never,
    );

    render(<JournalPage />);

    expect(screen.getByText(journalTexts.page.title)).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        level: 2,
        name: "2026年3月10日(火) の記録を編集",
      }),
    ).toBeInTheDocument();
  });

  it("新規フォームのタイトル・本文の入力を UI 用ハンドラへ渡す", () => {
    const handleTitleChange = jest.fn();
    const handleContentChange = jest.fn();
    mockUseJournalPageState.mockReturnValue(
      createState({
        todayEntry: null,
        showForm: true,
        handleTitleChange,
        handleContentChange,
      }) as never,
    );

    render(<JournalPage />);
    fireEvent.change(screen.getByPlaceholderText("例: 今日の出来事"), {
      target: { value: "題" },
    });
    fireEvent.change(screen.getByPlaceholderText(/今日感じたこと/), {
      target: { value: "本文" },
    });

    expect(handleTitleChange).toHaveBeenCalledWith("題");
    expect(handleContentChange).toHaveBeenCalledWith("本文");
  });

  it("過去のエントリの編集カードでも、タイトル・本文の入力を UI 用ハンドラへ渡す", () => {
    const handleTitleChange = jest.fn();
    const handleContentChange = jest.fn();
    mockUseJournalPageState.mockReturnValue(
      createState({
        editingEntry: pastEntry,
        showForm: true,
        titleInput: pastEntry.title,
        contentInput: pastEntry.content,
        dateInput: pastEntry.date,
        handleTitleChange,
        handleContentChange,
      }) as never,
    );

    render(<JournalPage />);
    fireEvent.change(screen.getByLabelText("タイトル"), {
      target: { value: "直した題" },
    });
    fireEvent.change(screen.getByLabelText("本文"), {
      target: { value: "直した本文" },
    });

    expect(handleTitleChange).toHaveBeenCalledWith("直した題");
    expect(handleContentChange).toHaveBeenCalledWith("直した本文");
  });
});
```

- [ ] **Step 18: 落ちることを確かめる**

Run: `npm test -- src/features/journal/__tests__/journalPageActionBindings.test.ts src/features/journal/__tests__/useJournalPageActions.test.tsx src/features/journal/__tests__/useJournalPageState.test.tsx src/features/journal/__tests__/journalPageStateResult.test.ts src/features/journal/__tests__/JournalPage.test.tsx --testPathIgnorePatterns=/node_modules/ /firebase-functions/lib/ /e2e/`
Expected: FAIL。`dateInput`・`setDateInput` が束ねられない・渡らない差分、`journalPageStateResult` に `handle*Change` が無く `setTitleInput` がある差分、`JournalPage` のハンドラが呼ばれない（`onTitleChange={state.setTitleInput}` のため `handleTitleChange` が呼ばれず、`setTitleInput` が無いので `onChange` で TypeError）。

- [ ] **Step 19: 組み立てを実装する**

`src/features/journal/journalPageActionBindings.ts` を次の内容に置き換える。

```ts
import type { Dispatch, SetStateAction } from "react";
import type { JournalEntry } from "@/types/routine";

type SetValue<T> = Dispatch<SetStateAction<T>>;

type JournalPageActionBindingsArgs = {
  titleInput: string;
  contentInput: string;
  dateInput: string | null;
  editingEntry: JournalEntry | null;
  handleCancelForm: () => void;
  setTodayEntry: SetValue<JournalEntry | null>;
  setTitleInput: SetValue<string>;
  setContentInput: SetValue<string>;
  setDateInput: SetValue<string | null>;
  setRecentEntries: SetValue<JournalEntry[]>;
  setShowForm: SetValue<boolean>;
};

export const createJournalPageActionBindings = ({
  titleInput,
  contentInput,
  dateInput,
  editingEntry,
  handleCancelForm,
  setTodayEntry,
  setTitleInput,
  setContentInput,
  setDateInput,
  setRecentEntries,
  setShowForm,
}: JournalPageActionBindingsArgs) => {
  return {
    titleInput,
    contentInput,
    dateInput,
    editingEntry,
    handleCancelForm,
    setTodayEntry,
    setTitleInput,
    setContentInput,
    setDateInput,
    setRecentEntries,
    setShowForm,
  };
};
```

`src/features/journal/useJournalPageActions.ts` を次の内容に置き換える。

```ts
import type { Dispatch, SetStateAction } from "react";
import type { JournalEntry } from "@/types/routine";
import { createJournalPageActionsResult } from "./journalPageActionsResult";
import { useJournalPageMutationActions } from "./useJournalPageMutationActions";
import { useJournalPageReloadAction } from "./useJournalPageReloadAction";

type SetValue<T> = Dispatch<SetStateAction<T>>;

type UseJournalPageActionsParams = {
  titleInput: string;
  contentInput: string;
  dateInput: string | null;
  editingEntry: JournalEntry | null;
  handleCancelForm: () => void;
  setTodayEntry: SetValue<JournalEntry | null>;
  setTitleInput: SetValue<string>;
  setContentInput: SetValue<string>;
  setDateInput: SetValue<string | null>;
  setRecentEntries: SetValue<JournalEntry[]>;
  setShowForm: SetValue<boolean>;
};

export const useJournalPageActions = ({
  titleInput,
  contentInput,
  dateInput,
  editingEntry,
  handleCancelForm,
  setTodayEntry,
  setTitleInput,
  setContentInput,
  setDateInput,
  setRecentEntries,
  setShowForm,
}: UseJournalPageActionsParams) => {
  // 再読み込みは素のセッターで入力を戻す（日付の固定を起こさない）
  const { loadData } = useJournalPageReloadAction({
    setTodayEntry,
    setTitleInput,
    setContentInput,
    setDateInput,
    setRecentEntries,
  });
  const { handleDeleteEntry, handleSaveEntry, handleUpdateEntry } =
    useJournalPageMutationActions({
      titleInput,
      contentInput,
      dateInput,
      editingEntry,
      setShowForm,
      closeForm: handleCancelForm,
      loadData,
    });

  return createJournalPageActionsResult({
    handleDeleteEntry,
    handleSaveEntry,
    handleUpdateEntry,
    loadData,
  });
};
```

`src/features/journal/useJournalPageState.ts` を次の内容に置き換える。

```ts
import { getTodayDateString } from "./utils/journalDate";
import { createJournalPageActionBindings } from "./journalPageActionBindings";
import { createJournalPageStateResult } from "./journalPageStateResult";
import { useJournalPageActions } from "./useJournalPageActions";
import { useJournalPageDataState } from "./useJournalPageDataState";
import { useJournalPageFormState } from "./useJournalPageFormState";

export const useJournalPageState = () => {
  // 描画のたびに取り直す（開いたまま日をまたいでも、入力のたびに max と見出しが追いつく）
  const today = getTodayDateString();
  const {
    initialState,
    recentEntries,
    setRecentEntries,
    setTodayEntry,
    todayEntry,
  } = useJournalPageDataState();
  const {
    contentInput,
    dateInput,
    editingEntry,
    openEditForm,
    setEditingEntry,
    showForm,
    titleInput,
    handleCancelForm,
    handleContentChange,
    handleDateChange,
    handleTitleChange,
    openForm,
    setContentInput,
    setDateInput,
    setShowForm,
    setTitleInput,
  } = useJournalPageFormState(initialState);

  // 素のセッターは再読み込み・リセットの組み立てにだけ渡す
  const { handleDeleteEntry, handleSaveEntry, handleUpdateEntry } =
    useJournalPageActions(
      createJournalPageActionBindings({
        titleInput,
        contentInput,
        dateInput,
        editingEntry,
        handleCancelForm,
        setTodayEntry,
        setTitleInput,
        setContentInput,
        setDateInput,
        setRecentEntries,
        setShowForm,
      }),
    );

  // UI には固定を行う handle*Change だけを渡す
  return createJournalPageStateResult({
    contentInput,
    dateInput,
    editingEntry,
    openEditForm,
    recentEntries,
    showForm,
    titleInput,
    today,
    todayEntry,
    handleCancelForm,
    handleContentChange,
    handleDateChange,
    handleDeleteEntry,
    handleSaveEntry,
    handleTitleChange,
    handleUpdateEntry,
    openForm,
    setEditingEntry,
  });
};
```

`src/features/journal/journalPageStateResult.ts` を次の内容に置き換える。

```ts
import type { Dispatch, SetStateAction } from "react";
import type { JournalEntry } from "@/types/routine";

type JournalPageStateResultArgs = {
  contentInput: string;
  dateInput: string | null;
  editingEntry: JournalEntry | null;
  recentEntries: JournalEntry[];
  showForm: boolean;
  titleInput: string;
  today: string;
  todayEntry: JournalEntry | null;
  handleCancelForm: () => void;
  handleContentChange: (value: string) => void;
  handleDateChange: (value: string) => void;
  handleDeleteEntry: (entry: JournalEntry) => void;
  handleSaveEntry: () => void;
  handleTitleChange: (value: string) => void;
  handleUpdateEntry: () => void;
  openEditForm: (entry: JournalEntry) => void;
  openForm: () => void;
  setEditingEntry: Dispatch<SetStateAction<JournalEntry | null>>;
};

/** 画面に渡す state。入力の変更は handle*Change だけ（素のセッターは含めない） */
export const createJournalPageStateResult = ({
  contentInput,
  dateInput,
  editingEntry,
  recentEntries,
  showForm,
  titleInput,
  today,
  todayEntry,
  handleCancelForm,
  handleContentChange,
  handleDateChange,
  handleDeleteEntry,
  handleSaveEntry,
  handleTitleChange,
  handleUpdateEntry,
  openEditForm,
  openForm,
  setEditingEntry,
}: JournalPageStateResultArgs) => {
  return {
    contentInput,
    dateInput,
    editingEntry,
    recentEntries,
    showForm,
    titleInput,
    today,
    todayEntry,
    handleCancelForm,
    handleContentChange,
    handleDateChange,
    handleDeleteEntry,
    handleSaveEntry,
    handleTitleChange,
    handleUpdateEntry,
    openEditForm,
    openForm,
    setEditingEntry,
  };
};
```

`src/features/journal/JournalPage.tsx` の `onTitleChange={state.setTitleInput}` の 2 か所を `onTitleChange={state.handleTitleChange}` に、`onContentChange={state.setContentInput}` の 2 か所を `onContentChange={state.handleContentChange}` に置き換える（`JournalTodayCard` と `JournalEditCard` の両方。日付の props は Task 2b で足す）。

- [ ] **Step 20: 通ることを確かめる**

Run: Step 18 と同じコマンド。
Expected: PASS（5 ファイル）。

### 2a-6: Task 2a 全体の検証

- [ ] **Step 21: 実装を一時的に書き換えるとテストが落ちることを確かめ、元に戻す**

各項目で、書き換え → `npm test -- src/features/journal --testPathIgnorePatterns=/node_modules/ /firebase-functions/lib/ /e2e/` → 期待どおり落ちることを確認 → 書き換えを元に戻す、を順に行う。

1. `journalPageFormActions.ts` の `setDateInput((prev) => prev ?? lockedDate);` を `setDateInput(lockedDate);` に書き換える。Expected: `journalPageFormActions.test.ts` の固定のテスト（`updater is not a function`）と、`useJournalPageFormState.dateLock.test.tsx` の「日付欄を空にした値は…」「新規で最初の変更が日付欄なら…」「日をまたいでも変えない」が落ちる。
2. `journalPageDataActions.ts` の `resetJournalFormInputs` の `dateInput: null,` を `dateInput: "2000-01-01",` に書き換える。Expected: `journalPageDataActions.test.ts`・`pageStateActions.test.ts` のリセットと、`useJournalPageFormState.dateLock.test.tsx` の「フォームを開く・閉じるリセットは…」が落ちる。
3. `journalMutationActions.ts` の `if (nextDate !== originalDate) {` を `if (nextDate !== originalDate || true) {` に書き換える。Expected: 「日付を変えない（dateInput が null）なら、日付を渡さずに…」「dateInput が編集前の日付と同じなら…」「日付を変えないときは検証しない…」が落ちる（L-454・2-3 節）。
4. `journalPageMutationHandlers.ts` の `date: dateInput ?? today,` を `date: today,` に書き換える。Expected: 「save handler は選んだ日付（固定済みの日付）を渡し…」「save handler は空にした日付…」が落ちる。
5. `useJournalPageActions.ts` の `useJournalPageMutationActions({` の引数から `dateInput,` の行を消す。Expected: `useJournalPageActions.test.tsx` が落ちる（L-060）。
6. `useJournalPageState.ts` の `createJournalPageActionBindings({` の引数から `setDateInput,` の行を消す。Expected: `useJournalPageState.test.tsx` が落ちる（L-060）。
7. `useJournalPageFormState.ts` の `editingEntry,`（`createJournalInputChangeHandlers({` の引数の 1 行目）を `editingEntry: null,` に書き換える。Expected: `useJournalPageFormState.dateLock.test.tsx` の「編集はエントリの日付を入れ、再読み込みで null に戻っても…」が `2026-03-15` の差分で落ちる（過去のエントリの日付が今日に書き換わる回帰）。

- [ ] **Step 22: 戻し忘れが無いことを確かめる**

1. 次の出力が、括弧の中の行数・件数になること:
   - `grep -nF "setDateInput((prev) => prev ?? lockedDate);" src/features/journal/journalPageFormActions.ts`（1 行）
   - `grep -nF "dateInput: null," src/features/journal/journalPageDataActions.ts`（`createJournalPageData` と `resetJournalFormInputs` の 2 行）
   - `grep -nF "if (nextDate !== originalDate) {" src/features/journal/journalMutationActions.ts`（1 行）
   - `grep -nF "date: dateInput ?? today," src/features/journal/journalPageMutationHandlers.ts`（1 行）
   - `grep -c "  dateInput,$" src/features/journal/useJournalPageActions.ts`（2: 引数の分割代入と `useJournalPageMutationActions` への受け渡し）
   - `grep -c "setDateInput,$" src/features/journal/useJournalPageState.ts`（2: `useJournalPageFormState` の分割代入と `createJournalPageActionBindings` への受け渡し）
   - `grep -nF "      editingEntry," src/features/journal/useJournalPageFormState.ts`（1 行: `createJournalInputChangeHandlers` への受け渡し）
2. 次の 3 つがどれも何も出さないこと:
   - `grep -nF "|| true" src/features/journal/journalMutationActions.ts`
   - `grep -nF "2000-01-01" src/features/journal/journalPageDataActions.ts`
   - `grep -nF "editingEntry: null," src/features/journal/useJournalPageFormState.ts`

- [ ] **Step 23: Task 2a 全体を検証する**

1. `npx prettier --write` を、この Task で変更・作成した次のファイルだけに実行する:
   `src/features/journal/journalPageDataActions.ts src/features/journal/journalViewStateData.ts src/features/journal/journalFormViewState.ts src/features/journal/useJournalPageInputState.ts src/features/journal/journalPageFormActions.ts src/features/journal/useJournalPageFormActions.ts src/features/journal/useJournalPageFormState.ts src/features/journal/journalPageFormStateResult.ts src/features/journal/journalPageReloadActions.ts src/features/journal/useJournalPageReloadAction.ts src/features/journal/journalMutationActions.ts src/features/journal/journalPageMutationHandlers.ts src/features/journal/useJournalSaveEntryAction.ts src/features/journal/useJournalUpdateEntryAction.ts src/features/journal/useJournalPageMutationActions.ts src/features/journal/journalPageActionBindings.ts src/features/journal/useJournalPageActions.ts src/features/journal/useJournalPageState.ts src/features/journal/journalPageStateResult.ts src/features/journal/JournalPage.tsx`
   と、`src/features/journal/__tests__/` の次のファイル:
   `journalPageDataActions.test.ts pageStateActions.test.ts journalViewStateData.test.ts journalFormViewState.test.ts useJournalPageInputState.test.tsx useJournalPageDataState.test.tsx journalPageFormActions.test.ts useJournalPageFormActions.test.tsx useJournalPageFormState.test.tsx useJournalPageFormState.dateLock.test.tsx journalPageFormStateResult.test.ts journalPageReloadActions.test.ts useJournalPageReloadAction.test.tsx journalPageStateActions.test.ts journalMutationActions.test.ts journalPageMutationHandlers.test.ts useJournalSaveEntryAction.test.tsx useJournalUpdateEntryAction.test.tsx useJournalPageMutationActions.test.tsx journalPageActionBindings.test.ts useJournalPageActions.test.tsx useJournalPageState.test.tsx journalPageStateResult.test.ts JournalPage.test.tsx`（パスの前に `src/features/journal/__tests__/` を付けて渡す）
2. `npm test -- src/features/journal --testPathIgnorePatterns=/node_modules/ /firebase-functions/lib/ /e2e/` → Expected: 全スイート PASS。
3. `npm run typecheck` → Expected: エラー 0 件。ここで型の取りこぼし（`dateInput`・`setDateInput` の渡し忘れ、`journalPageStateResult` から外した `setTitleInput` の参照など）が出たら直す。
4. `npx eslint --max-warnings 0 src/features/journal` → Expected: 出力なし。
5. 網羅の確認: `grep -rli "contentinput" src/features/journal/__tests__` の出力 25 件のうち、`JournalEditCard.test.tsx` と `JournalTodayCard.test.tsx` 以外の 23 件が、この Task で直したファイルの一覧と一致すること（`useJournalPageFormState.dateLock.test.tsx` は新規なので 26 件目として出る）。

---

## Task 2b: 画面のカード（日付欄・見出し・`JournalPage.tsx`・Storybook）

**Files:**

- Modify: `src/features/journal/helpers.ts`（`getJournalTodayCardHeading` を追加）
- Modify: `src/features/journal/components/JournalTodayCard.tsx`
- Modify: `src/features/journal/components/JournalEditCard.tsx`
- Modify: `src/features/journal/JournalPage.tsx`（日付の props を渡す）
- Modify: `src/features/journal/components/JournalTodayCard.stories.tsx`・`src/features/journal/components/JournalEditCard.stories.tsx`
- Create（テスト）: `src/features/journal/__tests__/helpers.test.ts`・`src/features/journal/__tests__/JournalPage.dateEdit.test.tsx`
- Modify（テスト）: `src/features/journal/__tests__/JournalTodayCard.test.tsx`・`src/features/journal/__tests__/JournalEditCard.test.tsx`・`src/features/journal/__tests__/JournalPage.test.tsx`

**Interfaces:**

- Consumes（Task 1）: `isValidJournalDate`・`formatJournalDate`・`journalTexts.todayCard.dateInputLabel`・`journalTexts.todayCard.dateEntryTitleTemplate`・`journalTexts.editCard.dateInputLabel`
- Consumes（Task 2a）: `useJournalPageState()` の `dateInput: string | null`・`today: string`・`handleDateChange: (value: string) => void`・`handleTitleChange`・`handleContentChange`
- Produces:
  - `getJournalTodayCardHeading(date: string, today: string): string`（`helpers.ts`）
  - `JournalTodayCard` の props に `dateInput: string | null`・`onDateChange: (value: string) => void`（`today` は既存）
  - `JournalEditCard` の props に `dateInput: string | null`・`today: string`・`onDateChange: (value: string) => void`

**気をつける知見:**

- 見出しが日付欄に従うのは、今日のカードの新規追加のフォームだけ。今日のカードを編集で開いたとき（`formatJournalDate(today)` の今の見出し）と過去用の編集カード（`editingEntry.date`）は、日付欄を変えても見出しを変えない。日付欄が空・不正なら見出しは `今日の記録` だけ（`Invalid Date` を出さない）。
- 日付欄の値: 新規は `dateInput ?? today`、編集は `dateInput ?? editingEntry.date`。`max` は今日（OS の選択でも未来を選べない）。
- フォームを今日のカードと過去用の編集カードのどちらで開くかは、`JournalPage.tsx` の今の `isPastEditing`（`editingEntry.date !== today`。編集を始めたときのエントリの日付）のまま。下書きの日付では切り替えない。
- L-502: ストーリーは固定の日付（`2026-05-21` など）を使う。
- L-538: `max` と見出しの今日は、`useJournalPageState` が描画のたびに取り直す `today` を使う（カードで `getTodayDateString()` を呼ばない）。
- アクセシビリティ: 日付欄の `label` に `htmlFor`、`input` に `id`（今日のカードは `journal-date`、過去用の編集カードは `edit-journal-date`。2 つのフォームは同時に開かない）。

### 2b-1: 見出しの関数とカード

- [ ] **Step 1: 見出しとカードの失敗するテストを書く**

新しいファイル `src/features/journal/__tests__/helpers.test.ts` を作る。

```ts
import { getJournalTodayCardHeading } from "../helpers";

describe("getJournalTodayCardHeading", () => {
  it("今日なら「今日の記録 (日付)」", () => {
    expect(getJournalTodayCardHeading("2024-01-12", "2024-01-12")).toBe(
      "今日の記録 (2024年1月12日(金))",
    );
  });

  it("今日以外なら「<日付> の記録」", () => {
    expect(getJournalTodayCardHeading("2024-01-10", "2024-01-12")).toBe(
      "2024年1月10日(水) の記録",
    );
  });

  it("未来の日付も見出しには出す（保存の拒否は別の処理）", () => {
    expect(getJournalTodayCardHeading("2024-01-13", "2024-01-12")).toBe(
      "2024年1月13日(土) の記録",
    );
  });

  it.each(["", "123456-01-01", "2024-02-30", "2024/01/10"])(
    "空・不正（%s）なら日付を出さず「今日の記録」だけ",
    (date) => {
      expect(getJournalTodayCardHeading(date, "2024-01-12")).toBe("今日の記録");
    },
  );
});
```

`src/features/journal/__tests__/JournalTodayCard.test.tsx` を次の内容に置き換える（既存の 8 件はそのまま残し、`baseProps` に 2 つの props を足し、日付の `describe` を足す）。

```tsx
import { fireEvent, render, screen } from "@testing-library/react";
import type { JournalEntry } from "@/types/routine";
import { JournalTodayCard } from "../components/JournalTodayCard";

const baseEntry: JournalEntry = {
  id: "entry-1",
  date: "2024-01-12",
  title: "今日の日記",
  content: "今日は良い天気だった",
  createdAt: "2024-01-12T10:00:00.000Z",
  updatedAt: "2024-01-12T10:00:00.000Z",
};

const baseProps = {
  contentInput: "",
  dateInput: null,
  editingEntry: null,
  showForm: false,
  titleInput: "",
  today: "2024-01-12",
  todayEntry: null,
  onCancel: jest.fn(),
  onContentChange: jest.fn(),
  onDateChange: jest.fn(),
  onEditEntry: jest.fn(),
  onOpenForm: jest.fn(),
  onSave: jest.fn(),
  onUpdate: jest.fn(),
  onTitleChange: jest.fn(),
};

// 今日のカードの見出し（h2）の文字列
const headingText = () => screen.getByRole("heading", { level: 2 }).textContent;

describe("JournalTodayCard", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("todayEntry なし・フォーム非表示のとき空ラベルを表示する", () => {
    render(<JournalTodayCard {...baseProps} />);

    expect(screen.getByText("まだ今日の記録はありません")).toBeInTheDocument();
  });

  it("todayEntry あり・フォーム非表示のときエントリと編集ボタンを表示する", () => {
    render(<JournalTodayCard {...baseProps} todayEntry={baseEntry} />);

    expect(screen.getByText("今日の日記")).toBeInTheDocument();
    expect(screen.getByText("今日は良い天気だった")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "✏️ 編集" })).toBeInTheDocument();
  });

  it("編集ボタンをクリックすると onEditEntry が呼ばれる", () => {
    const onEditEntry = jest.fn();
    render(
      <JournalTodayCard
        {...baseProps}
        todayEntry={baseEntry}
        onEditEntry={onEditEntry}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "✏️ 編集" }));
    expect(onEditEntry).toHaveBeenCalledWith(baseEntry);
  });

  it("フォーム表示・editingEntry なし(新規)のとき「保存」ボタンを表示する", () => {
    render(
      <JournalTodayCard
        {...baseProps}
        showForm={true}
        titleInput="タイトル"
        contentInput="本文"
      />,
    );

    expect(screen.getByRole("button", { name: "保存" })).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "更新" }),
    ).not.toBeInTheDocument();
  });

  it("フォーム表示・editingEntry あり(編集中)のとき「更新」ボタンを表示する", () => {
    render(
      <JournalTodayCard
        {...baseProps}
        showForm={true}
        editingEntry={baseEntry}
        titleInput="タイトル"
        contentInput="本文"
      />,
    );

    expect(screen.getByRole("button", { name: "更新" })).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "保存" }),
    ).not.toBeInTheDocument();
  });

  it("「保存」クリックで onSave が呼ばれる", () => {
    const onSave = jest.fn();
    render(
      <JournalTodayCard
        {...baseProps}
        showForm={true}
        editingEntry={null}
        onSave={onSave}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "保存" }));
    expect(onSave).toHaveBeenCalledTimes(1);
  });

  it("「更新」クリックで onUpdate が呼ばれる", () => {
    const onUpdate = jest.fn();
    render(
      <JournalTodayCard
        {...baseProps}
        showForm={true}
        editingEntry={baseEntry}
        onUpdate={onUpdate}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "更新" }));
    expect(onUpdate).toHaveBeenCalledTimes(1);
  });

  it("「キャンセル」クリックで onCancel が呼ばれる", () => {
    const onCancel = jest.fn();
    render(
      <JournalTodayCard {...baseProps} showForm={true} onCancel={onCancel} />,
    );

    fireEvent.click(screen.getByRole("button", { name: "キャンセル" }));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  describe("日付欄と見出し", () => {
    it("フォームを閉じているときは日付欄を出さず、見出しは今日", () => {
      render(<JournalTodayCard {...baseProps} />);

      expect(screen.queryByLabelText("日付")).not.toBeInTheDocument();
      expect(headingText()).toBe("今日の記録 (2024年1月12日(金))");
    });

    it("新規で未操作（null）なら、日付欄は今日で max も今日", () => {
      render(<JournalTodayCard {...baseProps} showForm={true} />);

      const dateField = screen.getByLabelText("日付");
      expect(dateField).toHaveAttribute("type", "date");
      expect(dateField).toHaveValue("2024-01-12");
      expect(dateField).toHaveAttribute("max", "2024-01-12");
      expect(headingText()).toBe("今日の記録 (2024年1月12日(金))");
    });

    it("新規で過去の日付を選ぶと、日付欄はその日付で、見出しは「<日付> の記録」", () => {
      render(
        <JournalTodayCard
          {...baseProps}
          showForm={true}
          dateInput="2024-01-10"
        />,
      );

      expect(screen.getByLabelText("日付")).toHaveValue("2024-01-10");
      expect(headingText()).toBe("2024年1月10日(水) の記録");
    });

    it.each(["", "123456-01-01"])(
      "新規で日付欄が空・不正（%s）なら、見出しは「今日の記録」だけ",
      (dateInput) => {
        render(
          <JournalTodayCard
            {...baseProps}
            showForm={true}
            dateInput={dateInput}
          />,
        );

        expect(headingText()).toBe("今日の記録");
      },
    );

    it("日付欄を変更すると onDateChange が選んだ値で呼ばれる", () => {
      const onDateChange = jest.fn();
      render(
        <JournalTodayCard
          {...baseProps}
          showForm={true}
          onDateChange={onDateChange}
        />,
      );

      fireEvent.change(screen.getByLabelText("日付"), {
        target: { value: "2024-01-11" },
      });
      expect(onDateChange).toHaveBeenCalledWith("2024-01-11");
    });

    it("編集で未操作（null）なら、日付欄はエントリの日付", () => {
      render(
        <JournalTodayCard
          {...baseProps}
          showForm={true}
          editingEntry={baseEntry}
          dateInput={null}
        />,
      );

      expect(screen.getByLabelText("日付")).toHaveValue("2024-01-12");
    });

    it("編集で日付欄を変えても、見出しは編集前の日付（今日）のまま", () => {
      render(
        <JournalTodayCard
          {...baseProps}
          showForm={true}
          editingEntry={baseEntry}
          dateInput="2024-01-10"
        />,
      );

      expect(screen.getByLabelText("日付")).toHaveValue("2024-01-10");
      expect(headingText()).toBe("今日の記録 (2024年1月12日(金))");
    });
  });
});
```

`src/features/journal/__tests__/JournalEditCard.test.tsx` を次の内容に置き換える（既存の 7 件はそのまま残す）。

```tsx
import { fireEvent, render, screen } from "@testing-library/react";
import type { JournalEntry } from "@/types/routine";
import { JournalEditCard } from "../components/JournalEditCard";

const pastEntry: JournalEntry = {
  id: "entry-past",
  date: "2024-01-10",
  title: "先週の日記",
  content: "先週はどうだったか",
  createdAt: "2024-01-10T10:00:00.000Z",
  updatedAt: "2024-01-10T10:00:00.000Z",
};

const baseProps = {
  editingEntry: pastEntry,
  dateInput: "2024-01-10",
  today: "2024-01-12",
  titleInput: "先週の日記",
  contentInput: "先週はどうだったか",
  onTitleChange: jest.fn(),
  onContentChange: jest.fn(),
  onDateChange: jest.fn(),
  onUpdate: jest.fn(),
  onCancel: jest.fn(),
};

describe("JournalEditCard", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("編集対象エントリの日付を見出しに含む", () => {
    render(<JournalEditCard {...baseProps} />);
    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent("2024");
  });

  it("titleInput を入力フィールドに反映する", () => {
    render(<JournalEditCard {...baseProps} />);
    expect(screen.getByDisplayValue("先週の日記")).toBeInTheDocument();
  });

  it("contentInput をテキストエリアに反映する", () => {
    render(<JournalEditCard {...baseProps} />);
    expect(screen.getByDisplayValue("先週はどうだったか")).toBeInTheDocument();
  });

  it("タイトル入力変更で onTitleChange が呼ばれる", () => {
    const onTitleChange = jest.fn();
    render(<JournalEditCard {...baseProps} onTitleChange={onTitleChange} />);
    fireEvent.change(screen.getByDisplayValue("先週の日記"), {
      target: { value: "更新後タイトル" },
    });
    expect(onTitleChange).toHaveBeenCalledWith("更新後タイトル");
  });

  it("「更新」クリックで onUpdate が呼ばれる", () => {
    const onUpdate = jest.fn();
    render(<JournalEditCard {...baseProps} onUpdate={onUpdate} />);
    fireEvent.click(screen.getByRole("button", { name: "更新" }));
    expect(onUpdate).toHaveBeenCalledTimes(1);
  });

  it("「キャンセル」クリックで onCancel が呼ばれる", () => {
    const onCancel = jest.fn();
    render(<JournalEditCard {...baseProps} onCancel={onCancel} />);
    fireEvent.click(screen.getByRole("button", { name: "キャンセル" }));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it("「保存」ボタンは表示しない（編集専用カードのため）", () => {
    render(<JournalEditCard {...baseProps} />);
    expect(
      screen.queryByRole("button", { name: "保存" }),
    ).not.toBeInTheDocument();
  });

  it("日付欄に dateInput を表示し、max は今日", () => {
    render(<JournalEditCard {...baseProps} dateInput="2024-01-05" />);

    const dateField = screen.getByLabelText("日付");
    expect(dateField).toHaveAttribute("type", "date");
    expect(dateField).toHaveValue("2024-01-05");
    expect(dateField).toHaveAttribute("max", "2024-01-12");
  });

  it("dateInput が null（再読み込みで戻ったとき）は、エントリの日付を表示する", () => {
    render(<JournalEditCard {...baseProps} dateInput={null} />);

    expect(screen.getByLabelText("日付")).toHaveValue("2024-01-10");
  });

  it("日付欄を変更すると onDateChange が選んだ値で呼ばれる", () => {
    const onDateChange = jest.fn();
    render(<JournalEditCard {...baseProps} onDateChange={onDateChange} />);

    fireEvent.change(screen.getByLabelText("日付"), {
      target: { value: "2024-01-08" },
    });
    expect(onDateChange).toHaveBeenCalledWith("2024-01-08");
  });

  it("日付欄を変えても、見出しは編集前の日付のまま", () => {
    render(<JournalEditCard {...baseProps} dateInput="2024-01-05" />);

    expect(screen.getByRole("heading", { level: 2 }).textContent).toBe(
      "2024年1月10日(水) の記録を編集",
    );
  });
});
```

- [ ] **Step 2: 落ちることを確かめる**

Run: `npm test -- src/features/journal/__tests__/helpers.test.ts src/features/journal/__tests__/JournalTodayCard.test.tsx src/features/journal/__tests__/JournalEditCard.test.tsx --testPathIgnorePatterns=/node_modules/ /firebase-functions/lib/ /e2e/`
Expected: FAIL。`getJournalTodayCardHeading is not a function`、`Unable to find a label with the text of: 日付`、見出しの差分（新規で過去の日付を選んでも `今日の記録 (2024年1月12日(金))` のまま）。

- [ ] **Step 3: 見出しの関数を実装する**

`src/features/journal/helpers.ts` を次の内容に置き換える。

```ts
import journalTexts from "./locales/ja.json";
import { formatJournalDate, isValidJournalDate } from "./utils/journalDate";

export const confirmDeleteEntry = (date: string): string =>
  journalTexts.page.confirmDeleteEntryTemplate.replace("{date}", date);

export const getJournalFormOpenButtonLabel = (): string => {
  return journalTexts.todayCard.addButtonLabel;
};

/**
 * 今日のカードの見出し。date が今日なら「今日の記録 (日付)」、今日以外なら「<日付> の記録」。
 * 日付欄の値が空・不正なら日付を出さず「今日の記録」だけにする（Invalid Date を出さない）。
 */
export const getJournalTodayCardHeading = (
  date: string,
  today: string,
): string => {
  const { titleLabel, dateEntryTitleTemplate } = journalTexts.todayCard;

  if (!isValidJournalDate(date)) return titleLabel;
  if (date === today) return `${titleLabel} (${formatJournalDate(today)})`;
  return dateEntryTitleTemplate.replace("{date}", formatJournalDate(date));
};
```

- [ ] **Step 4: 今日のカードを実装する**

`src/features/journal/components/JournalTodayCard.tsx` を次の内容に置き換える。

```tsx
import { type JournalEntry } from "@/types/routine";
import journalTexts from "../locales/ja.json";
import {
  getJournalFormOpenButtonLabel,
  getJournalTodayCardHeading,
} from "../helpers";

type JournalTodayCardProps = {
  contentInput: string;
  dateInput: string | null;
  editingEntry: JournalEntry | null;
  showForm: boolean;
  titleInput: string;
  today: string;
  todayEntry: JournalEntry | null;
  onCancel: () => void;
  onContentChange: (value: string) => void;
  onDateChange: (value: string) => void;
  onEditEntry: (entry: JournalEntry) => void;
  onOpenForm: () => void;
  onSave: () => void;
  onUpdate: () => void;
  onTitleChange: (value: string) => void;
};

export const JournalTodayCard = ({
  contentInput,
  dateInput,
  editingEntry,
  showForm,
  titleInput,
  today,
  todayEntry,
  onCancel,
  onContentChange,
  onDateChange,
  onEditEntry,
  onOpenForm,
  onSave,
  onUpdate,
  onTitleChange,
}: JournalTodayCardProps) => {
  const isEditing = editingEntry !== null;
  // 日付欄の値。新規は未操作（null）なら今日、編集は未操作なら編集前の日付
  const dateValue = editingEntry
    ? (dateInput ?? editingEntry.date)
    : (dateInput ?? today);
  // 見出しが日付欄に従うのは新規追加のフォームだけ。閉じているときと編集は今日のまま
  const headingDate = showForm && !isEditing ? dateValue : today;

  return (
    <div className="mb-6 p-4 bg-purple-50 dark:bg-purple-100 rounded-lg">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-900">
          {getJournalTodayCardHeading(headingDate, today)}
        </h2>
        {!showForm && (
          <button
            onClick={onOpenForm}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
          >
            {getJournalFormOpenButtonLabel()}
          </button>
        )}
      </div>

      {showForm ? (
        <div className="space-y-4 mt-4">
          <div>
            <label
              htmlFor="journal-date"
              className="block text-sm font-medium text-gray-700 dark:text-gray-800 mb-1"
            >
              {journalTexts.todayCard.dateInputLabel}
            </label>
            <input
              id="journal-date"
              type="date"
              value={dateValue}
              max={today}
              onChange={(e) => onDateChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-400 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-white dark:text-gray-900"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-800 mb-1">
              {journalTexts.todayCard.titleInputLabel}
            </label>
            <input
              type="text"
              value={titleInput}
              onChange={(e) => onTitleChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-400 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-white dark:text-gray-900"
              placeholder={journalTexts.todayCard.titlePlaceholder}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-800 mb-1">
              {journalTexts.todayCard.contentInputLabel}
            </label>
            <textarea
              value={contentInput}
              onChange={(e) => onContentChange(e.target.value)}
              rows={8}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-400 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-white dark:text-gray-900"
              placeholder={journalTexts.todayCard.contentPlaceholder}
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={isEditing ? onUpdate : onSave}
              className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
            >
              {isEditing
                ? journalTexts.todayCard.updateLabel
                : journalTexts.todayCard.saveLabel}
            </button>
            <button
              onClick={onCancel}
              className="px-4 py-2 bg-gray-300 dark:bg-gray-400 text-gray-700 dark:text-gray-900 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors font-medium"
            >
              {journalTexts.todayCard.cancelLabel}
            </button>
          </div>
        </div>
      ) : todayEntry ? (
        <div className="mt-4">
          <div className="flex items-start justify-between">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-900 mb-2">
              {todayEntry.title}
            </h3>
            <button
              onClick={() => onEditEntry(todayEntry)}
              className="text-purple-600 hover:text-purple-700 dark:text-purple-700 dark:hover:text-purple-800 text-sm font-medium ml-2"
            >
              {journalTexts.todayCard.editButtonLabel}
            </button>
          </div>
          <p className="text-gray-700 dark:text-gray-800 whitespace-pre-wrap">
            {todayEntry.content}
          </p>
        </div>
      ) : (
        <p className="text-gray-500 dark:text-gray-600 text-sm mt-2">
          {journalTexts.todayCard.emptyLabel}
        </p>
      )}
    </div>
  );
};
```

- [ ] **Step 5: 過去用の編集カードを実装する**

`src/features/journal/components/JournalEditCard.tsx` を次の内容に置き換える。

```tsx
import type { JournalEntry } from "@/types/routine";
import { CardPanel } from "@/components";
import { formatJournalDate } from "../utils/journalDate";
import journalTexts from "../locales/ja.json";

type JournalEditCardProps = {
  editingEntry: JournalEntry;
  dateInput: string | null;
  today: string;
  titleInput: string;
  contentInput: string;
  onTitleChange: (value: string) => void;
  onContentChange: (value: string) => void;
  onDateChange: (value: string) => void;
  onUpdate: () => void;
  onCancel: () => void;
};

export const JournalEditCard = ({
  editingEntry,
  dateInput,
  today,
  titleInput,
  contentInput,
  onTitleChange,
  onContentChange,
  onDateChange,
  onUpdate,
  onCancel,
}: JournalEditCardProps) => {
  return (
    <CardPanel>
      <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-100 rounded-lg">
        {/* 見出しは編集前の日付のまま（日付欄を変えても変えない） */}
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-900 mb-4">
          {formatJournalDate(editingEntry.date)}
          {journalTexts.editCard.editingLabel}
        </h2>

        <div className="space-y-4">
          <div>
            <label
              htmlFor="edit-journal-date"
              className="block text-sm font-medium text-gray-700 dark:text-gray-800 mb-1"
            >
              {journalTexts.editCard.dateInputLabel}
            </label>
            {/* 再読み込みで dateInput が null に戻っても、編集前の日付として扱う */}
            <input
              id="edit-journal-date"
              type="date"
              value={dateInput ?? editingEntry.date}
              max={today}
              onChange={(e) => onDateChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-400 rounded-lg focus:ring-2 focus:ring-amber-500 dark:bg-white dark:text-gray-900"
            />
          </div>

          <div>
            <label
              htmlFor="edit-journal-title"
              className="block text-sm font-medium text-gray-700 dark:text-gray-800 mb-1"
            >
              {journalTexts.editCard.titleInputLabel}
            </label>
            <input
              id="edit-journal-title"
              type="text"
              value={titleInput}
              onChange={(e) => onTitleChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-400 rounded-lg focus:ring-2 focus:ring-amber-500 dark:bg-white dark:text-gray-900"
              placeholder={journalTexts.editCard.titlePlaceholder}
            />
          </div>

          <div>
            <label
              htmlFor="edit-journal-content"
              className="block text-sm font-medium text-gray-700 dark:text-gray-800 mb-1"
            >
              {journalTexts.editCard.contentInputLabel}
            </label>
            <textarea
              id="edit-journal-content"
              value={contentInput}
              onChange={(e) => onContentChange(e.target.value)}
              rows={8}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-400 rounded-lg focus:ring-2 focus:ring-amber-500 dark:bg-white dark:text-gray-900"
              placeholder={journalTexts.editCard.contentPlaceholder}
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={onUpdate}
              className="flex-1 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors font-medium"
            >
              {journalTexts.editCard.updateLabel}
            </button>
            <button
              onClick={onCancel}
              className="px-4 py-2 bg-gray-300 dark:bg-gray-400 text-gray-700 dark:text-gray-900 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors font-medium"
            >
              {journalTexts.editCard.cancelLabel}
            </button>
          </div>
        </div>
      </div>
    </CardPanel>
  );
};
```

- [ ] **Step 6: 通ることを確かめる**

Run: Step 2 と同じコマンド。
Expected: PASS（3 ファイル）。

### 2b-2: `JournalPage.tsx` から日付を渡し、画面全体で確かめる

- [ ] **Step 7: 画面の失敗するテストを書く**

`src/features/journal/__tests__/JournalPage.test.tsx`（Task 2a で置き換えたもの）の最後の `it` の後に、次の 2 つの `it` を足す。

```tsx
it("過去のエントリの編集カードに日付欄を渡し、変更を handleDateChange へ渡す", () => {
  const handleDateChange = jest.fn();
  mockUseJournalPageState.mockReturnValue(
    createState({
      editingEntry: pastEntry,
      showForm: true,
      titleInput: pastEntry.title,
      contentInput: pastEntry.content,
      dateInput: null,
      handleDateChange,
    }) as never,
  );

  render(<JournalPage />);
  const dateField = screen.getByLabelText("日付");
  expect(dateField).toHaveValue("2026-03-10");
  expect(dateField).toHaveAttribute("max", "2026-03-15");

  fireEvent.change(dateField, { target: { value: "2026-03-08" } });
  expect(handleDateChange).toHaveBeenCalledWith("2026-03-08");
});

it("今日のカードの新規フォームに dateInput を渡し、見出しが選んだ日付に従う", () => {
  const handleDateChange = jest.fn();
  mockUseJournalPageState.mockReturnValue(
    createState({
      todayEntry: null,
      showForm: true,
      dateInput: "2026-03-12",
      handleDateChange,
    }) as never,
  );

  render(<JournalPage />);
  expect(screen.getByLabelText("日付")).toHaveValue("2026-03-12");
  expect(
    screen.getByRole("heading", { level: 2, name: "2026年3月12日(木) の記録" }),
  ).toBeInTheDocument();

  fireEvent.change(screen.getByLabelText("日付"), {
    target: { value: "2026-03-11" },
  });
  expect(handleDateChange).toHaveBeenCalledWith("2026-03-11");
});
```

新しいファイル `src/features/journal/__tests__/JournalPage.dateEdit.test.tsx` を作る（`useJournalPageState` をモックせず、実際の state と jsdom の localStorage で確かめる）。

```tsx
import { fireEvent, render, screen } from "@testing-library/react";
import type { JournalEntry, JournalHistory } from "@/types/routine";
import { JournalPage } from "../JournalPage";
import journalTexts from "../locales/ja.json";

const STORAGE_KEY = "journal-history";

const makeEntry = (id: string, date: string, title: string): JournalEntry => ({
  id,
  date,
  title,
  content: `${title}の本文`,
  createdAt: `${date}T01:00:00.000Z`,
  updatedAt: `${date}T01:00:00.000Z`,
});

const seedHistory = (history: JournalHistory) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
};

const readHistory = (): JournalHistory =>
  JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}") as JournalHistory;

// 過去の記録一覧の見出し（h3）を上から順に返す
const recentTitles = () =>
  screen
    .getAllByRole("heading", { level: 3 })
    .map((heading) => heading.textContent);

describe("JournalPage の日付の選択（実際の state と localStorage）", () => {
  beforeEach(() => {
    localStorage.clear();
    jest.useFakeTimers().setSystemTime(new Date("2026-03-15T12:00:00+09:00"));
    jest.spyOn(window, "alert").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
    localStorage.clear();
  });

  it("過去のエントリの日付を変えて保存すると、一覧の位置と日付の表示が変わり、旧バケットが消える", () => {
    seedHistory({
      "2026-03-12": [makeEntry("a", "2026-03-12", "十二日の記録")],
      "2026-03-10": [makeEntry("b", "2026-03-10", "十日の記録")],
    });
    render(<JournalPage />);
    expect(recentTitles()).toEqual(["十二日の記録", "十日の記録"]);

    fireEvent.click(screen.getAllByRole("button", { name: "✏️ 編集" })[1]);
    const dateField = screen.getByLabelText("日付");
    expect(dateField).toHaveValue("2026-03-10");
    expect(dateField).toHaveAttribute("max", "2026-03-15");
    fireEvent.change(dateField, { target: { value: "2026-03-13" } });
    fireEvent.click(screen.getByRole("button", { name: "更新" }));

    expect(window.alert).not.toHaveBeenCalled();
    expect(recentTitles()).toEqual(["十日の記録", "十二日の記録"]);
    expect(screen.getByText("2026年3月13日(金)")).toBeInTheDocument();
    const history = readHistory();
    expect(history).not.toHaveProperty("2026-03-10");
    expect(history["2026-03-13"]).toEqual([
      expect.objectContaining({
        id: "b",
        date: "2026-03-13",
        title: "十日の記録",
      }),
    ]);
  });

  it("今日のエントリの日付を過去へ移すと、今日の欄が空になり、一覧に移した日付で出る", () => {
    seedHistory({
      "2026-03-15": [makeEntry("t", "2026-03-15", "朝の振り返り")],
    });
    render(<JournalPage />);

    // 今日のカードの編集ボタン（一覧の編集ボタンより先に描画される）
    fireEvent.click(screen.getAllByRole("button", { name: "✏️ 編集" })[0]);
    fireEvent.change(screen.getByLabelText("日付"), {
      target: { value: "2026-03-14" },
    });
    fireEvent.click(screen.getByRole("button", { name: "更新" }));

    expect(
      screen.getByText(journalTexts.todayCard.emptyLabel),
    ).toBeInTheDocument();
    expect(screen.getByText("2026年3月14日(土)")).toBeInTheDocument();
    expect(Object.keys(readHistory())).toEqual(["2026-03-14"]);
  });

  it("編集中に別のエントリを削除して再読み込みが走っても、保存で過去のエントリの日付が今日に書き換わらない", () => {
    jest.spyOn(window, "confirm").mockReturnValue(true);
    seedHistory({
      "2026-03-10": [makeEntry("p", "2026-03-10", "十日の記録")],
      "2026-03-05": [makeEntry("q", "2026-03-05", "五日の記録")],
    });
    render(<JournalPage />);

    fireEvent.click(screen.getAllByRole("button", { name: "✏️ 編集" })[0]);
    fireEvent.click(screen.getAllByRole("button", { name: "🗑️ 削除" })[1]);

    // 再読み込みでタイトル・本文は空に戻るが、日付欄は編集前の日付として表示する
    expect(screen.getByLabelText("本文")).toHaveValue("");
    expect(screen.getByLabelText("日付")).toHaveValue("2026-03-10");

    fireEvent.change(screen.getByLabelText("本文"), {
      target: { value: "打ち直した本文" },
    });
    fireEvent.click(screen.getByRole("button", { name: "更新" }));

    expect(readHistory()).toEqual({
      "2026-03-10": [
        expect.objectContaining({
          id: "p",
          date: "2026-03-10",
          title: journalTexts.page.defaultTitle,
          content: "打ち直した本文",
        }),
      ],
    });
  });

  it("新規追加は書き始めた時点の日付で固定され、日をまたいでから保存しても書き始めた日の記録になる", () => {
    jest.setSystemTime(new Date("2026-03-15T23:59:00+09:00"));
    render(<JournalPage />);

    fireEvent.click(screen.getByRole("button", { name: "➕" }));
    fireEvent.change(screen.getByPlaceholderText(/今日感じたこと/), {
      target: { value: "夜に書き始めた" },
    });

    jest.setSystemTime(new Date("2026-03-16T00:01:00+09:00"));
    fireEvent.click(screen.getByRole("button", { name: "保存" }));

    expect(readHistory()).toEqual({
      "2026-03-15": [
        expect.objectContaining({
          date: "2026-03-15",
          title: journalTexts.page.defaultTitle,
          content: "夜に書き始めた",
        }),
      ],
    });
  });

  it("新規追加で日付欄に過去の日付を選ぶと、見出しがその日付になり、その日付で保存される", () => {
    render(<JournalPage />);
    fireEvent.click(screen.getByRole("button", { name: "➕" }));

    const dateField = screen.getByLabelText("日付");
    expect(dateField).toHaveValue("2026-03-15");
    expect(dateField).toHaveAttribute("max", "2026-03-15");
    fireEvent.change(dateField, { target: { value: "2026-03-10" } });
    expect(
      screen.getByRole("heading", {
        level: 2,
        name: "2026年3月10日(火) の記録",
      }),
    ).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText(/今日感じたこと/), {
      target: { value: "十日のこと" },
    });
    fireEvent.click(screen.getByRole("button", { name: "保存" }));

    expect(Object.keys(readHistory())).toEqual(["2026-03-10"]);
  });

  it("新規追加で日付欄を空・未来にすると保存を拒否し、理由を示してフォームと入力を残す", () => {
    render(<JournalPage />);
    fireEvent.click(screen.getByRole("button", { name: "➕" }));
    fireEvent.change(screen.getByPlaceholderText(/今日感じたこと/), {
      target: { value: "本文" },
    });

    fireEvent.change(screen.getByLabelText("日付"), { target: { value: "" } });
    expect(
      screen.getByRole("heading", {
        level: 2,
        name: journalTexts.todayCard.titleLabel,
      }),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "保存" }));
    expect(window.alert).toHaveBeenLastCalledWith(
      journalTexts.page.alertInvalidDate,
    );

    fireEvent.change(screen.getByLabelText("日付"), {
      target: { value: "2026-03-16" },
    });
    fireEvent.click(screen.getByRole("button", { name: "保存" }));
    expect(window.alert).toHaveBeenLastCalledWith(
      journalTexts.page.alertFutureDate,
    );

    expect(readHistory()).toEqual({});
    expect(screen.getByPlaceholderText(/今日感じたこと/)).toHaveValue("本文");
  });
});
```

- [ ] **Step 8: 落ちることを確かめる**

Run: `npm test -- src/features/journal/__tests__/JournalPage.test.tsx src/features/journal/__tests__/JournalPage.dateEdit.test.tsx --testPathIgnorePatterns=/node_modules/ /firebase-functions/lib/ /e2e/`
Expected: FAIL。`JournalPage.test.tsx` の追加の 2 件（`today` が渡らないので編集カードの日付欄に `max` が無い・`onDateChange` が渡らないので `handleDateChange` が呼ばれない、`dateInput` が渡らないので今日のカードの日付欄と見出しが今日のまま）。`JournalPage.dateEdit.test.tsx` は、日付欄の変更が state へ届かない 1・2・5・6 件目が落ちる。3 件目（編集中の削除）と 4 件目（日をまたぐ）は、日付欄を操作しないので Task 2a の配線で通る（回帰の固定）。

- [ ] **Step 9: `JournalPage.tsx` から日付を渡す**

`src/features/journal/JournalPage.tsx` の `JournalTodayCard` と `JournalEditCard` の props を次にする（他は変えない。`isPastEditing` の判定もそのまま）。

```tsx
<JournalTodayCard
  today={state.today}
  todayEntry={state.todayEntry}
  editingEntry={isPastEditing ? null : state.editingEntry}
  showForm={state.showForm && !isPastEditing}
  titleInput={state.titleInput}
  contentInput={state.contentInput}
  dateInput={state.dateInput}
  onOpenForm={state.openForm}
  onEditEntry={state.openEditForm}
  onTitleChange={state.handleTitleChange}
  onContentChange={state.handleContentChange}
  onDateChange={state.handleDateChange}
  onSave={state.handleSaveEntry}
  onUpdate={state.handleUpdateEntry}
  onCancel={state.handleCancelForm}
/>
```

```tsx
{
  state.showForm && state.editingEntry && isPastEditing && (
    <JournalEditCard
      editingEntry={state.editingEntry}
      dateInput={state.dateInput}
      today={state.today}
      titleInput={state.titleInput}
      contentInput={state.contentInput}
      onTitleChange={state.handleTitleChange}
      onContentChange={state.handleContentChange}
      onDateChange={state.handleDateChange}
      onUpdate={state.handleUpdateEntry}
      onCancel={state.handleCancelForm}
    />
  );
}
```

- [ ] **Step 10: 通ることを確かめる**

Run: Step 8 と同じコマンド。
Expected: PASS（2 ファイル）。

### 2b-3: Storybook

- [ ] **Step 11: ストーリーに日付の props と場面を足す**

`src/features/journal/components/JournalTodayCard.stories.tsx` の 2 行目の import を `import { expect, fireEvent, fn, userEvent, within } from "storybook/test";` にし、`meta.args` に `dateInput: null,` と `onDateChange: fn(),` を足す（`today: "2026-05-21",` の次の行に `dateInput: null,`、`onContentChange: fn(),` の次の行に `onDateChange: fn(),`）。既存のストーリーは変えない。ファイルの末尾に次を足す。

```tsx
/** 新規追加で過去の日付を選んだとき → 見出しが「<日付> の記録」になる */
export const NewEntryPastDate: Story = {
  args: {
    todayEntry: null,
    editingEntry: null,
    showForm: true,
    titleInput: "昨日の振り返り",
    contentInput: "日付をまたいでから書いた。",
    dateInput: "2026-05-20",
  },
};

/** 新規追加で日付欄を空にしたとき → 見出しは「今日の記録」だけ */
export const NewEntryEmptyDate: Story = {
  args: {
    todayEntry: null,
    editingEntry: null,
    showForm: true,
    titleInput: "",
    contentInput: "",
    dateInput: "",
  },
};

/** 今日の記録を編集中に日付を変えたとき → 見出しは今日のまま */
export const EditingEntryDateChanged: Story = {
  args: {
    todayEntry,
    editingEntry: todayEntry,
    showForm: true,
    titleInput: todayEntry.title,
    contentInput: todayEntry.content,
    dateInput: "2026-05-18",
  },
};

/** 日付欄を変更 → onDateChange が選んだ値で呼ばれる */
export const ChangeDate: Story = {
  args: {
    todayEntry: null,
    editingEntry: null,
    showForm: true,
    titleInput: "",
    contentInput: "",
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    fireEvent.change(canvas.getByLabelText("日付"), {
      target: { value: "2026-05-19" },
    });
    expect(args.onDateChange).toHaveBeenCalledWith("2026-05-19");
  },
};
```

`src/features/journal/components/JournalEditCard.stories.tsx` の 2 行目の import を `import { expect, fireEvent, fn, userEvent, within } from "storybook/test";` にし、`meta.args` を次にする。

```tsx
  args: {
    today: "2026-05-21",
    dateInput: null,
    onTitleChange: fn(),
    onContentChange: fn(),
    onDateChange: fn(),
    onUpdate: fn(),
    onCancel: fn(),
  },
```

`Default` の `args` に `dateInput: editingEntry.date,` を足し、ファイルの末尾に次を足す。

```tsx
/** 編集中に日付を変えたとき → 日付欄は選んだ値、見出しは編集前の日付のまま */
export const DateChanged: Story = {
  args: {
    editingEntry,
    titleInput: editingEntry.title,
    contentInput: editingEntry.content,
    dateInput: "2026-05-18",
  },
};

/** 日付欄を変更 → onDateChange が選んだ値で呼ばれる */
export const ChangeDate: Story = {
  args: {
    editingEntry,
    titleInput: editingEntry.title,
    contentInput: editingEntry.content,
    dateInput: editingEntry.date,
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    fireEvent.change(canvas.getByLabelText("日付"), {
      target: { value: "2026-05-19" },
    });
    expect(args.onDateChange).toHaveBeenCalledWith("2026-05-19");
  },
};
```

`src/features/journal/JournalPage.stories.tsx` は変えない（実際の state を使い、データは固定の日付）。

- [ ] **Step 12: ストーリーの型を確かめる**

Run: `npm run typecheck`
Expected: エラー 0 件（`*.stories.tsx` の `satisfies Meta<typeof …>` と各ストーリーの `args` で、必須の props の不足が無い）。

### 2b-4: Task 2b 全体の検証

- [ ] **Step 13: 実装を一時的に書き換えるとテストが落ちることを確かめ、元に戻す**

各項目で、書き換え → `npm test -- src/features/journal --testPathIgnorePatterns=/node_modules/ /firebase-functions/lib/ /e2e/` → 期待どおり落ちることを確認 → 書き換えを元に戻す、を順に行う。

1. `helpers.ts` の `if (!isValidJournalDate(date)) return titleLabel;` の行を消す。Expected: `helpers.test.ts` の空・不正のケース、`JournalTodayCard.test.tsx` の「新規で日付欄が空・不正…」、`JournalPage.dateEdit.test.tsx` の「空・未来にすると…」が落ちる。
2. `JournalTodayCard.tsx` の `const headingDate = showForm && !isEditing ? dateValue : today;` を `const headingDate = dateValue;` に書き換える。Expected: 「編集で日付欄を変えても、見出しは編集前の日付（今日）のまま」が落ちる。
3. `JournalEditCard.tsx` の `value={dateInput ?? editingEntry.date}` を `value={dateInput ?? ""}` に書き換える。Expected: `JournalEditCard.test.tsx` の「dateInput が null…」、`JournalPage.test.tsx` の「過去のエントリの編集カードに日付欄を渡し…」、`JournalPage.dateEdit.test.tsx` の「編集中に別のエントリを削除して…」が落ちる。
4. `JournalPage.tsx` の `JournalEditCard` の `onDateChange={state.handleDateChange}` を `onDateChange={() => {}}` に書き換える。Expected: `JournalPage.test.tsx` の「過去のエントリの編集カードに日付欄を渡し…」と `JournalPage.dateEdit.test.tsx` の「過去のエントリの日付を変えて保存すると…」が落ちる（L-060）。

- [ ] **Step 14: 戻し忘れが無いことを確かめる**

1. 次がそれぞれ 1 行ずつ出ること:
   - `grep -nF "if (!isValidJournalDate(date)) return titleLabel;" src/features/journal/helpers.ts`
   - `grep -nF "const headingDate = showForm && !isEditing ? dateValue : today;" src/features/journal/components/JournalTodayCard.tsx`
   - `grep -nF "value={dateInput ?? editingEntry.date}" src/features/journal/components/JournalEditCard.tsx`
   - `grep -c "onDateChange={state.handleDateChange}" src/features/journal/JournalPage.tsx`（2）
2. `grep -nF "onDateChange={() => {}}" src/features/journal/JournalPage.tsx` が何も出さないこと。

- [ ] **Step 15: Task 2b 全体を検証する**

1. `npx prettier --write src/features/journal/helpers.ts src/features/journal/components/JournalTodayCard.tsx src/features/journal/components/JournalEditCard.tsx src/features/journal/JournalPage.tsx src/features/journal/components/JournalTodayCard.stories.tsx src/features/journal/components/JournalEditCard.stories.tsx src/features/journal/__tests__/helpers.test.ts src/features/journal/__tests__/JournalTodayCard.test.tsx src/features/journal/__tests__/JournalEditCard.test.tsx src/features/journal/__tests__/JournalPage.test.tsx src/features/journal/__tests__/JournalPage.dateEdit.test.tsx`
2. `npm test -- src/features/journal --testPathIgnorePatterns=/node_modules/ /firebase-functions/lib/ /e2e/` → Expected: 全スイート PASS。
3. `npm run typecheck` → Expected: エラー 0 件。
4. `npx eslint --max-warnings 0 src/features/journal` → Expected: 出力なし。
5. `npm run tailwind:scan` → Expected: 省略記法の指摘なし（終了コード 0）。

---

## Task 3: AI エージェント API（`PATCH` の `date`）と 非公開の API 仕様

アプリとは独立したタスク（Task 1〜2b に依存しない）。

**Files:**

- Modify: `firebase-functions/src/agentApi/operations/journal/journalInput.ts`
- Modify: `firebase-functions/src/agentApi/operations/journal/journalOperations.ts`
- Modify: `（非公開の OpenAPI 仕様）`（`components.schemas.JournalEntryPatch`）
- Modify: `（非公開のエージェント API 仕様）`（「本文」の節のジャーナルの行）
- Test: `firebase-functions/src/agentApi/__tests__/journal.test.ts`
- Test: `firebase-functions/src/agentApi/__tests__/operations/journalInput.test.ts`
- Test: `firebase-functions/src/agentApi/__tests__/operations/journalEntity.test.ts`
- 変更しない: `journalEntity.ts`（`applyJournalPatch` は `...patch` で `date` も上書きするので実装の変更は不要。JSDoc は Task 4 で直す）・`journalStore.ts` と `journalStore.test.ts`（既存の `removeEntry`・`addEntry`・`replaceEntry` をそのまま組み合わせて使い、シグネチャも変えない。組み合わせの挙動は `journal.test.ts` で確かめる）

**Interfaces:**

- Consumes: `readDate(body: JsonObject, field: string): string | undefined`（`validation/dateTimeFields.ts`。不正なら `invalid_field` を投げる）・`compact`・`findEntry`・`removeEntry(history, key, id)`・`addEntry(history, entry)`・`replaceEntry(history, key, updated)`
- Produces:
  - `JOURNAL_UPDATE_KEYS = ["date", "title", "content"] as const`
  - `export type JournalPatchInput = Partial<{ date: string; title: string; content: string }>;`
  - ジャーナル更新 API が `{ date?: "YYYY-MM-DD", title?, content? }` を受け付ける（HTTP パス詳細は非公開）

**気をつける知見:**

- 検証は作成（`POST`）と同じ `readDate`（形式と実在。未来は拒否しない）。アプリは未来を拒否し API は許す非対称は意図したもの（テストで固定する）。
- 2-3 節: バケットの移動は、`patch.date !== undefined` かつ `patch.date !== found.key`（`findEntry` が返す実際の置き場所）のときだけ。`updated.date !== key` で比べない（`applyJournalPatch` が `date` を既存値で埋めるので、キーと `entry.date` が食い違う古いデータで `date` を含まない `PATCH` がバケットを移してしまう）。
- 2-4 節: 空の判定は更新後の値（`assertEntryNotBlank(updated.title, updated.content)`）のまま。`date` だけの `PATCH` は `empty_patch` にならない（`compact` の結果に `date` が残る）。
- L-203: `JOURNAL_UPDATE_KEYS` のコメント「日付は変更できない」、OpenAPI の「date は変更不可」、（非公開のエージェント API 仕様） の「日付は変更不可」を実装に合わせて直す（`applyJournalPatch` の JSDoc は Task 4）。
- `firebase-functions` は別の `package.json`。このワークツリーは `firebase-functions/node_modules` をリンクしているので、テストはルートの Jest、型は `npm run typecheck:functions`（exit 0 が基準）で確かめる（Global Constraints）。`npm --prefix firebase-functions run build` は `lib/` を書き換えるので実行しない。

- [ ] **Step 1: 作業前の型エラーの件数を記録する**

Run: `npm run typecheck:functions 2>&1 | grep -c "error TS"`
Expected: `0`（2026-11-03 時点。`firebase-functions/node_modules` をリンクしているので、`error TS` は 0 件で exit 0。0 以外なら作業前から壊れているので、先に報告して止まる）。
Run: `npm run typecheck:functions 2>&1 | grep -E "operations/journal/|__tests__/journal\.test|__tests__/operations/journal"`
Expected: 何も出ない。

- [ ] **Step 2: 入力の検証の失敗するテストを書く**

`firebase-functions/src/agentApi/__tests__/operations/journalInput.test.ts` の `describe("parseJournalPatchInput", …)` の中（「文字種・長さの違反は 400 invalid_field」の後）に、次の 3 つの `it` を足す。

```ts
it("date を指定すると、作成と同じ検証をして返す（date だけでも empty_patch にしない）", () => {
  expect(parseJournalPatchInput({ date: "2026-10-02" })).toEqual({
    date: "2026-10-02",
  });
  expect(parseJournalPatchInput({ date: "2026-10-02", title: "題" })).toEqual({
    date: "2026-10-02",
    title: "題",
  });
});

it("閏日や 100 年未満の date も、実在すれば通す", () => {
  expect(parseJournalPatchInput({ date: "2028-02-29" })).toEqual({
    date: "2028-02-29",
  });
  expect(parseJournalPatchInput({ date: "0050-01-01" })).toEqual({
    date: "0050-01-01",
  });
});

it("date の形式不正・実在しない日付・文字列以外は 400 invalid_field", () => {
  for (const date of ["2026/10/02", "2026-02-30", "2026-04-31", "", 20261002]) {
    expectApiError(
      () => parseJournalPatchInput({ date }),
      400,
      "invalid_field",
    );
  }
});
```

`firebase-functions/src/agentApi/__tests__/operations/journalEntity.test.ts` の「id・date・createdAt は変更しない」を次の 2 つの `it` に置き換える。

```ts
it("date を含まないパッチは、id・date・createdAt を変更しない", () => {
  const updated = applyJournalPatch(existing, { title: "夜" }, later);
  expect(updated.id).toBe(existing.id);
  expect(updated.date).toBe(existing.date);
  expect(updated.createdAt).toBe(existing.createdAt);
});

it("date を含むパッチは date を変え、id・createdAt は保つ", () => {
  const updated = applyJournalPatch(existing, { date: "2026-09-20" }, later);
  expect(updated).toEqual({
    ...existing,
    date: "2026-09-20",
    updatedAt: later.toISOString(),
  });
});
```

- [ ] **Step 3: 落ちることを確かめる**

Run: `npm test -- firebase-functions/src/agentApi/__tests__/operations/journalInput.test.ts firebase-functions/src/agentApi/__tests__/operations/journalEntity.test.ts --testPathIgnorePatterns=/node_modules/ /firebase-functions/lib/ /e2e/`
Expected: `journalInput.test.ts` の追加の 3 件が FAIL（`date` が `compact` に無いので `{}` → `empty_patch`、不正な `date` でも `invalid_field` にならず `empty_patch`）。`journalEntity.test.ts` は実行時には通る（`...patch` で `date` も反映されるため。`JournalPatchInput` に `date` が無いことによる型の誤りは Step 6 の `typecheck:functions` で確かめる）。

- [ ] **Step 4: 入力の検証を実装する**

`firebase-functions/src/agentApi/operations/journal/journalInput.ts` の 12〜13 行目と 46〜58 行目を次にする（`JOURNAL_CREATE_KEYS`・`assertEntryNotBlank`・`parseCreateJournalInput` は変えない）。

```ts
/** ジャーナル更新の本文に指定できるキー（date を指定すると、記録の日付を変えてその日付のバケットへ移す） */
export const JOURNAL_UPDATE_KEYS = ["date", "title", "content"] as const;
```

```ts
export type JournalPatchInput = Partial<{
  date: string;
  title: string;
  content: string;
}>;

/**
 * 更新用の本文を検証する。空の本文は 400 empty_patch。
 * date は作成と同じ検証（形式と実在。未来の日付も受け付ける）
 */
export const parseJournalPatchInput = (
  input: JsonObject,
): JournalPatchInput => {
  const patch = compact({
    date: readDate(input, "date"),
    title: readString(input, "title", TITLE_OPTIONS),
    content: readString(input, "content", CONTENT_OPTIONS),
  });
  if (Object.keys(patch).length === 0) throw emptyPatch();
  return patch;
};
```

- [ ] **Step 5: 通ることを確かめる**

Run: Step 3 と同じコマンド。
Expected: PASS（2 ファイル）。

- [ ] **Step 6: 操作（バケットの移動）の失敗するテストを書く**

`firebase-functions/src/agentApi/__tests__/journal.test.ts` の `describe("journalOperations.update", …)` の中を、次のように直す。

1. 「date の変更は未対応(400)、存在しない ID は 404、空パッチは 400」を、次の `it` に置き換える。

```ts
it("存在しない ID は 404、空パッチは 400、指定できないキーは 400", () => {
  const data = { journalHistory: { "2026-10-01": [entry] } };
  expect(() =>
    journalOperations.update(
      context({ data, id: "nope", body: { title: "a" } }),
    ),
  ).toThrow(expect.objectContaining({ status: 404 }));
  expect(() =>
    journalOperations.update(context({ data, id: "journal-1", body: {} })),
  ).toThrow(expect.objectContaining({ code: "empty_patch" }));
  expect(() =>
    journalOperations.update(
      context({ data, id: "journal-1", body: { createdAt: "x" } }),
    ),
  ).toThrow(expect.objectContaining({ code: "unknown_field" }));
});
```

2. 「バケットキーと entry.date が食い違っていてもキーを使って更新できる」の `it` の名前を `"バケットキーと entry.date が食い違うデータに date を含まない PATCH をしても、バケットを移さずキーを使って更新する"` に変える（本文は変えない）。

3. 同じ `describe` の最後に、次の 6 つの `it` を足す。

```ts
it("date を変えると旧バケットから除いて新しい日付の末尾へ移し、空になった旧キーは消す（date だけの PATCH）", () => {
  const destination = { ...entry, id: "journal-2", date: "2026-09-20" };
  const outcome = journalOperations.update(
    context({
      data: {
        journalHistory: {
          "2026-10-01": [entry],
          "2026-09-20": [destination],
        },
      },
      id: "journal-1",
      body: { date: "2026-09-20" },
    }),
  );
  const moved = {
    ...entry,
    date: "2026-09-20",
    updatedAt: NOW.toISOString(),
  };
  expect(outcome.status).toBe(200);
  expect(outcome.body).toEqual({ entry: moved });
  expect(outcome.changes).toEqual({
    journalHistory: { "2026-09-20": [destination, moved] },
  });
});

it("旧バケットに他のエントリがあれば残す", () => {
  const sameDay = { ...entry, id: "journal-3" };
  const outcome = journalOperations.update(
    context({
      data: { journalHistory: { "2026-10-01": [entry, sameDay] } },
      id: "journal-1",
      body: { date: "2026-09-28" },
    }),
  );
  expect(outcome.changes).toEqual({
    journalHistory: {
      "2026-10-01": [sameDay],
      "2026-09-28": [
        { ...entry, date: "2026-09-28", updatedAt: NOW.toISOString() },
      ],
    },
  });
});

it("date と title / content を同時に変えられる", () => {
  const outcome = journalOperations.update(
    context({
      data: { journalHistory: { "2026-10-01": [entry] } },
      id: "journal-1",
      body: { date: "2026-09-30", title: "夜", content: "読書" },
    }),
  );
  expect(outcome.changes).toEqual({
    journalHistory: {
      "2026-09-30": [
        {
          ...entry,
          date: "2026-09-30",
          title: "夜",
          content: "読書",
          updatedAt: NOW.toISOString(),
        },
      ],
    },
  });
});

it("未来の date も受け付ける（アプリは未来を拒否するが、API は作成と同じ検証にそろえる）", () => {
  const outcome = journalOperations.update(
    context({
      data: { journalHistory: { "2026-10-01": [entry] } },
      id: "journal-1",
      body: { date: "2099-12-31" },
    }),
  );
  expect((outcome.body as { entry: { date: string } }).entry.date).toBe(
    "2099-12-31",
  );
});

it("date の形式不正・実在しない日付は 400 invalid_field で、履歴を変えない", () => {
  const data = { journalHistory: { "2026-10-01": [entry] } };
  for (const date of ["2026/10/02", "2026-02-30"]) {
    expect(() =>
      journalOperations.update(
        context({ data, id: "journal-1", body: { date } }),
      ),
    ).toThrow(expect.objectContaining({ status: 400, code: "invalid_field" }));
  }
  expect(data.journalHistory["2026-10-01"]).toEqual([entry]);
});

it("キーと entry.date が食い違うデータで date がキーと同じなら、移さずに entry.date を直す", () => {
  const mismatched = { ...entry, date: "2026-09-30" };
  const outcome = journalOperations.update(
    context({
      data: { journalHistory: { "2026-10-01": [mismatched] } },
      id: "journal-1",
      body: { date: "2026-10-01" },
    }),
  );
  expect(outcome.changes).toEqual({
    journalHistory: {
      "2026-10-01": [
        { ...mismatched, date: "2026-10-01", updatedAt: NOW.toISOString() },
      ],
    },
  });
});
```

- [ ] **Step 7: 落ちることを確かめる**

Run: `npm test -- firebase-functions/src/agentApi/__tests__/journal.test.ts --testPathIgnorePatterns=/node_modules/ /firebase-functions/lib/ /e2e/`
Expected: FAIL。移動のテスト（「date を変えると…」「旧バケットに他の…」「date と title / content を同時に…」）が、`replaceEntry` で旧キーのまま置き換えられる差分で落ちる。「キーと同じなら…」「未来の date…」「形式不正…」と、名前を変えた食い違いのテストは通る（回帰の固定）。

- [ ] **Step 8: バケットの移動を実装する**

`firebase-functions/src/agentApi/operations/journal/journalOperations.ts` の import に型を足し、`update` を次にして、その上に `writeUpdatedEntry` を置く（`list`・`create`・`remove` は変えない）。

```ts
import type { JournalEntry, JournalHistory } from "./journalTypes";
```

```ts
/**
 * 更新後のエントリを履歴へ書き戻す。
 * date が指定され、実際の置き場所（findEntry のキー）と違うときだけ、
 * 旧バケットから除き（空ならキーを消す）、新しい日付のバケットの末尾へ移す。
 * それ以外はキーのバケットの中で置き換える。applyJournalPatch が date を既存値で埋めるため、
 * updated.date ではなく patchDate で判断する（キーと date が食い違うデータで、
 * date を含まない PATCH がバケットを移さない）。
 */
const writeUpdatedEntry = (
  history: JournalHistory,
  key: string,
  updated: JournalEntry,
  patchDate: string | undefined,
): JournalHistory =>
  patchDate !== undefined && patchDate !== key
    ? addEntry(removeEntry(history, key, updated.id), updated)
    : replaceEntry(history, key, updated);

const update: Operation = ({ data, id, body, now }) => {
  const input = parseBody(body, JOURNAL_UPDATE_KEYS);
  const history = readHistory(data);
  const found = findEntry(history, id);
  if (!found) throw notFound("ジャーナル");

  const patch = parseJournalPatchInput(input);
  const updated = applyJournalPatch(found.entry, patch, now);
  assertEntryNotBlank(updated.title, updated.content);
  return okOutcome(
    { entry: updated },
    toJournalChanges(
      writeUpdatedEntry(history, found.key, updated, patch.date),
    ),
  );
};
```

- [ ] **Step 9: 通ることを確かめる**

Run: `npm test -- firebase-functions/src/agentApi/__tests__/journal.test.ts firebase-functions/src/agentApi/__tests__/operations/journalInput.test.ts firebase-functions/src/agentApi/__tests__/operations/journalEntity.test.ts firebase-functions/src/agentApi/__tests__/operations/journalStore.test.ts firebase-functions/src/agentApi/__tests__/router.test.ts firebase-functions/src/agentApi/__tests__/operations/operationsIndex.test.ts --testPathIgnorePatterns=/node_modules/ /firebase-functions/lib/ /e2e/`
Expected: PASS（6 ファイル）。

- [ ] **Step 10: 実装を一時的に書き換えるとテストが落ちることを確かめ、元に戻す**

各項目で、書き換え → Step 9 のコマンド → 期待どおり落ちることを確認 → 書き換えを元に戻す。

1. `writeUpdatedEntry` の `patchDate !== undefined && patchDate !== key` を `patchDate !== undefined && patchDate === key` に書き換える。Expected: 移動の 3 件と「キーと同じなら…」が落ちる。
2. 同じ条件を `updated.date !== key` に書き換える。Expected: 名前を変えた「…date を含まない PATCH をしても、バケットを移さず…」が落ちる（2-3 節の回帰）。
3. `journalInput.ts` の `JOURNAL_UPDATE_KEYS` から `"date", ` を消す。Expected: `journal.test.ts` の date を含むテストが `unknown_field` で落ちる。

- [ ] **Step 11: 戻し忘れが無いことを確かめる**

1. `grep -nF "patchDate !== undefined && patchDate !== key" firebase-functions/src/agentApi/operations/journal/journalOperations.ts` が 1 行、`grep -nF 'JOURNAL_UPDATE_KEYS = ["date", "title", "content"] as const;' firebase-functions/src/agentApi/operations/journal/journalInput.ts` が 1 行を出すこと。
2. `grep -nF "updated.date !== key" firebase-functions/src/agentApi/operations/journal/journalOperations.ts` と `grep -nF "patchDate === key" firebase-functions/src/agentApi/operations/journal/journalOperations.ts` が何も出さないこと。
3. Step 9 のコマンドを再実行して PASS。

- [ ] **Step 12: 非公開の API 仕様を直す**

公開リポジトリ外に保管している OpenAPI / エージェント API 手順書を、実装に合わせて更新する（`JournalEntryPatch` に `date` を足す。パッチ本文の説明も同様）。スキーマ本文は公開プランに載せない。

- [ ] **Step 13: Task 3 全体を検証する**

1. `npx prettier --write firebase-functions/src/agentApi/operations/journal/journalInput.ts firebase-functions/src/agentApi/operations/journal/journalOperations.ts firebase-functions/src/agentApi/__tests__/journal.test.ts firebase-functions/src/agentApi/__tests__/operations/journalInput.test.ts firebase-functions/src/agentApi/__tests__/operations/journalEntity.test.ts （非公開の OpenAPI 仕様） （非公開のエージェント API 仕様）`
2. Step 9 のコマンド → Expected: PASS。
3. `npm run typecheck:functions 2>&1 | grep -c "error TS"` → Expected: `0`（Step 1 と同じ。`error TS` が 0 件）。
4. `npm run typecheck:functions 2>&1 | grep -E "operations/journal/|__tests__/journal\.test|__tests__/operations/journal"` → Expected: 何も出ない（`JournalPatchInput` に `date` を足したので、`journalEntity.test.ts` の `{ date: "2026-09-20" }` も型が通る）。
5. `npx eslint --max-warnings 0 firebase-functions/src/agentApi/operations/journal firebase-functions/src/agentApi/__tests__/journal.test.ts firebase-functions/src/agentApi/__tests__/operations` → Expected: 出力なし。
6. `grep -rn "日付は変更\|date は変更" docs/04-reference firebase-functions/src` → Expected: 何も出ない（L-203）。

---

## Task 4（最終）: 説明・手動確認表・JSDoc と全体の検証

**Files:**

- Modify: `docs/04-reference/features.md`（「### 📔 ジャーナル」の節）
- Modify: `docs/03-testing/test-matrix.md`（「## 3. ジャーナル」の表の 3-1 と 3-6 の行）
- Modify: `src/features/test-matrix/initialData.ts`（`id: "3-1"` と `id: "3-6"` の `label`）
- Modify: `src/features/test-matrix/detailed-test-cases/group-01-04.ts`（`"3-1"` に 2 件、`"3-6"` に 4 件を追加）
- Modify: `firebase-functions/src/agentApi/operations/journal/journalEntity.ts`（`applyJournalPatch` の JSDoc だけ）
- Test: `src/features/test-matrix/__tests__/initialData.test.ts`（変更なし。通ることを確かめる）
- 変更しない: `3-2`（「1 日 1 エントリ」の記述は実態とずれているが範囲外）

**Interfaces:**

- Consumes: Task 1〜3 の挙動（説明の内容）
- Produces: なし

**気をつける知見:**

- L-203: 説明・手動確認表・JSDoc を実装に合わせる（「日付は変えられない」前提の記述を残さない）。
- 手動確認表の ID は既存の連番の次（`3-1-4`・`3-1-5`、`3-6-4`〜`3-6-7`）。既存の ID は変えない（保存済みのチェック状態のキーのため）。
- 既知の制約（直さない）: 確認表の保存済みデータは `mergeStoredTestMatrixCategories` が `{ ...item, ...savedItem }` で保存値を優先するため、以前にチェックを保存した端末では 3-1・3-6 の項目名が古いまま表示されることがある（`label` も保存されているため）。今回の範囲外。

- [ ] **Step 1: features.md のジャーナルの節を直す**

`docs/04-reference/features.md` の「### 📔 ジャーナル」の「**主な機能**」の箇条書きと「**技術仕様**」の箇条書きを次にする（「**使用例**」と見出し・導入文は変えない）。

```markdown
**主な機能**

- 今日の記録入力
  - タイトル（任意、未入力時は"無題"）
  - 本文（必須）
  - 日付（既定は今日。今日までの日付を選べる。未来の日付・空の日付では保存できない）
  - 書き始めた時点の日付で固定（日をまたいでから保存しても、書き始めた日の記録になる）
- 過去の記録一覧表示（日付の新しい順。同じ日付は更新の新しい順）
- 記録の編集・削除
  - 編集でも日付を変えられる（今日の記録・過去の記録とも）。変えた日付に既に記録があっても、確認なしで同じ日付に並ぶ
- 最終更新時刻の表示
```

```markdown
**技術仕様**

- ファイル: `src/features/journal/`
- データ保存: LocalStorage（キー: `journal-history`。日付ごとの配列。日付を変えると、その日付の配列の末尾へ移る）
- Firestore同期対応
- AI エージェント API 対応（`PATCH` で `date` も変更できる。HTTP パス詳細は非公開）
- ステータス: 正式機能
```

- [ ] **Step 2: test-matrix.md の 3-1 と 3-6 を直す**

`docs/03-testing/test-matrix.md` の「## 3. ジャーナル（Journal）✅」の表で、3-1 と 3-6 の行を次にする（3-2〜3-5 は変えない）。

```markdown
| 3-1 | 日記の新規作成 | 🔶 | ⬜ | ⬜ | タイトル＋本文＋日付（今日まで） |
| 3-6 | 過去エントリの編集・日付の変更（JournalEditCard） | 🔶 | ⬜ | ⬜ | 履歴から編集ボタン。日付の変更は今日の記録の編集でも可 |
```

続けて、表の列幅をそろえる: `npx prettier --write docs/03-testing/test-matrix.md`

- [ ] **Step 3: アプリ内の確認表（initialData.ts）の項目名を直す**

`src/features/test-matrix/initialData.ts` の `id: "3-1"` の `label` を `"日記の新規作成（タイトル＋本文＋日付）"` に、`id: "3-6"` の `label` を `"過去エントリの編集・日付の変更（JournalEditCard）"` にする（`pc`・`sp`・`note` は変えない）。

- [ ] **Step 4: 詳細の確認ケース（group-01-04.ts）を足す**

`src/features/test-matrix/detailed-test-cases/group-01-04.ts` の `"3-1": [` の配列の末尾（`id: "3-1-3"` の要素の後）に、次の 2 要素を足す。

```ts
    {
      id: "3-1-4",
      scenario: "新規追加の日付欄で過去の日付を選んで保存",
      expected:
        "見出しが「<日付> の記録」になり、選んだ日付の記録として保存され、過去の記録一覧のその日付の位置に表示される",
      pc: "unchecked",
      sp: "unchecked",
      note: "",
    },
    {
      id: "3-1-5",
      scenario: "新規追加の日付欄を空にする・未来の日付を入力して保存",
      expected:
        "保存されず理由のメッセージが表示される（フォームと入力は残る）。日付の選択画面では今日より後を選べない",
      pc: "unchecked",
      sp: "unchecked",
      note: "",
    },
```

同じファイルの `"3-6": [` の配列の末尾（`id: "3-6-3"` の要素の後）に、次の 4 要素を足す。

```ts
    {
      id: "3-6-4",
      scenario: "過去エントリの日付を別の過去の日付に変えて保存",
      expected:
        "過去の記録一覧で新しい日付の位置へ移り、日付の表示が変わる。編集カードの見出しは保存まで編集前の日付のまま",
      pc: "unchecked",
      sp: "unchecked",
      note: "",
    },
    {
      id: "3-6-5",
      scenario: "今日のエントリを編集し、日付を過去に変えて保存",
      expected:
        "今日の欄が「まだ今日の記録はありません」になり、過去の記録一覧の選んだ日付に表示される",
      pc: "unchecked",
      sp: "unchecked",
      note: "",
    },
    {
      id: "3-6-6",
      scenario: "既に記録がある日付へ変えて保存",
      expected:
        "確認なしで保存され、同じ日付の記録として両方が一覧に表示される",
      pc: "unchecked",
      sp: "unchecked",
      note: "",
    },
    {
      id: "3-6-7",
      scenario: "編集で日付を空にする・未来の日付を入力して更新",
      expected:
        "更新されず理由のメッセージが表示される（編集カードと入力は残る）。日付を変えずにタイトル・本文だけ直す更新はできる",
      pc: "unchecked",
      sp: "unchecked",
      note: "",
    },
```

- [ ] **Step 5: `applyJournalPatch` の JSDoc を直す**

`firebase-functions/src/agentApi/operations/journal/journalEntity.ts` の 21 行目の JSDoc を次にする（実装は変えない）。

```ts
/**
 * 既存のジャーナルへパッチを適用し、updatedAt を現在時刻にする。
 * createdAt は保つ。date はパッチに含まれるときだけ変える
 * （バケットの移動は journalOperations の update が行う）。
 */
```

- [ ] **Step 6: 確認表と説明の検証をする**

1. `npx prettier --write docs/04-reference/features.md src/features/test-matrix/initialData.ts src/features/test-matrix/detailed-test-cases/group-01-04.ts firebase-functions/src/agentApi/operations/journal/journalEntity.ts`
2. `npm test -- src/features/test-matrix firebase-functions/src/agentApi/__tests__/operations/journalEntity.test.ts --testPathIgnorePatterns=/node_modules/ /firebase-functions/lib/ /e2e/` → Expected: PASS（`initialData.test.ts` の「すべての項目が unchecked・note が空」も通る）。
3. `grep -n '"3-1-4"\|"3-1-5"\|"3-6-4"\|"3-6-5"\|"3-6-6"\|"3-6-7"' src/features/test-matrix/detailed-test-cases/group-01-04.ts` → Expected: 6 行（ID の重複が無いこと: `grep -o 'id: "3-[16]-[0-9]*"' src/features/test-matrix/detailed-test-cases/group-01-04.ts | sort | uniq -d` が何も出さない）。
4. `grep -n "日付は変更\|date は保つ\|createdAt と date" docs/04-reference firebase-functions/src -r` → Expected: 何も出ない。

- [ ] **Step 7: 全体の検証をする**

1. `npm run typecheck` → Expected: エラー 0 件・終了コード 0。
2. `npm run typecheck:functions 2>&1 | grep -c "error TS"` → Expected: `0`（Task 3 の Step 1 の値）。`npm run typecheck:functions 2>&1 | grep -E "operations/journal/|__tests__/journal\.test|__tests__/operations/journal"` → Expected: 何も出ない。
3. `npm test -- --testPathIgnorePatterns=/node_modules/ /firebase-functions/lib/ /e2e/ 2>&1 | grep -E "^FAIL|^Tests:|^Test Suites:" | sort -u` → Expected: `FAIL` が 1 件も無い。`Tests:` に `failed` が無く、passed の件数がベースライン（6474）より増えている。
4. `npm run lint` → Expected: 出力なし・終了コード 0。
5. `npm run tailwind:scan` → Expected: 指摘なし・終了コード 0。
6. `npm run format:check` → Expected: 警告は `.claude/dev-flow/state.json` だけ（作業前からの既存。触らない）。
7. `npm run build` → Expected: ビルドが成功する（`.env.local` は作らない。Firebase の設定が無い状態でビルドできる）。
8. `git status --short` → Expected: 変更・追加は次だけ。
   - Task 1: `src/features/journal/storageEntries.ts`・`utils/journalDate.ts`・`locales/ja.json`・`__tests__/storage.test.ts`・`__tests__/journalDate.test.ts`
   - Task 2a: Task 2a の Files に挙げたソース 20 ファイルとテスト 24 ファイル（新規の `useJournalPageFormState.dateLock.test.tsx` を含む）
   - Task 2b: `helpers.ts`・`components/JournalTodayCard.tsx`・`components/JournalEditCard.tsx`・`JournalPage.tsx`・2 つの stories・`__tests__/helpers.test.ts`（新規）・`__tests__/JournalPage.dateEdit.test.tsx`（新規）・`__tests__/JournalTodayCard.test.tsx`・`__tests__/JournalEditCard.test.tsx`・`__tests__/JournalPage.test.tsx`
   - Task 3: `journalInput.ts`・`journalOperations.ts`・`journal.test.ts`・`journalInput.test.ts`・`journalEntity.test.ts`・（非公開の OpenAPI 仕様）・（非公開のエージェント API 仕様）
   - Task 4: `features.md`・`test-matrix.md`・`initialData.ts`・`group-01-04.ts`・`journalEntity.ts`
   - 未追跡の設計書 `docs/superpowers/specs/2026-11-03-journal-edit-date-design.md` とこのプラン
   - `.env.local`・`firebase-functions/lib/` が増えていないこと（`firebase-functions/node_modules` のリンクは `.git/info/exclude` で対象外なので `git status` に出ない）。
9. 一時的な書き換えの戻し忘れの最終確認: `grep -rnF -e "|| true" -e "2000-01-01" -e "date as string" -e "patchDate === key" -e "updated.date !== key" -e "onDateChange={() => {}}" src/features/journal firebase-functions/src/agentApi/operations/journal` → Expected: 何も出ない。

コミット・プッシュはしない（後の工程で行う）。

---

## Self-Review

設計書（`docs/superpowers/specs/2026-11-03-journal-edit-date-design.md`）と照らし合わせた結果。

**要件の対応**

| 設計書の要件                                                                                                  | タスク                                                    |
| ------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| `updateJournalEntry(entryId, title, content, date?)`・実際の置き場所を正とする・1 回の書き込み                | Task 1 Step 1〜5                                          |
| `date` 省略で `entry.date` も位置も触らない（L-454）・キーと同じ `date` は位置そのままで `entry.date` を直す  | Task 1 Step 1（4・5 件目）・Step 5                        |
| 旧バケットが空なら消す・変更先の末尾・共存・`updatedAt` 更新・`createdAt` 据え置き・ID が無ければ変えない     | Task 1 Step 1                                             |
| `getJournalDateError`・`isValidJournalDate`・`setUTCFullYear`（1-3 節）・閏日・4/31・年 0050                  | Task 1 Step 6〜10                                         |
| `formatJournalDate` が不正な入力で例外・`Invalid Date` にならず入力を返す                                     | Task 1 Step 6・8                                          |
| 文言（日付ラベル・`<日付> の記録`・`page.alertInvalidDate`・`page.alertFutureDate`）                          | Task 1 Step 11                                            |
| `dateInput: string \| null`（5-1 節）・`null` / `""` / 選んだ値                                               | Task 2a 2a-1                                              |
| UI 用ハンドラと素のセッターの分離・最初の変更で固定・固定する日付を関数更新の外で 1 回取る                    | Task 2a 2a-2（`createJournalInputChangeHandlers`）        |
| 新規はその時点の `getTodayDateString()`・編集は `editingEntry.date`・日付欄の変更は固定しない                 | Task 2a Step 5・7、`dateLock` テスト                      |
| 開く・閉じる・保存・削除・再読み込みで `null` に戻す・リセットは固定を起こさない                              | Task 2a 2a-1〜2a-3、`dateLock` テスト                     |
| 編集中の削除で `null` に戻っても過去の日付が今日にならない                                                    | Task 2a `dateLock` テスト・Task 2b `JournalPage.dateEdit` |
| `journalPageStateResult` から素のセッターを外す                                                               | Task 2a 2a-5                                              |
| 今日を入口で 1 回だけ取る（L-508）・新規は常に検証・`dateInput ?? today`                                      | Task 2a 2a-4                                              |
| 編集は日付を変えたときだけ検証し、日付を渡す（変えないときは省略）                                            | Task 2a 2a-4（`mock.calls[0]` の長さ 3）                  |
| 拒否は `alert`・入力とフォームを残す                                                                          | Task 2a Step 13・Task 2b `JournalPage.dateEdit`           |
| 日付欄（`type="date"`・`max` に今日・`value` の解決）を両カードに                                             | Task 2b 2b-1                                              |
| 見出し（新規だけ日付欄に従う・空/不正は `今日の記録`・編集は編集前の日付）                                    | Task 2b Step 1・3・4                                      |
| フォームの選択は編集開始時のエントリの日付（`isPastEditing` のまま）                                          | Task 2b（`JournalPage.tsx` の判定を変えない）             |
| 過去のエントリの日付を変えると一覧の位置が変わる・今日のエントリを過去へ移すと今日の欄が空                    | Task 2b `JournalPage.dateEdit`                            |
| Storybook（固定の日付。L-502）                                                                                | Task 2b 2b-3                                              |
| API: `JOURNAL_UPDATE_KEYS`・`readDate`・`patch.date` とキーの比較での移動・未来を許す・`empty_patch` にしない | Task 3 Step 2〜11                                         |
| OpenAPI・（非公開のエージェント API 仕様）                                                                                       | Task 3 Step 12                                            |
| `features.md`・手動確認表 3 か所（3-1・3-6。3-2 は触れない）・`applyJournalPatch` の JSDoc                    | Task 4 Step 1〜5                                          |
| 全体の検証（typecheck・test・lint・Prettier・build・functions）                                               | Task 4 Step 7                                             |

**名前・型の一致の確認**: `dateInput: string | null`・`setDateInput: Dispatch<SetStateAction<string | null>>`・`handleTitleChange` / `handleContentChange` / `handleDateChange: (value: string) => void`・`onDateChange`（カードの props）・`originalDate: string`・`today: string`・`dateAlertMessages: JournalDateAlertMessages`（`{ invalid; future }`）・`getJournalTodayCardHeading(date, today)`・`createJournalInputChangeHandlers({ editingEntry, getToday, setTitleInput, setContentInput, setDateInput })` を、定義したタスクと使うタスクで同じ名前・同じ形にそろえた。

**プレースホルダー**: 「TBD」「適切に」「同様に」などの省略は無い。コードの Step にはすべてコードを載せた。
