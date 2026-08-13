/**
 * 設定機能のデータ転送に関するエラーメッセージ
 * 開発者向けの例外メッセージ定数
 */

export const DATA_TRANSFER_ERROR_MESSAGES = {
  invalidRoutinesFormat: "Invalid routines data format",
  invalidHistoryFormat: "Invalid history data format",
  /**
   * 取り込むファイルの項目が期待した形でないときのメッセージ。
   *
   * 形を確かめずに保存すると、読み出し側のガードで既定値に落ちるため、
   * エラーも出ないままデータが消えたように見える。
   */
  invalidFieldFormat: (field: string) => `Invalid ${field} data format`,
} as const;
