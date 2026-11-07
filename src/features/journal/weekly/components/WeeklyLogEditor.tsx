import type { WeeklyLogEntry } from "@/types/routine";
import { WeeklyLogEmpty } from "./WeeklyLogEmpty";
import { WeeklyLogForm } from "./WeeklyLogForm";
import { WeeklyLogView } from "./WeeklyLogView";

type WeeklyLogEditorProps = {
  entry: WeeklyLogEntry | null;
  isEditing: boolean;
  contentInput: string;
  onStartEditing: () => void;
  onCancel: () => void;
  onContentChange: (value: string) => void;
  onSave: () => void;
  onRemove: () => void;
};

export const WeeklyLogEditor = ({
  entry,
  isEditing,
  contentInput,
  onStartEditing,
  onCancel,
  onContentChange,
  onSave,
  onRemove,
}: WeeklyLogEditorProps) => {
  if (isEditing) {
    return (
      <WeeklyLogForm
        contentInput={contentInput}
        onContentChange={onContentChange}
        onSave={onSave}
        onCancel={onCancel}
      />
    );
  }
  if (!entry) return <WeeklyLogEmpty onStartEditing={onStartEditing} />;
  return (
    <WeeklyLogView
      entry={entry}
      onStartEditing={onStartEditing}
      onRemove={onRemove}
    />
  );
};
