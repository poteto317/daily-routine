import type { DetailTestCaseMap } from "./types";

export const DETAILED_TEST_CASES_GROUP_27: DetailTestCaseMap = {
  "27-1": [
    {
      id: "27-1-1",
      scenario:
        "今週の業務日誌が無い状態で「➕ 書く」を押し、本文を入力して保存",
      expected:
        "今週の表示に本文と最終更新が出る。「これまでの業務日誌」の先頭に今週の行が出る",
      pc: "unchecked",
      sp: "unchecked",
      note: "",
    },
    {
      id: "27-1-2",
      scenario: "今週の業務日誌の「✏️ 編集」を押し、本文を変えて保存",
      expected: "同じ週の日誌が上書きされ、件数は増えない",
      pc: "unchecked",
      sp: "unchecked",
      note: "",
    },
    {
      id: "27-1-3",
      scenario: "本文を空（空白だけ）にして保存",
      expected: "「本文を入力してください」と表示され、保存されない",
      pc: "unchecked",
      sp: "unchecked",
      note: "",
    },
  ],
  "27-2": [
    {
      id: "27-2-1",
      scenario:
        "金曜・土曜・日曜のいずれかに、ハンバーガーメニューの「業務日誌」を開く",
      expected:
        "その週の月曜を開始日として「◯年◯月◯日（月）開始の週」と期間が表示され、「今週」の印が出る",
      pc: "unchecked",
      sp: "unchecked",
      note: "",
    },
    {
      id: "27-2-2",
      scenario: "「◀ 前の週」を押してから「次の週 ▶」を押す",
      expected:
        "1 週前の表示に変わり、戻ると今週になる。今週を表示中は「次の週 ▶」を押せない",
      pc: "unchecked",
      sp: "unchecked",
      note: "",
    },
    {
      id: "27-2-3",
      scenario: "本文の入力中に週の切り替えボタンと一覧の「開く」を見る",
      expected: "どれも押せない。保存かキャンセルの後に押せるようになる",
      pc: "unchecked",
      sp: "unchecked",
      note: "",
    },
  ],
  "27-3": [
    {
      id: "27-3-1",
      scenario: "複数の週に業務日誌がある状態で「これまでの業務日誌」を見る",
      expected:
        "新しい週から順に並び、表示中の週は「表示中」、ほかは「開く」が出る。「開く」でその週の表示に変わる",
      pc: "unchecked",
      sp: "unchecked",
      note: "",
    },
    {
      id: "27-3-2",
      scenario:
        "業務日誌の「🗑️ 削除」を押し、確認でキャンセル、もう一度押して OK",
      expected: "キャンセルでは消えない。OK で消え、一覧からも消える",
      pc: "unchecked",
      sp: "unchecked",
      note: "",
    },
  ],
};
