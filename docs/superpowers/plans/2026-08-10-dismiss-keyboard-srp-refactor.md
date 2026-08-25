# キーボード制御まわりの単一責任リファクタ 実装プラン

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans を使って本プランをタスクごとに実行する。ステップはチェックボックス（`- [ ]`）で進捗管理する。

**Goal:** main ブランチから変更されている箇所を対象に単一責任原則（SRP）の観点で洗い出し、違反箇所をリファクタする。リファクタ対象コードのユニットテストも拡充する。

**Architecture:** 洗い出しの結果、SRP改善が必要なのは2点。

1. **同じ責務のフックが2つ存在する** — 直前の作業で `useDismissKeyboardOnSubmit`（`src/hooks/`）を新設したが、PR #156 で作った `useInlineInsertSubmit`（`src/features/todo-lists/`）と「バリデーション → blur → 送信」というロジックが重複している。しかも後者は blur 対象を自前の ref に限定しており、前者（フォーカス中のテキスト入力を blur）より機能が劣る。
2. **4つの作成フォームで同じ判定式が2箇所に重複** — `canSubmit: Boolean(xxx.trim())` と `disabled={!xxx.trim()}` が同一ファイル内に併存している。片方だけ条件を変えると「ボタンは押せないのに Enter では通る」という不整合が生じる。これは PR #156 で `InlineInsertForm` に対して解消したのと同じ問題であり、横展開の際に持ち込んでしまった。

**Tech Stack:** React 19, TypeScript, Jest, React Testing Library, Playwright

## Global Constraints

- リファクタは振る舞いを変えない。既存テストはすべて元のアサーション内容のまま通過すること
- 「送信可否の判定式」は各フォーム内で1回だけ書く
- 「バリデーション → blur → 送信」の手続きは1箇所にのみ実装する
- 自動コミットはしない

---

## 洗い出し結果

main ブランチとの差分ファイル一覧と、SRP観点での判定:

| ファイル                                                                | 種別           | 判定                                                                           |
| ----------------------------------------------------------------------- | -------------- | ------------------------------------------------------------------------------ |
| `docs/superpowers/plans/2026-08-10-dismiss-keyboard-on-create-forms.md` | ドキュメント   | 対象外                                                                         |
| `e2e/todo-list.spec.ts`                                                 | E2Eテスト      | 対象外（テストケース追加のみ）                                                 |
| `src/hooks/useDismissKeyboardOnSubmit.ts`                               | フック         | 対象外（「送信時にキーボードを閉じる」という単一の責務。**統合先**として残す） |
| `src/hooks/__tests__/useDismissKeyboardOnSubmit.test.ts`                | テスト         | 対象外                                                                         |
| `src/features/budget/__tests__/BudgetAllowanceItemForm.test.tsx`        | テスト         | 対象外（ケース追加のみ）                                                       |
| `src/features/budget/__tests__/BudgetCategoryCreateForm.test.tsx`       | テスト         | 対象外（ケース追加のみ）                                                       |
| `src/features/todo-lists/__tests__/TodoListCreateForm.test.tsx`         | テスト         | 対象外（ケース追加のみ）                                                       |
| `src/features/todo-lists/__tests__/TodoCategoryCreateForm.test.tsx`     | テスト         | 対象外（ケース追加のみ）                                                       |
| `src/features/todo-lists/TodoListCreateForm.tsx`                        | コンポーネント | **対象**（判定式の重複）                                                       |
| `src/features/todo-lists/TodoCategoryCreateForm.tsx`                    | コンポーネント | **対象**（判定式の重複）                                                       |
| `src/features/budget/components/BudgetCategoryCreateForm.tsx`           | コンポーネント | **対象**（判定式の重複）                                                       |
| `src/features/budget/components/BudgetAllowanceItemForm.tsx`            | コンポーネント | **対象**（判定式の重複）                                                       |

上記に加え、今回の変更によって既存ファイルとの重複が生じたため、以下も対象に含める。

| ファイル                                           | 判定                                                      |
| -------------------------------------------------- | --------------------------------------------------------- |
| `src/features/todo-lists/useInlineInsertSubmit.ts` | **対象**（`useDismissKeyboardOnSubmit` とロジックが重複） |
| `src/features/todo-lists/InlineInsertForm.tsx`     | **対象**（上記に伴い不要になる ref の受け渡しを削除）     |

### 課題1: 同じ責務のフックが2つある

|                      | `useInlineInsertSubmit`    | `useDismissKeyboardOnSubmit`    |
| -------------------- | -------------------------- | ------------------------------- |
| バリデーションガード | `if (!canSubmit) return;`  | `if (!canSubmit) return;`       |
| blur 対象            | 自前で持つ `inputRef` のみ | フォーカス中の input / textarea |
| 送信                 | `onAddAction()`            | `onSubmit()`                    |

手続きが完全に同一で、blur 対象の広さだけが異なる。`useInlineInsertSubmit` を `useDismissKeyboardOnSubmit` に委譲させれば、手続きの実装は1箇所に集約され、`useInlineInsertSubmit` は「インライン挿入フォームにおける有効なタイトルとは何か（`normalizeTitle`）」という自身の関心事だけを持つようになる。

副次的に `inputRef` が不要になる。`InlineInsertForm` はこの ref を blur 以外に使っておらず（`autoFocus` 属性で初期フォーカスしている）、コンポーネントから ref の受け渡しごと削除できる。

### 課題2: 4フォームで判定式が2箇所に重複

現状（4ファイルとも同じ形）:

```tsx
  const { handleSubmit } = useDismissKeyboardOnSubmit({
    canSubmit: Boolean(titleInput.trim()),   // ← 1箇所目
    onSubmit: onCreateAction,
  });
  ...
        disabled={!titleInput.trim()}        // ← 2箇所目
```

`canSubmit` を変数に束ねて両方から参照すれば、判定式は1箇所になる。`InlineInsertForm` は既にこの形（`disabled={!canSubmit}`）になっており、揃えることで一貫性も得られる。

### テスト拡充対象

- `useInlineInsertSubmit` に「フォーカス中の入力欄が blur される」ことを検証するテストを追加する。委譲後は自前 ref ではなく実際のフォーカス要素を見るようになるため、現在のテスト（ref にモックを差し込む形）では委譲が壊れても検出できない。
- 4フォームに「送信可否の判定がボタンの `disabled` と Enter の可否で一致している」ことを検証するテストを追加する。片方だけ壊れる不整合を防ぐ。

---

### Task 1: useInlineInsertSubmit を useDismissKeyboardOnSubmit に委譲させる

**Files:**

- Modify: `src/features/todo-lists/useInlineInsertSubmit.ts`
- Modify: `src/features/todo-lists/__tests__/useInlineInsertSubmit.test.tsx`
- Modify: `src/features/todo-lists/InlineInsertForm.tsx`

**Interfaces:**

- `useInlineInsertSubmit({ inputText, onAddAction })` の戻り値から `inputRef` を削除する。`canSubmit` と `handleAdd` は据え置き。

- [x] **Step 1: テストを「フォーカス中の入力欄が blur される」形に書き換える（RED）**

`src/features/todo-lists/__tests__/useInlineInsertSubmit.test.tsx` を以下で置き換える:

```tsx
import { renderHook } from "@testing-library/react";
import { useInlineInsertSubmit } from "../useInlineInsertSubmit";

/** フォーカス済みの入力欄を用意する */
const mountFocusedInput = () => {
  const input = document.createElement("input");
  document.body.appendChild(input);
  input.focus();
  return input;
};

describe("useInlineInsertSubmit", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  describe("canSubmit", () => {
    it("入力があれば true", () => {
      const { result } = renderHook(() =>
        useInlineInsertSubmit({ inputText: "Todo", onAddAction: jest.fn() }),
      );
      expect(result.current.canSubmit).toBe(true);
    });

    it("空欄なら false", () => {
      const { result } = renderHook(() =>
        useInlineInsertSubmit({ inputText: "", onAddAction: jest.fn() }),
      );
      expect(result.current.canSubmit).toBe(false);
    });

    it("空白のみなら false", () => {
      const { result } = renderHook(() =>
        useInlineInsertSubmit({ inputText: "   ", onAddAction: jest.fn() }),
      );
      expect(result.current.canSubmit).toBe(false);
    });

    it("全角スペースのみでも false（normalizeTitle と同じ判定になる）", () => {
      const { result } = renderHook(() =>
        useInlineInsertSubmit({ inputText: "　　", onAddAction: jest.fn() }),
      );
      expect(result.current.canSubmit).toBe(false);
    });
  });

  describe("handleAdd", () => {
    it("有効な入力ではフォーカス中の入力欄を blur してから onAddAction を呼ぶ", () => {
      const input = mountFocusedInput();
      const callOrder: string[] = [];
      input.addEventListener("blur", () => callOrder.push("blur"));
      const onAddAction = jest.fn(() => callOrder.push("add"));

      const { result } = renderHook(() =>
        useInlineInsertSubmit({ inputText: "Todo", onAddAction }),
      );

      result.current.handleAdd();

      // 順序が逆だと、フォームがアンマウントされた後にblurすることになり
      // ソフトウェアキーボードが閉じない
      expect(callOrder).toEqual(["blur", "add"]);
      expect(document.activeElement).toBe(document.body);
    });

    it("空欄では onAddAction も blur も行わない", () => {
      const input = mountFocusedInput();
      const onAddAction = jest.fn();

      const { result } = renderHook(() =>
        useInlineInsertSubmit({ inputText: "", onAddAction }),
      );

      result.current.handleAdd();

      expect(onAddAction).not.toHaveBeenCalled();
      expect(document.activeElement).toBe(input);
    });

    it("空白のみでは onAddAction も blur も行わない", () => {
      const input = mountFocusedInput();
      const onAddAction = jest.fn();

      const { result } = renderHook(() =>
        useInlineInsertSubmit({ inputText: "   ", onAddAction }),
      );

      result.current.handleAdd();

      expect(onAddAction).not.toHaveBeenCalled();
      expect(document.activeElement).toBe(input);
    });

    it("フォーカスされた入力欄が無くても onAddAction は呼ばれる", () => {
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
Expected: FAIL（現在の実装は自前 ref を blur するため、`document.body` に戻る系のアサーションが失敗する）

- [x] **Step 2: `useInlineInsertSubmit.ts` を委譲する形に書き換える（GREEN）**

```ts
import { useDismissKeyboardOnSubmit } from "@/hooks/useDismissKeyboardOnSubmit";
import { normalizeTitle } from "./todoListTitleNormalization";

type UseInlineInsertSubmitParams = {
  inputText: string;
  onAddAction: () => void;
};

/**
 * インライン挿入フォームの送信処理を担うフック。
 *
 * 「このフォームにとって有効なタイトルとは何か」の判定だけを受け持ち、
 * 送信時にソフトウェアキーボードを閉じる手続きは useDismissKeyboardOnSubmit に
 * 委譲する。判定は normalizeTitle に委ね、リポジトリ内で判定方法が分岐しない
 * ようにする。
 */
export const useInlineInsertSubmit = ({
  inputText,
  onAddAction,
}: UseInlineInsertSubmitParams) => {
  const canSubmit = normalizeTitle(inputText) !== null;

  const { handleSubmit } = useDismissKeyboardOnSubmit({
    canSubmit,
    onSubmit: onAddAction,
  });

  return {
    canSubmit,
    handleAdd: handleSubmit,
  };
};
```

Run: `npx jest src/features/todo-lists/__tests__/useInlineInsertSubmit.test.tsx --no-coverage`
Expected: PASS（8件すべて）

- [x] **Step 3: `InlineInsertForm.tsx` から `inputRef` の受け渡しを削除する**

`useInlineInsertSubmit` の分割代入から `inputRef` を外し、`<input>` の `ref={inputRef}` の行を削除する。それ以外（`autoFocus`・クラス名・`onKeyDown`・各ボタンの配線）は変更しない。

```tsx
const { canSubmit, handleAdd } = useInlineInsertSubmit({
  inputText,
  onAddAction,
});
```

Run: `npx jest src/features/todo-lists/__tests__/InlineInsertForm.test.tsx --no-coverage`
Expected: PASS（既存15件すべて。振る舞いは変えていないため）

---

### Task 2: 4フォームの判定式の重複を解消する

**Files:**

- Modify: `src/features/todo-lists/TodoListCreateForm.tsx`
- Modify: `src/features/todo-lists/TodoCategoryCreateForm.tsx`
- Modify: `src/features/budget/components/BudgetCategoryCreateForm.tsx`
- Modify: `src/features/budget/components/BudgetAllowanceItemForm.tsx`
- Modify: 上記4つに対応する `__tests__` の各ファイル

- [x] **Step 1: 判定の一致を検証するテストを4ファイルに追加する（RED）**

各テストファイルの末尾に追加する。`<入力欄のplaceholder>` と `<有効入力の与え方>` は各ファイルの既存の書き方に合わせる。

```tsx
  it("送信可否の判定が作成ボタンの活性状態とEnterキーの可否で一致する", () => {
    // 判定式が2箇所に分かれていると、片方だけ壊れて
    // 「ボタンは押せないのにEnterでは通る」という不整合が起きうる
    // （空白のみ）
    <空白のみの入力で描画>;
    expect(screen.getByRole("button", { name: "作成" })).toBeDisabled();
    fireEvent.keyDown(screen.getByPlaceholderText("<入力欄のplaceholder>"), {
      key: "Enter",
    });
    expect(<作成ハンドラ>).not.toHaveBeenCalled();
  });
```

Run: 各テストファイル
Expected: この時点では PASS する（現状の実装でも判定は一致しているため）。このテストは Step 2 のリファクタで不整合が入り込まないことを保証するための回帰テストとして追加する。

- [x] **Step 2: 4フォームで `canSubmit` を変数に束ねて両方から参照する**

各ファイルで以下の形にする（例は `TodoListCreateForm.tsx`）。

```tsx
const canSubmit = Boolean(titleInput.trim());
const { handleSubmit } = useDismissKeyboardOnSubmit({
  canSubmit,
  onSubmit: onCreateAction,
});
```

そして作成ボタンを `disabled={!canSubmit}` に変更する。他のフォームも同様（`nameInput` 等、各ファイルの変数名に合わせる）。

Run: `npx jest src/features/todo-lists src/features/budget --no-coverage`
Expected: 全件PASS

- [x] **Step 3: lint・型チェックを実行する**

Run:

```bash
npx eslint src/hooks/ src/features/todo-lists/ src/features/budget/ --quiet
npx tsc --noEmit -p tsconfig.test.json
```

Expected: エラーなし

---

### Task 3: 全体確認

- [x] **Step 1: 全体テストスイート・lint・型チェック・E2Eを実行する**

Run:

```bash
npm test -- --runInBand
npm run lint
npm run typecheck
npm run test:e2e
```

Expected: すべてPASS

- [x] **Step 2: 実装を壊してテストがREDになることを確認する**

`useDismissKeyboardOnSubmit` の `active.blur();` と `if (!canSubmit) return;` をそれぞれ一時的に外し、Task 1・Task 2 で追加したテストを含めて落ちることを確認してから元に戻す。委譲が正しく効いていれば、`useInlineInsertSubmit` 側のテストも同時に落ちるはず。

- [ ] **Step 3: コミット（ユーザーに確認の上で実行）**

「自動コミットはしないでください」という指示のもと実行されるため、Step 2 まで完了したらユーザーに差分を提示し、コミットしてよいか確認してから実行する。

---

## Self-Review

- **Spec coverage**: main比の差分12ファイルすべてに判定を記載し、加えて今回の変更で重複が生じた既存2ファイル（`useInlineInsertSubmit.ts` / `InlineInsertForm.tsx`）も対象に含めた。
- **Placeholder scan**: Task 2 Step 1 のテストコードにはプレースホルダが含まれるが、4ファイルで placeholder 名・ハンドラ名が異なるためで、各ファイルの既存記述に合わせる旨を明記している。それ以外に未確定箇所はない。
- **Type consistency**: `useInlineInsertSubmit` の戻り値から `inputRef` を削除するため、`InlineInsertForm` 側の分割代入も同時に修正する。`handleAdd` は `useDismissKeyboardOnSubmit` が返す `handleSubmit`（`() => void`）をそのまま公開するので型は変わらない。
- **振る舞いの不変性**: `useInlineInsertSubmit` の blur 対象が「自前 ref」から「フォーカス中のテキスト入力」に広がるが、`InlineInsertForm` は入力欄が1つだけで、送信時にフォーカスされているのはその入力欄のため実挙動は同じ。むしろ ref 経由より確実になる。
- **重複解消の確認**: リファクタ後、「バリデーション → blur → 送信」の手続きは `useDismissKeyboardOnSubmit` の1箇所のみになり、各フォームの判定式も1箇所ずつになる。
