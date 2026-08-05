import { useState } from "react";

/**
 * 運動記録フォームの送信エラーメッセージのstateを管理する。
 */
export const useWorkoutRecordFormError = () => {
  const [error, setError] = useState<string | null>(null);

  return { error, setError };
};
