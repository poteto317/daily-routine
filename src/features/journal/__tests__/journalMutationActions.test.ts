import {
  deleteJournalEntryAndReload,
  saveJournalEntryAndReload,
  updateJournalEntryAndReload,
} from "../journalMutationActions";

const dateAlertMessages = {
  invalid: "日付を正しく入力してください",
  future: "未来の日付は保存できません",
};

describe("journalMutationActions", () => {
  describe("saveJournalEntryAndReload", () => {
    const baseArgs = {
      today: "2024-01-12",
      date: "2024-01-12",
      titleInput: "タイトル",
      contentInput: "本文",
      defaultTitle: "無題",
      alertMessage: "内容を入力してください",
      dateAlertMessages,
    };

    it("空入力なら保存せず alert する", () => {
      const alertFn = jest.fn();
      const saveEntry = jest.fn();

      const result = saveJournalEntryAndReload({
        ...baseArgs,
        titleInput: "  ",
        contentInput: "  ",
        saveEntry,
        reloadData: jest.fn(),
        closeForm: jest.fn(),
        alertFn,
      });

      expect(result).toBe(false);
      expect(alertFn).toHaveBeenCalledWith("内容を入力してください");
      expect(saveEntry).not.toHaveBeenCalled();
    });

    it("入力があれば、渡された日付で保存して再読込しフォームを閉じる", () => {
      const saveEntry = jest.fn();
      const reloadData = jest.fn();
      const closeForm = jest.fn();

      const result = saveJournalEntryAndReload({
        ...baseArgs,
        date: "2024-01-10",
        titleInput: "  ",
        contentInput: " memo ",
        saveEntry,
        reloadData,
        closeForm,
      });

      expect(result).toBe(true);
      expect(saveEntry).toHaveBeenCalledWith("2024-01-10", "無題", "memo");
      expect(reloadData).toHaveBeenCalled();
      expect(closeForm).toHaveBeenCalled();
    });

    it("今日の日付は保存できる", () => {
      const saveEntry = jest.fn();

      const result = saveJournalEntryAndReload({
        ...baseArgs,
        saveEntry,
        reloadData: jest.fn(),
        closeForm: jest.fn(),
      });

      expect(result).toBe(true);
      expect(saveEntry).toHaveBeenCalledWith("2024-01-12", "タイトル", "本文");
    });

    it.each(["", "2024/01/10", "2024-02-30", "123456-01-01"])(
      "日付が空・不正（%s）なら保存せず、不正の文言で alert して入力を残す",
      (date) => {
        const alertFn = jest.fn();
        const saveEntry = jest.fn();
        const reloadData = jest.fn();
        const closeForm = jest.fn();

        const result = saveJournalEntryAndReload({
          ...baseArgs,
          date,
          saveEntry,
          reloadData,
          closeForm,
          alertFn,
        });

        expect(result).toBe(false);
        expect(alertFn).toHaveBeenCalledWith(dateAlertMessages.invalid);
        expect(saveEntry).not.toHaveBeenCalled();
        expect(reloadData).not.toHaveBeenCalled();
        expect(closeForm).not.toHaveBeenCalled();
      },
    );

    it.each(["0202-11-03", "1899-12-31"])(
      "日付が下限（1900-01-01）より前（%s）なら保存せず、不正の文言で alert して入力を残す",
      (date) => {
        const alertFn = jest.fn();
        const saveEntry = jest.fn();
        const reloadData = jest.fn();
        const closeForm = jest.fn();

        const result = saveJournalEntryAndReload({
          ...baseArgs,
          date,
          saveEntry,
          reloadData,
          closeForm,
          alertFn,
        });

        expect(result).toBe(false);
        expect(alertFn).toHaveBeenCalledWith(dateAlertMessages.invalid);
        expect(saveEntry).not.toHaveBeenCalled();
        expect(reloadData).not.toHaveBeenCalled();
        expect(closeForm).not.toHaveBeenCalled();
      },
    );

    it("今日より後の日付なら保存せず、未来の文言で alert する", () => {
      const alertFn = jest.fn();
      const saveEntry = jest.fn();
      const reloadData = jest.fn();
      const closeForm = jest.fn();

      const result = saveJournalEntryAndReload({
        ...baseArgs,
        date: "2024-01-13",
        saveEntry,
        reloadData,
        closeForm,
        alertFn,
      });

      expect(result).toBe(false);
      expect(alertFn).toHaveBeenCalledWith(dateAlertMessages.future);
      expect(saveEntry).not.toHaveBeenCalled();
      expect(reloadData).not.toHaveBeenCalled();
      expect(closeForm).not.toHaveBeenCalled();
    });

    it("保存してから再読込し、最後にフォームを閉じる", () => {
      const saveEntry = jest.fn();
      const reloadData = jest.fn();
      const closeForm = jest.fn();

      saveJournalEntryAndReload({
        ...baseArgs,
        saveEntry,
        reloadData,
        closeForm,
      });

      const [saveOrder] = saveEntry.mock.invocationCallOrder;
      const [reloadOrder] = reloadData.mock.invocationCallOrder;
      const [closeOrder] = closeForm.mock.invocationCallOrder;
      expect(saveOrder).toBeLessThan(reloadOrder);
      expect(reloadOrder).toBeLessThan(closeOrder);
    });
  });

  describe("deleteJournalEntryAndReload", () => {
    it("削除確認で同意したときだけ削除して再読込する", () => {
      const deleteEntry = jest.fn();
      const reloadData = jest.fn();
      const confirmFn = jest.fn(() => true);

      expect(
        deleteJournalEntryAndReload({
          entryId: "entry-1",
          confirmMessage: "delete?",
          deleteEntry,
          reloadData,
          confirmFn,
        }),
      ).toBe(true);
      expect(deleteEntry).toHaveBeenCalledWith("entry-1");
      expect(reloadData).toHaveBeenCalled();
    });

    it("削除確認で拒否したときは何もしない", () => {
      const deleteEntry = jest.fn();
      const reloadData = jest.fn();

      expect(
        deleteJournalEntryAndReload({
          entryId: "entry-1",
          confirmMessage: "delete?",
          deleteEntry,
          reloadData,
          confirmFn: jest.fn(() => false),
        }),
      ).toBe(false);
      expect(deleteEntry).not.toHaveBeenCalled();
      expect(reloadData).not.toHaveBeenCalled();
    });
  });

  describe("updateJournalEntryAndReload", () => {
    const baseArgs = {
      entryId: "entry-1",
      originalDate: "2024-01-10",
      dateInput: null,
      today: "2024-01-12",
      titleInput: "タイトル",
      contentInput: "本文",
      defaultTitle: "無題",
      alertMessage: "内容を入力してください",
      dateAlertMessages,
    };

    it("entryId が空なら Error を投げる", () => {
      const updateEntry = jest.fn();

      expect(() =>
        updateJournalEntryAndReload({
          ...baseArgs,
          entryId: "",
          updateEntry,
          reloadData: jest.fn(),
          closeForm: jest.fn(),
        }),
      ).toThrow("updateJournalEntryAndReload: entryId is required");
      expect(updateEntry).not.toHaveBeenCalled();
    });

    it("空入力なら更新せず alert する", () => {
      const alertFn = jest.fn();
      const updateEntry = jest.fn();

      const result = updateJournalEntryAndReload({
        ...baseArgs,
        titleInput: "  ",
        contentInput: "  ",
        updateEntry,
        reloadData: jest.fn(),
        closeForm: jest.fn(),
        alertFn,
      });

      expect(result).toBe(false);
      expect(alertFn).toHaveBeenCalledWith("内容を入力してください");
      expect(updateEntry).not.toHaveBeenCalled();
    });

    it("日付を変えない（dateInput が null）なら、日付を渡さずに更新して再読込しフォームを閉じる", () => {
      const updateEntry = jest.fn();
      const reloadData = jest.fn();
      const closeForm = jest.fn();

      const result = updateJournalEntryAndReload({
        ...baseArgs,
        titleInput: "  ",
        contentInput: " 更新内容 ",
        updateEntry,
        reloadData,
        closeForm,
      });

      expect(result).toBe(true);
      expect(updateEntry).toHaveBeenCalledWith("entry-1", "無題", "更新内容");
      // 4 番目の引数（日付）を渡さない。undefined も明示しない
      expect(updateEntry.mock.calls[0]).toHaveLength(3);
      expect(reloadData).toHaveBeenCalled();
      expect(closeForm).toHaveBeenCalled();
    });

    it("dateInput が編集前の日付と同じなら、日付を渡さない", () => {
      const updateEntry = jest.fn();

      updateJournalEntryAndReload({
        ...baseArgs,
        dateInput: "2024-01-10",
        updateEntry,
        reloadData: jest.fn(),
        closeForm: jest.fn(),
      });

      expect(updateEntry.mock.calls[0]).toEqual([
        "entry-1",
        "タイトル",
        "本文",
      ]);
    });

    it("日付を変えたときは、検証に通れば日付を渡す", () => {
      const updateEntry = jest.fn();

      const result = updateJournalEntryAndReload({
        ...baseArgs,
        dateInput: "2024-01-05",
        updateEntry,
        reloadData: jest.fn(),
        closeForm: jest.fn(),
      });

      expect(result).toBe(true);
      expect(updateEntry).toHaveBeenCalledWith(
        "entry-1",
        "タイトル",
        "本文",
        "2024-01-05",
      );
    });

    it("日付を変えないときは検証しない（編集前が未来日でも、タイトルだけ直す保存が通る）", () => {
      const alertFn = jest.fn();
      const updateEntry = jest.fn();

      const result = updateJournalEntryAndReload({
        ...baseArgs,
        originalDate: "2099-12-31",
        dateInput: null,
        updateEntry,
        reloadData: jest.fn(),
        closeForm: jest.fn(),
        alertFn,
      });

      expect(result).toBe(true);
      expect(alertFn).not.toHaveBeenCalled();
      expect(updateEntry.mock.calls[0]).toEqual([
        "entry-1",
        "タイトル",
        "本文",
      ]);
    });

    it("日付を空にして更新すると、更新せず不正の文言で alert し、再読込もフォームを閉じることもしない", () => {
      const alertFn = jest.fn();
      const updateEntry = jest.fn();
      const reloadData = jest.fn();
      const closeForm = jest.fn();

      const result = updateJournalEntryAndReload({
        ...baseArgs,
        dateInput: "",
        updateEntry,
        reloadData,
        closeForm,
        alertFn,
      });

      expect(result).toBe(false);
      expect(alertFn).toHaveBeenCalledWith(dateAlertMessages.invalid);
      expect(updateEntry).not.toHaveBeenCalled();
      expect(reloadData).not.toHaveBeenCalled();
      expect(closeForm).not.toHaveBeenCalled();
    });

    it.each(["0202-11-03", "1899-12-31"])(
      "日付を下限（1900-01-01）より前（%s）に変えて更新すると、更新せず不正の文言で alert し、再読込もフォームを閉じることもしない",
      (dateInput) => {
        const alertFn = jest.fn();
        const updateEntry = jest.fn();
        const reloadData = jest.fn();
        const closeForm = jest.fn();

        const result = updateJournalEntryAndReload({
          ...baseArgs,
          dateInput,
          updateEntry,
          reloadData,
          closeForm,
          alertFn,
        });

        expect(result).toBe(false);
        expect(alertFn).toHaveBeenCalledWith(dateAlertMessages.invalid);
        expect(updateEntry).not.toHaveBeenCalled();
        expect(reloadData).not.toHaveBeenCalled();
        expect(closeForm).not.toHaveBeenCalled();
      },
    );

    it("日付を未来に変えて更新すると、更新せず未来の文言で alert する", () => {
      const alertFn = jest.fn();
      const updateEntry = jest.fn();
      const reloadData = jest.fn();
      const closeForm = jest.fn();

      const result = updateJournalEntryAndReload({
        ...baseArgs,
        dateInput: "2024-01-13",
        updateEntry,
        reloadData,
        closeForm,
        alertFn,
      });

      expect(result).toBe(false);
      expect(alertFn).toHaveBeenCalledWith(dateAlertMessages.future);
      expect(updateEntry).not.toHaveBeenCalled();
      expect(reloadData).not.toHaveBeenCalled();
      expect(closeForm).not.toHaveBeenCalled();
    });

    it.each([
      ["日付を変えない", null],
      ["日付を変えた", "2024-01-05"],
    ])(
      "%sときも、更新してから再読込し、最後にフォームを閉じる",
      (_label, dateInput) => {
        const updateEntry = jest.fn();
        const reloadData = jest.fn();
        const closeForm = jest.fn();

        updateJournalEntryAndReload({
          ...baseArgs,
          dateInput,
          updateEntry,
          reloadData,
          closeForm,
        });

        const [updateOrder] = updateEntry.mock.invocationCallOrder;
        const [reloadOrder] = reloadData.mock.invocationCallOrder;
        const [closeOrder] = closeForm.mock.invocationCallOrder;
        expect(updateOrder).toBeLessThan(reloadOrder);
        expect(reloadOrder).toBeLessThan(closeOrder);
      },
    );
  });
});
