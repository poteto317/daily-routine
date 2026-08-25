import type { DynamicOptionsLoadingProps } from "next/dynamic";
import { PageContentLoading } from "./PageContentLoading";

export const PageDynamicFallback = ({ error }: DynamicOptionsLoadingProps) => {
  if (error) throw error;

  return <PageContentLoading />;
};
