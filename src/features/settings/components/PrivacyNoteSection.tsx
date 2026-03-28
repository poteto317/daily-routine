import texts from "../locales/ja.json";

export const PrivacyNoteSection = () => {
  return (
    <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-300">
      <h2 className="text-sm font-medium text-gray-700 dark:text-gray-800 mb-3">
        {texts.privacyNote.title}
      </h2>
      <div className="text-xs text-gray-500 dark:text-gray-600 space-y-2">
        {texts.privacyNote.items.map((item: string) => (
          <p key={item}>{item}</p>
        ))}
        <p className="text-blue-600 dark:text-blue-700 font-medium">
          {texts.privacyNote.hint}
        </p>
      </div>
    </div>
  );
};
