type NumberFieldViewModel = {
  label: string;
  description: string;
  min: number;
  max: number;
  errorText: string;
  hint: string;
};

export const DEFAULT_DURATION_FIELD: NumberFieldViewModel = {
  label: "デフォルト所要時間（分）",
  description:
    "新しいルーティンを追加する際のデフォルト値です。1つのルーティンにかかる時間を設定します。",
  min: 1,
  max: 1440,
  errorText: "1～1440分の範囲で入力してください",
  hint: "推奨: 15〜60分",
};

export const DEFAULT_NOTIFICATION_FIELD: NumberFieldViewModel = {
  label: "デフォルト通知時間（分後）",
  description:
    "新しいルーティンを追加する際のデフォルト値です。開始時間を過ぎてから何分後に通知するかを設定します。",
  min: 0,
  max: 120,
  errorText: "0～120分の範囲で入力してください（0は通知なし）",
  hint: "0分で通知なし",
};

export const BACKGROUND_REFRESH_FIELD: NumberFieldViewModel = {
  label: "表示中の定期リフレッシュ間隔（分）",
  description:
    "アプリを表示したままのときに、ルーティンの背景色（経過色）を再評価する間隔です。バックグラウンドから戻したときは、この値に関係なくすぐに再評価します。0を設定すると定期的な再評価は行われません。",
  min: 0,
  max: 60,
  errorText: "0～60分の範囲で入力してください（0で定期更新なし）",
  hint: "推奨: 30分",
};

export const POMODORO_FIELDS: NumberFieldViewModel[] = [
  {
    label: "集中時間（分）",
    description: "1回の集中時間の長さを設定します。",
    min: 1,
    max: 90,
    errorText: "1～90分の範囲で入力してください",
    hint: "標準: 25分",
  },
  {
    label: "休憩時間（分）",
    description: "集中時間の後の休憩時間を設定します。",
    min: 1,
    max: 30,
    errorText: "1～30分の範囲で入力してください",
    hint: "標準: 5分",
  },
];
