import texts from "./locales/ja.json";

/** キーの有無（null は確認中）を画面表示用の文言にする */
export const getApiKeyStatusLabel = (hasKey: boolean | null): string => {
  if (hasKey === null) return texts.statusLoading;
  return hasKey ? texts.statusIssued : texts.statusNone;
};
