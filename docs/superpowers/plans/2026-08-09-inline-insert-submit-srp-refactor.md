# InlineInsertForm の送信処理を単一責任にリファクタ 実装プラン

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans（このプランは1タスクのみのため、subagent-driven-developmentは不要）。ステップはチェックボックス（`- [ ]`）で進捗管理する。

**Goal:** main ブランチから変更されている箇所を対象に単一責任原則（SRP）の観点で洗い出し、違反箇所をリファクタする。リファクタ対象コードのユニットテストも拡充する。

**Architecture:** 洗い出しの結果、SRP改善が必要なのは `InlineInsertForm.tsx` のみ。ソフトウェアキーボード対応の実装時に、プレゼンテーションコンポーネントであるはずの同ファイルへ「入力バリデーション」と「blurという副作用の発火順序の制御」が混入した。これを送信処理専用のフック `useInlineInsertSubmit` へ切り出し、コンポーネントは描画と配線のみを担うようにする。

**Tech Stack:** React 19, TypeScript, Jest, React Testing Library

## Global Constraints

- リファクタは振る舞いを変えない。既存15件のテストはすべて元のアサーション内容のまま通過すること
- 「空のタイトル」の判定は、このリポジトリの正典である `normalizeTitle`（`todoListTitleNormalization.ts`）に一本化する
- 既存のフック命名・配置規約（`src/features/todo-lists/useXxx.ts`）に従うこと
- 自動コミットはしない

---

## 洗い出し結果

main ブランチとの差分ファイル一覧と、SRP観点での判定:

| ファイル                                                                | 種別           | 判定                                                                                                        |
| ----------------------------------------------------------------------- | -------------- | ----------------------------------------------------------------------------------------------------------- |
| `docs/superpowers/plans/2026-08-09-todo-add-blur-keyboard.md`           | ドキュメント   | 対象外                                                                                                      |
| `src/features/todo-lists/todoListPageViewActions.ts`                    | ロジック       | 対象外（`focusInput` → `blurInput` のリネームのみ。関数は「入力から追加を実行する」という単一の責務を維持） |
| `src/features/todo-lists/useTodoListDetailAddAction.ts`                 | フック         | 対象外（`.focus()` → `.blur()` の変更のみ。「追加アクションを組み立てる」という単一の責務を維持）           |
| `src/features/todo-lists/__tests__/todoListPageViewActions.test.ts`     | テスト         | 対象外（リネーム追従のみ）                                                                                  |
| `src/features/todo-lists/__tests__/useTodoListDetailAddAction.test.tsx` | テスト         | 対象外（リネーム追従のみ）                                                                                  |
| `src/features/todo-lists/__tests__/InlineInsertForm.test.tsx`           | テスト         | 対象外（テストケース追加のみ。モックインフラの混在なし）                                                    |
| `src/features/todo-lists/InlineInsertForm.tsx`                          | コンポーネント | **対象**（下記参照）                                                                                        |

### `InlineInsertForm.tsx` のSRP違反

今回の変更で、このプレゼンテーションコンポーネントが以下3つの責務を抱えるようになった。

1. **描画**（本来の責務）— input・追加ボタン・キャンセルボタンのマークアップ
2. **入力バリデーション**（新たに混入）— `if (!inputText.trim()) return;` と `disabled={!inputText.trim()}`
3. **副作用の順序制御**（新たに混入）— 「バリデーション成功を確認 → blur → onAddAction」という手順と、その理由を説明する12行のコメント

問題点は3つ:

- **同一ファイル内で `!inputText.trim()` が2箇所に重複**（33行目のガードと67行目の `disabled`）。片方だけ条件を変えると、ボタンは押せないのにEnterでは通る（またはその逆）という不整合が生じる。
- **「空のタイトル」の判定方法がリポジトリの正典と分岐している**。`todoListPageViewActions.ts` は `normalizeTitle`（`todoListTitleNormalization.ts`）を使うのに対し、こちらは生の `.trim()` を直接使っている。将来 `normalizeTitle` に正規化ルールが追加されても、このコンポーネントには反映されない。
- **同じ関心事が層をまたいで別々に実装されている**。`TodoListAddForm` 側は同じ「追加時にblurする」処理をフック層（`useTodoListDetailAddAction`）が担っているのに対し、`InlineInsertForm` 側はコンポーネント内で直接行っており、層が揃っていない。

このコードベースには `useTodoListDetailAddAction.ts` のように「送信アクションをフックに切り出す」確立されたパターンがある。このパターンに倣う。

### テスト拡充対象

新設する `useInlineInsertSubmit` フックに対し、コンポーネント経由では検証しづらい以下をフック単体でテストする:

- 空欄・空白のみ・全角スペースのみでは `onAddAction` を呼ばず、blurもしない
- 有効な入力では blur してから `onAddAction` を呼ぶ（**順序**まで検証する。逆順だとアンマウント後にblurすることになり意味がなくなる）
- `canSubmit` が入力内容に応じて正しく切り替わる

---

### Task 1: 送信処理を useInlineInsertSubmit フックへ切り出す

**Files:**

- Create: `src/features/todo-lists/useInlineInsertSubmit.ts`
- Create: `src/features/todo-lists/__tests__/useInlineInsertSubmit.test.tsx`
- Modify: `src/features/todo-lists/InlineInsertForm.tsx`

**Interfaces:**

- `useInlineInsertSubmit({ inputText, onAddAction })` が返すもの:
  - `inputRef: RefObject<HTMLInputElement | null>` — input要素へ渡すref
  - `canSubmit: boolean` — 送信可能か（追加ボタンの `disabled` 判定に使う）
  - `handleAdd: () => void` — バリデーション → blur → `onAddAction` を行う送信ハンドラ

- [x] **Step 1: `useInlineInsertSubmit` のテストを書く（RED）**

`src/features/todo-lists/__tests__/useInlineInsertSubmit.test.tsx` を新規作成する:

```tsx
import { renderHook } from "@testing-library/react";
import { useInlineInsertSubmit } from "../useInlineInsertSubmit";

const setup = (inputText: string) => {
  const onAddAction = jest.fn();
  const blur = jest.fn();
  const { result } = renderHook(() =>
    useInlineInsertSubmit({ inputText, onAddAction }),
  );
  // input要素の代わりにblurだけを持つオブジェクトを差し込む
  result.current.inputRef.current = { blur } as unknown as HTMLInputElement;
  return { result, onAddAction, blur };
};

describe("useInlineInsertSubmit", () => {
  describe("canSubmit", () => {
    it("入力があれば true", () => {
      const { result } = setup("Todo");
      expect(result.current.canSubmit).toBe(true);
    });

    it("空欄なら false", () => {
      const { result } = setup("");
      expect(result.current.canSubmit).toBe(false);
    });

    it("空白のみなら false", () => {
      const { result } = setup("   ");
      expect(result.current.canSubmit).toBe(false);
    });

    it("全角スペースのみでも false（normalizeTitle と同じ判定になる）", () => {
      const { result } = setup("　　");
      expect(result.current.canSubmit).toBe(false);
    });
  });

  describe("handleAdd", () => {
    it("有効な入力では blur してから onAddAction を呼ぶ", () => {
      const { result, onAddAction, blur } = setup("Todo");
      const callOrder: string[] = [];
      blur.mockImplementation(() => callOrder.push("blur"));
      onAddAction.mockImplementation(() => callOrder.push("add"));

      result.current.handleAdd();

      // 順序が逆だと、フォームがアンマウントされた後にblurすることになり
      // ソフトウェアキーボードが閉じない
      expect(callOrder).toEqual(["blur", "add"]);
    });

    it("空欄では onAddAction も blur も呼ばない", () => {
      const { result, onAddAction, blur } = setup("");

      result.current.handleAdd();

      expect(onAddAction).not.toHaveBeenCalled();
      expect(blur).not.toHaveBeenCalled();
    });

    it("空白のみでは onAddAction も blur も呼ばない", () => {
      const { result, onAddAction, blur } = setup("   ");

      result.current.handleAdd();

      expect(onAddAction).not.toHaveBeenCalled();
      expect(blur).not.toHaveBeenCalled();
    });

    it("inputRef が未設定でも onAddAction は呼ばれる（描画前の呼び出しで落ちない）", () => {
      const onAddAction = jest.fn();
      const { result } = renderHook(() =>
        useInlineInsertSubmit({ inputText: "Todo", onAddAction }),
      );

      expect(() => result.current.handleAdd()).not.toThrow();
      expect(onAddAction).toHaveBeenCalledTimes(1);
    });
  });
});
```

Run: `npx jest src/features/todo-lists/__tests__/useInlineInsertSubmit.test.tsx --no-coverage`
Expected: FAIL（`../useInlineInsertSubmit` が存在せずモジュール解決エラー）

- [x] **Step 2: `useInlineInsertSubmit.ts` を作成する（GREEN）**

```ts
import { useRef } from "react";
import { normalizeTitle } from "./todoListTitleNormalization";

type UseInlineInsertSubmitParams = {
  inputText: string;
  onAddAction: () => void;
};

/**
 * インライン挿入フォームの送信処理を担うフック。
 *
 * 入力のバリデーションと、送信時にソフトウェアキーボードを閉じるための
 * blur 発火をまとめて引き受け、コンポーネント側は描画と配線に専念できるようにする。
 *
 * blur は onAddAction より先に呼ぶ。onAddAction の中でフォームがアンマウント
 * されるため、後に呼んでも入力欄が既に存在せずキーボードが閉じない。
 *
 * 「空のタイトル」の判定は normalizeTitle に委譲し、リポジトリ内で判定方法が
 * 分岐しないようにする。
 */
export const useInlineInsertSubmit = ({
  inputText,
  onAddAction,
}: UseInlineInsertSubmitParams) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const canSubmit = normalizeTitle(inputText) !== null;

  const handleAdd = () => {
    if (!canSubmit) return;
    inputRef.current?.blur();
    onAddAction();
  };

  return {
    inputRef,
    canSubmit,
    handleAdd,
  };
};
```

Run: `npx jest src/features/todo-lists/__tests__/useInlineInsertSubmit.test.tsx --no-coverage`
Expected: PASS（8件すべて）

- [x] **Step 3: `InlineInsertForm.tsx` をフック利用に書き換える**

```tsx
"use client";

import { isImeComposingKeyDown } from "@/lib/isImeComposingKeyDown";
import { useInlineInsertSubmit } from "./useInlineInsertSubmit";
import texts from "./locales/ja.json";

type InlineInsertFormProps = {
  inputText: string;
  onChangeTextAction: (text: string) => void;
  onAddAction: () => void;
  onCancelAction: () => void;
};

/**
 * アイテムの直後に表示されるインライン挿入フォーム。
 * 送信時のバリデーションと blur は useInlineInsertSubmit が担う。
 */
export const InlineInsertForm = ({
  inputText,
  onChangeTextAction,
  onAddAction,
  onCancelAction,
}: InlineInsertFormProps) => {
  const { inputRef, canSubmit, handleAdd } = useInlineInsertSubmit({
    inputText,
    onAddAction,
  });

  return (
    <li>
      <div
        role="form"
        aria-label="アイテムを挿入"
        className="flex gap-2 py-1.5 pl-2"
      >
        <input
          ref={inputRef}
          type="text"
          autoFocus
          aria-label={texts.list.itemPlaceholder}
          value={inputText}
          onChange={(e) => onChangeTextAction(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !isImeComposingKeyDown(e)) {
              handleAdd();
            }
            if (e.key === "Escape") {
              onCancelAction();
            }
          }}
          placeholder={texts.list.itemPlaceholder}
          className="flex-1 text-sm px-3 py-1.5 border border-teal-300 dark:border-teal-500 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-400"
        />
        <button
          type="button"
          onClick={handleAdd}
          disabled={!canSubmit}
          className="text-sm bg-teal-500 hover:bg-teal-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-3 py-1.5 rounded-lg font-medium transition-colors shrink-0"
        >
          {texts.list.addButton}
        </button>
        <button
          type="button"
          onClick={onCancelAction}
          className="text-sm text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 px-2 transition-colors"
          aria-label="キャンセル"
        >
          ✕
        </button>
      </div>
    </li>
  );
};
```

変更点は以下の3つのみで、マークアップ・クラス名・`onCancelAction` の配線は一切変えない:

- `useRef` の直接利用と `handleAdd` の定義（および12行のコメント）を削除し、`useInlineInsertSubmit` の呼び出しに置き換え
- `disabled={!inputText.trim()}` → `disabled={!canSubmit}`
- 説明コメントをフック側へ移動

- [x] **Step 4: 既存の `InlineInsertForm` テストが全件通過することを確認する**

Run: `npx jest src/features/todo-lists/__tests__/InlineInsertForm.test.tsx --no-coverage`
Expected: PASS（既存15件すべて。振る舞いは変えていないため）

- [x] **Step 5: リファクタが有効であることを確認する（バリデーションガードのRED確認）**

`useInlineInsertSubmit.ts` の `if (!canSubmit) return;` を一時的にコメントアウトし、テストが落ちることを確認してから元に戻す。

Run:

```bash
npx jest src/features/todo-lists/__tests__/useInlineInsertSubmit.test.tsx src/features/todo-lists/__tests__/InlineInsertForm.test.tsx --no-coverage
```

Expected: ガードを外すと、フック側2件（空欄・空白）とコンポーネント側2件（空欄Enter・空白Enter）が失敗する。確認後、必ず元に戻す。

- [x] **Step 6: todo-lists全体・lint・型チェックを実行する**

Run:

```bash
npx jest src/features/todo-lists --no-coverage
npx eslint src/features/todo-lists/ --quiet
npx tsc --noEmit -p tsconfig.test.json
```

Expected: すべてエラーなし

- [x] **Step 7: 全体テストスイート・E2Eを実行する**

Run:

```bash
npm test -- --runInBand
npm run lint
npm run typecheck
npm run test:e2e
```

Expected: すべてPASS（既存機能への影響がないことを確認）

- [ ] **Step 8: コミット（ユーザーに確認の上で実行）**

「自動コミットはしないでください」という指示のもと実行されるため、Step 7 まで完了したらユーザーに差分を提示し、コミットしてよいか確認してから実行する。

---

## Self-Review

- **Spec coverage**: 洗い出した対象ファイル7件すべてに判定を記載。SRP対象は `InlineInsertForm.tsx` 1件のみで、そのリファクタとテスト拡充をTask 1に網羅した。
- **Placeholder scan**: なし。すべてのコードブロックは実際に貼り付け可能な完全な内容。
- **Type consistency**: `useInlineInsertSubmit` が返す `inputRef` は `useRef<HTMLInputElement>(null)` の戻り値そのままで、`InlineInsertForm` の `<input ref={inputRef}>` に型どおり渡せる。`canSubmit`/`handleAdd` の型も呼び出し側の用途（`disabled` 属性・イベントハンドラ）と一致している。
- **重複解消の確認**: リファクタ後、`InlineInsertForm.tsx` から生の `.trim()` は消え、空判定は `useInlineInsertSubmit` 内の `normalizeTitle` 呼び出し1箇所に集約される。
- **スコープ判断**: `TodoListAddForm.tsx` にも `disabled={!inputText.trim()}` があり同種の重複と言えるが、これは main 時点から存在する既存コードで今回の変更が生んだものではないため、対象外とした。
