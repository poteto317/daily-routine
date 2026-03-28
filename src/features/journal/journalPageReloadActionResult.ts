type JournalPageReloadActionResultArgs = {
  loadData: () => void;
};

export const createJournalPageReloadActionResult = ({
  loadData,
}: JournalPageReloadActionResultArgs) => {
  return { loadData };
};
