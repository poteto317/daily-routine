/**
 * データを JSON ファイルとしてブラウザに配る。
 * Blob の生成・anchor 経由のダウンロード・後始末だけを持つ。
 */
export const downloadJsonFile = (fileName: string, data: object): void => {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
};
