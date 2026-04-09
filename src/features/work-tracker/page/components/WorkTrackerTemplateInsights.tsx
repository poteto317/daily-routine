import { type WorkTemplate } from "@/types/routine";
import {
  formatTimerLong,
  getSessionsByTemplateId,
  getTemplateStats,
} from "@/lib/storage";
import {
  EMPTY_TEMPLATE_STATS,
  getTemplateInsightCards,
  getTrendMessage,
} from "../helpers";
import workTrackerTexts from "../../locales/ja.json";

type Props = {
  selectedTemplate: WorkTemplate | null;
  workName: string;
  elapsedTime: number;
};

export const WorkTrackerTemplateInsights = ({
  selectedTemplate,
  workName,
  elapsedTime,
}: Props) => {
  const stats = selectedTemplate
    ? getTemplateStats(selectedTemplate.id)
    : EMPTY_TEMPLATE_STATS;
  const previousSessions = selectedTemplate
    ? getSessionsByTemplateId(selectedTemplate.id).slice(0, 3)
    : [];
  const insightCards = getTemplateInsightCards(stats, formatTimerLong);
  const trendMessage = getTrendMessage({ stats, elapsedTime });

  if (!(selectedTemplate || workName.trim()) || stats.count === 0) {
    return null;
  }

  return (
    <div className="mb-4 p-4 bg-white dark:bg-white rounded-lg border border-gray-300">
      <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
        {workTrackerTexts.templateInsights.historyPrefix}
        {selectedTemplate?.name || workName.trim()}
        {workTrackerTexts.templateInsights.historySuffix}
      </h4>
      <div className="grid grid-cols-3 gap-3 mb-3">
        {insightCards.map((card) => (
          <div key={card.id} className={card.className}>
            <p className="text-xs text-gray-600 dark:text-gray-800">
              {card.title}
            </p>
            <p className={card.valueClassName}>{card.value}</p>
          </div>
        ))}
      </div>
      <div className="mb-3">
        <p className="text-xs text-gray-600 dark:text-gray-800 mb-1">
          {workTrackerTexts.templateInsights.currentTimeLabel}:{" "}
          <span className="font-bold">{formatTimerLong(elapsedTime)}</span>
        </p>
        {trendMessage && (
          <div className={trendMessage.className}>
            <span>{trendMessage.icon}</span>
            <span className="font-medium">{trendMessage.message}</span>
          </div>
        )}
      </div>
      {previousSessions.length > 0 && (
        <div className="border-t border-gray-200 pt-3">
          <p className="text-xs font-medium text-gray-700 dark:text-gray-900 mb-2">
            {workTrackerTexts.templateInsights.recentSessionsLabel}
          </p>
          <div className="space-y-2">
            {previousSessions.map((session) => (
              <div
                key={session.id}
                className="text-xs text-gray-600 dark:text-gray-800 flex items-center justify-between"
              >
                <span>
                  {new Date(session.createdAt).toLocaleDateString("ja-JP", {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
                <span className="font-mono font-bold">
                  {formatTimerLong(session.duration || 0)}
                </span>
                {session.notes && (
                  <span className="text-gray-500 truncate max-w-25">
                    💭 {session.notes}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
