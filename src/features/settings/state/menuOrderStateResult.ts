import type { Dispatch, SetStateAction } from "react";

type MenuOrderStateResultInput = {
  menuOrder: string[];
  setMenuOrder: Dispatch<SetStateAction<string[]>>;
};

export const createMenuOrderStateResult = ({
  menuOrder,
  setMenuOrder,
}: MenuOrderStateResultInput) => ({
  menuOrder,
  setMenuOrder,
});
