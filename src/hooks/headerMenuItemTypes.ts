import type { MenuItem } from "@/config";
import type { PageType } from "@/features/routine/pages/types";

export type HeaderMenuItem = Omit<MenuItem, "route"> & {
  route: PageType;
  onBeforeNavigate?: () => void;
  isActive?: boolean;
};
