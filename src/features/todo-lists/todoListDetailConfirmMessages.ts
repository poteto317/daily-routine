import texts from "./locales/ja.json";

export const createDeleteItemConfirmMessage = (title: string): string =>
  texts.list.deleteItemConfirm.replace("{title}", title);

export const createDeleteListConfirmMessage = (title: string): string =>
  texts.list.deleteListConfirm.replace("{title}", title);
