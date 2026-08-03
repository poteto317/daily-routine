import texts from "./locales/ja.json";

export const createDeleteItemConfirmMessage = (title: string): string =>
  texts.list.deleteItemConfirm.replace("{title}", title);
