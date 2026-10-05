import {
  compact,
  readString,
  required,
  type JsonObject,
} from "../../validation";
import { createSimpleCollection } from "../simpleCollection";
import { readBgColor } from "./todoBgColorField";
import { TODO_CATEGORIES_FIELD } from "./todoStoreConstants";

const NAME_OPTIONS = { maxLength: 100, trim: true } as const;

export const todoCategoryOperations = createSimpleCollection({
  field: TODO_CATEGORIES_FIELD,
  responseKey: "categories",
  itemKey: "category",
  idPrefix: "todo-category",
  allowedKeys: ["name", "color"],
  parseCreate: (body: JsonObject) =>
    compact({
      name: required("name", readString(body, "name", NAME_OPTIONS)),
      color: readBgColor(body, "color"),
    }),
  parsePatch: (body: JsonObject) =>
    compact({
      name: readString(body, "name", NAME_OPTIONS),
      color: readBgColor(body, "color"),
    }),
});
