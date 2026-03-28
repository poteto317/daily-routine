import workTrackerTexts from "../../locales/ja.json";

export const WorkTrackerHeader = () => {
  return (
    <>
      <div className="flex items-center justify-center gap-3 mb-2">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-black text-center">
          {workTrackerTexts.header.title}
        </h2>
        <span className="px-3 py-1 bg-orange-500 text-white text-xs font-bold rounded-full">
          {workTrackerTexts.header.beta}
        </span>
      </div>
      <p className="text-gray-600 dark:text-gray-800 text-center mb-8">
        {workTrackerTexts.header.description}
      </p>
    </>
  );
};
