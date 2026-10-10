# Storybook コンポーネントカタログガイド

本プロジェクトでは、UI コンポーネントの品質担保、視覚的なレビュー、および分離された環境での開発を目的として、**Storybook**（v10.4 / Vite）を導入しています。

---

## 1. 概要と特徴

本アプリでは、汎用 UI コンポーネント（`src/components/`）から、ナビゲーション・ヘッダー（`src/layouts/`）、機能別画面（`src/features/`）に至るまで、**100 以上の Story（`.stories.tsx`）** を網羅的に管理しています。

- **Vite 高速プレビュー**: Next.js App Router 環境と連携しつつ、Vite を用いた高速な HMR（Hot Module Replacement）を実現。
- **ダークモード・テーマ対応**: Tailwind CSS 4 のクラスに対応し、ライトモードとダークモードの表示確認が可能。
- **モック状態の視覚化**: 空状態（Empty State）、ローディング中、エラー表示、データ入力済み状態など、実運用で発生する多様な状態を即座に確認可能。

---

## 2. 起動・ビルドコマンド

```bash
# 開発モードで Storybook を起動 (http://localhost:6006)
npm run storybook

# 静的カタログとしてビルド（CI / ドキュメント配布用成果物を storybook-static/ に出力）
npm run build-storybook
```

---

## 3. ディレクトリと対象コンポーネント

各コンポーネントと同階層に `.stories.tsx` を配置する **Co-location** 形式を採用しています。

```
src/
├── components/          # 汎用UIパーツ（Button, Modal, Card, StorageWriteFailureBanner等）
├── layouts/             # ヘッダー、メニューパネル、同期インジケーター等
└── features/
    ├── routine/         # ルーティン一覧、フォーム、編集ドラッグ行等
    ├── budget/          # 家計簿サマリーカード、支出一覧、編集フォーム等
    ├── journal/         # ジャーナルページ、入力カード、編集カード、履歴一覧等
    ├── todo-lists/      # Todoリスト、アイテム行、タイトル編集等
    ├── calendar/        # カレンダーグリッド、詳細パネル等
    ├── statistics/      # チャートパネル、期間切替、週間目標等
    ├── meal/            # 今日の食事、入力フォーム、履歴一覧等
    ├── weight-tracker/  # 体重記録フォーム、今日カード、履歴等
    ├── work-tracker/    # タイマー、テンプレート、履歴等
    ├── pomodoro/        # ポモドーロタイマーパネル等
    ├── settings/        # 各設定セクション（外観、データ管理、電車遅延等）
    └── account-admin/   # アカウント管理テーブル、作成フォーム等
```

---

## 4. ストーリー作成のルール

新しい UI コンポーネントを作成またはリファクタリングした際は、以下のルールに従って Story を追加してください。

### 4-1. 基本テンプレート (`@storybook/nextjs-vite`)

```typescript
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, within } from "storybook/test";
import { MyComponent } from "./MyComponent";

const meta = {
  title: "Features/MyFeature/MyComponent",
  component: MyComponent,
} satisfies Meta<typeof MyComponent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    // 既定の Props
  },
};

export const InteractiveCheck: Story = {
  args: {
    // テスト用 Props
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button"));
    expect(canvas.getByText("完了")).toBeTruthy();
  },
};
```

### 4-2. 設定と作成時のポイント

1. **テーマ切り替えデコレーター (`.storybook/preview.tsx`)**:
   - ツールバーの `Theme`（Light / Dark）を切り替えると、`withDarkMode` デコレーターが `document.documentElement` の `.dark` クラスを自動で付け外しし、`globals.css` の `@variant dark` スタイルを即座にプレビューできます。
2. **ドメインロジックの分離と LocalStorage 初期化**:
   - プレゼンテーションコンポーネントは純粋な Props で構成します。
   - ページ単位の Story で LocalStorage を参照する場合は、`beforeEach()` フック内でストレージの初期化とクリーンアップ関数（`return () => ...`）を定義し、Story 間で状態が漏れないようにします。
3. **インタラクションテスト (`play` 関数)**:
   - `storybook/test` の `within`, `userEvent`, `expect` を用いて、ボタン押下やフォーム開閉などの UI インタラクションを Story 内で自動検証できます。
4. **状態バリエーションの網羅**:
   - 通常状態（Default）、空データ状態（Empty）、ローディング状態（Loading）、エラー状態（Error）を網羅します。

---

## 📖 関連ドキュメント

- [コーディング規約](./coding-standards.md)
- [リファクタリングガイド](./refactoring-guide.md)
- [テストガイド](../03-testing/README.md)
