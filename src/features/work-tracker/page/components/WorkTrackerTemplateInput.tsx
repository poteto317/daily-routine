import type { WorkTemplate } from "@/types/routine";
import { formatTimerLong, getTemplateStats } from "@/lib/storage";
import {
  getFilteredTemplates,
  formatNewWorkNameLabel,
  getTemplateStatsSummaryLabel,
  shouldShowTemplateDropdown,
} from "../helpers";
import workTrackerTexts from "../../locales/ja.json";

type Props = {
  workName: string;
  templates: WorkTemplate[];
  showTemplateDropdown: boolean;
  setWorkName: (value: string) => void;
  setSelectedTemplate: (template: WorkTemplate | null) => void;
  setShowTemplateDropdown: (value: boolean) => void;
};

export const WorkTrackerTemplateInput = ({
  workName,
  templates,
  showTemplateDropdown,
  setWorkName,
  setSelectedTemplate,
  setShowTemplateDropdown,
}: Props) => {
  const filteredTemplates = getFilteredTemplates(templates, workName);
  const showDropdown = shouldShowTemplateDropdown(
    showTemplateDropdown,
    workName,
  );

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-900 mb-2">
        {workTrackerTexts.templateInput.label}{" "}
        <span className="text-red-500">{workTrackerTexts.templateInput.requiredMark}</span>
      </label>
      <div className="relative">
        <input
          type="text"
          value={workName}
          onChange={(e) => {
            setWorkName(e.target.value);
            setShowTemplateDropdown(e.target.value.length > 0);
          }}
          onFocus={() => setShowTemplateDropdown(workName.length > 0)}
          placeholder={workTrackerTexts.templateInput.placeholder}
          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-white text-gray-900"
          autoFocus
        />
        {showDropdown && (
          <div className="absolute z-10 w-full mt-1 bg-white dark:bg-white border border-gray-300 dark:border-gray-400 rounded-lg shadow-lg max-h-48 overflow-y-auto">
            {filteredTemplates.map((template) => {
              const templateStats = getTemplateStats(template.id);
              return (
                <button
                  key={template.id}
                  type="button"
                  onClick={() => {
                    setWorkName(template.name);
                    setSelectedTemplate(template);
                    setShowTemplateDropdown(false);
                  }}
                  className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-200 flex items-center justify-between gap-2 border-b border-gray-200 last:border-b-0"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {template.name}
                    </p>
                    {templateStats.count > 0 && (
                      <p className="text-xs text-gray-600 dark:text-gray-700">
                        {getTemplateStatsSummaryLabel(
                          templateStats.count,
                          formatTimerLong(templateStats.bestDuration),
                        )}
                      </p>
                    )}
                  </div>
                  <span className="text-xs text-gray-500 shrink-0">
                    {template.lastUsedAt
                      ? workTrackerTexts.templateInput.recentlyUsedLabel
                      : ""}
                  </span>
                </button>
              );
            })}
            {filteredTemplates.length === 0 && (
              <div className="px-4 py-3 text-sm text-gray-600 dark:text-gray-700">
                <p className="font-medium">{workTrackerTexts.templateInput.newWorkHint}</p>
                <p className="text-xs mt-1">
                  {formatNewWorkNameLabel(workName)}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
