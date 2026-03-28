export const FIXED_HOLIDAYS: Record<string, string> = {
  "01-01": "元日",
  "02-11": "建国記念の日",
  "02-23": "天皇誕生日",
  "04-29": "昭和の日",
  "05-03": "憲法記念日",
  "05-04": "みどりの日",
  "05-05": "こどもの日",
  "08-11": "山の日",
  "11-03": "文化の日",
  "11-23": "勤労感謝の日",
};

export interface HappyMonday {
  month: number;
  week: number;
  name: string;
}

export const HAPPY_MONDAYS: HappyMonday[] = [
  { month: 1, week: 2, name: "成人の日" },
  { month: 7, week: 3, name: "海の日" },
  { month: 9, week: 3, name: "敬老の日" },
  { month: 10, week: 2, name: "スポーツの日" },
];
