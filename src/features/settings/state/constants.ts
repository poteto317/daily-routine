export type NotificationStatus = "idle" | "testing" | "success" | "error";
export type TransferStatus = "idle" | "success" | "error";

export type TransferOptions = {
  routines: boolean;
  progress: boolean;
  history: boolean;
  settings: boolean;
};

export type MonitoredLine = {
  lineId: string;
  lineName: string;
  company: string;
};

export const ALL_TRANSFER_OPTIONS: TransferOptions = {
  routines: true,
  progress: true,
  history: true,
  settings: true,
};

export const EMPTY_TRANSFER_OPTIONS: TransferOptions = {
  routines: false,
  progress: false,
  history: false,
  settings: false,
};

export const AVAILABLE_LINES = [
  { id: "yamanote", name: "山手線", company: "JR東日本" },
  { id: "chuo", name: "中央線", company: "JR東日本" },
  { id: "sobu", name: "総武線", company: "JR東日本" },
  { id: "keihin-tohoku", name: "京浜東北線", company: "JR東日本" },
  { id: "shonan-shinjuku", name: "湘南新宿ライン", company: "JR東日本" },
  { id: "ginza", name: "銀座線", company: "東京メトロ" },
  { id: "marunouchi", name: "丸ノ内線", company: "東京メトロ" },
  { id: "hibiya", name: "日比谷線", company: "東京メトロ" },
  { id: "tozai", name: "東西線", company: "東京メトロ" },
  { id: "den-en-toshi", name: "田園都市線", company: "東急電鉄" },
  { id: "toyoko", name: "東横線", company: "東急電鉄" },
];

export const VISIBLE_FEATURE_ITEMS = [
  { key: "journal", label: "ジャーナル", icon: "📔" },
  { key: "calendar", label: "達成カレンダー", icon: "📅" },
  { key: "statistics", label: "統計・レポート", icon: "📊" },
  { key: "pomodoro", label: "ポモドーロ", icon: "🍅" },
  { key: "worktracker", label: "作業記録", icon: "💼" },
  { key: "weightTracker", label: "体重記録", icon: "⚖️" },
  { key: "meal", label: "食事記録", icon: "🍽️" },
  { key: "budget", label: "家計簿", icon: "💰" },
  { key: "weather", label: "天気予報", icon: "🌤️" },
  { key: "preset", label: "プリセット管理", icon: "📋" },
  { key: "todoLists", label: "Todoリスト", icon: "✅" },
  { key: "syncManagement", label: "同期履歴管理", icon: "☁️" },
  { key: "testMatrix", label: "テストマトリクス", icon: "🧪" },
  { key: "accountAdmin", label: "アカウント管理", icon: "👥" },
] as const;
