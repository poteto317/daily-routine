import type { WorkSession } from "@/types/routine";
import { WorkTrackerSessionHistoryItem } from "./WorkTrackerSessionHistoryItem";
import workTrackerTexts from "../../locales/ja.json";

type Props = {
  sessions: WorkSession[];
  onDeleteSession: (sessionId: string) => void;
};

export const WorkTrackerSessionHistory = ({
  sessions,
  onDeleteSession,
}: Props) => {
  return (
    <div className="mt-8">
      <h3 className="text-xl font-bold text-gray-900 dark:text-black mb-4">
        {workTrackerTexts.sessionHistory.title}
      </h3>
      {sessions.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-600">
          {workTrackerTexts.sessionHistory.empty}
        </div>
      ) : (
        <div className="space-y-3">
          {sessions
            .slice()
            .reverse()
            .map((session) => (
              <WorkTrackerSessionHistoryItem
                key={session.id}
                session={session}
                onDeleteSession={onDeleteSession}
              />
            ))}
        </div>
      )}
    </div>
  );
};
