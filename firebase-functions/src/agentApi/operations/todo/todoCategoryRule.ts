import { invalidField } from "../../validation/fieldError";
import type { SyncDocData } from "../../syncDoc";
import { readArray } from "../dataAccess";
import { TODO_CATEGORIES_FIELD } from "./todoStoreConstants";

/** categoryId が実在するカテゴリでなければ 400 invalid_field */
export const assertCategoryExists = (
  data: SyncDocData,
  categoryId: string,
): void => {
  const categories = readArray<{ id: string }>(data, TODO_CATEGORIES_FIELD);
  if (!categories.some((category) => category.id === categoryId)) {
    throw invalidField(
      "categoryId",
      "存在しないカテゴリです（GET /todo/categories で確認できます）",
    );
  }
};
