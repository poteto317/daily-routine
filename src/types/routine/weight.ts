export interface WeightRecord {
  id: string;
  date: string;
  weight: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WeightHistory {
  [date: string]: WeightRecord;
}
