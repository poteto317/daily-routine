import type { WorkTemplate } from "@/types/routine";

export const getFilteredTemplates = (
  templates: WorkTemplate[],
  query: string,
): WorkTemplate[] =>
  templates
    .filter((template) =>
      template.name.toLowerCase().includes(query.toLowerCase()),
    )
    .sort((left, right) => {
      const leftTime = left.lastUsedAt
        ? new Date(left.lastUsedAt).getTime()
        : 0;
      const rightTime = right.lastUsedAt
        ? new Date(right.lastUsedAt).getTime()
        : 0;
      return rightTime - leftTime;
    })
    .slice(0, 5);
