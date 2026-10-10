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

### 4-1. 基本テンプレート

```typescript
import type { Meta, StoryObj } from "@storybook/react";
import { MyComponent } from "./MyComponent";

const meta: Meta<typeof MyComponent> = {
  title: "Features/MyFeature/MyComponent",
  component: MyComponent,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof MyComponent>;

export const Default: Story = {
  args: {
    // 既定の Props
  },
};

export const Loading: Story = {
  args: {
    isLoading: true,
  },
};
```

### 4-2. 作成時の注意点

1. **ドメインロジックの分離**: Storybook で表示するコンポーネントは、可能な限り純粋な Props（Presentation Component）で構成し、API 通信やグローバル副作用を直接持たない設計にします。
2. **状態バリエーションの網羅**:
   - 通常状態（Default）
   - 空データ状態（Empty）
   - ローディング状態（Loading）
   - エラー状態（Error）
3. **日本語テキスト**: `locales/ja.json` から読み込んだ文言を使用するか、Storybook 上で分かりやすい日本語ダミーデータを Props として渡します。

---

## 📖 関連ドキュメント

- [コーディング規約](./coding-standards.md)
- [リファクタリングガイド](./refactoring-guide.md)
- [テストガイド](../03-testing/README.md)
