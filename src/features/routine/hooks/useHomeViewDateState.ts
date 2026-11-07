import {
  createHomeCurrentDateLabel,
  createIsTodayHoliday,
} from "./homeViewStateActions";

type UseHomeViewDateStateParams = {
  canUseWindow: boolean;
  getIsTodayHoliday: () => boolean;
};

/**
 * 今日の日付ラベルと、今日が祝日かどうか。描画のたびに求める（useState の初期値にすると、
 * 日をまたいでも最初の描画の日のまま残る。#210）。
 * 祝日の判定（機能側の関数）を呼ぶため、共通フック（src/hooks/useToday.ts）ではなくここに置き、
 * React Compiler の自動メモ化から外す（"use no memo"。本体の最初の文に置く。
 * src/__tests__/reactCompilerToday.contract.test.ts の USE_NO_MEMO_TARGETS が確かめる）。
 */
export const useHomeViewDateState = ({
  canUseWindow,
  getIsTodayHoliday,
}: UseHomeViewDateStateParams) => {
  "use no memo";
  return {
    currentDate: createHomeCurrentDateLabel(canUseWindow),
    isTodayHoliday: createIsTodayHoliday(canUseWindow, getIsTodayHoliday),
  };
};
