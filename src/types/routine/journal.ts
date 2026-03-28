export interface JournalEntry {
  id: string;
  date: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface JournalHistory {
  [date: string]: JournalEntry[];
}
