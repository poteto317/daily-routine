import { getSettings } from "@/features/settings/storage";
import { useState } from "react";
import { createMenuOrderStateResult } from "./menuOrderStateResult";

export const useMenuOrderState = () => {
  const [menuOrder, setMenuOrder] = useState<string[]>(
    () => getSettings().menuOrder ?? [],
  );

  return createMenuOrderStateResult({
    menuOrder,
    setMenuOrder,
  });
};
