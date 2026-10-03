export type JournalEntry = {
  id: string;
  date: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
};

/** 日付（YYYY-MM-DD）ごとのジャーナル一覧。アプリの journalHistory と同じ形 */
export type JournalHistory = Record<string, JournalEntry[]>;

/** 見つかったエントリと、それが入っているバケットのキー */
export type FoundEntry = { key: string; entry: JournalEntry };
