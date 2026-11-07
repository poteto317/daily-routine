import { useId } from "react";
import { CardPanel } from "@/components";
import journalTexts from "../../locales/ja.json";
import type { WeeklyLogState } from "../useWeeklyLogState";
import { WeeklyLogEditor } from "./WeeklyLogEditor";
import { WeeklyLogList } from "./WeeklyLogList";
import { WeeklyLogWeekNavigator } from "./WeeklyLogWeekNavigator";

type WeeklyLogCardProps = {
  state: WeeklyLogState;
};

export const WeeklyLogCard = ({ state }: WeeklyLogCardProps) => {
  const headingId = useId();
  return (
    <CardPanel>
      <section aria-labelledby={headingId}>
        <h2
          id={headingId}
          className="text-xl font-bold text-gray-900 dark:text-gray-900 mb-4"
        >
          {journalTexts.weeklyLog.title}
        </h2>
        <WeeklyLogWeekNavigator
          weekStart={state.selectedWeekStart}
          isCurrentWeek={state.selectedWeekStart === state.currentWeekStart}
          canGoPrevious={state.canNavigate}
          canGoNext={state.canGoNext}
          onPrevious={state.goToPreviousWeek}
          onNext={state.goToNextWeek}
        />
        <WeeklyLogEditor
          entry={state.selectedEntry}
          isEditing={state.isEditing}
          contentInput={state.contentInput}
          onStartEditing={state.startEditing}
          onCancel={state.cancelEditing}
          onContentChange={state.changeContent}
          onSave={state.save}
          onRemove={state.remove}
        />
        <WeeklyLogList
          entries={state.entries}
          selectedWeekStart={state.selectedWeekStart}
          canOpen={state.canNavigate}
          onOpenWeek={state.openWeek}
        />
      </section>
    </CardPanel>
  );
};
