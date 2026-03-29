import { fireEvent, render, screen } from "@testing-library/react";
import { JournalRecentEntries } from "../components/JournalRecentEntries";

const makeEntry = (override?: Record<string, unknown>) => ({
  id: "entry-1",
  date: "2024-01-12",
  title: "日記タイトル",
  content: "本文テキスト",
  createdAt: "2024-01-12T10:00:00.000Z",
  updatedAt: "2024-01-12T10:00:00.000Z",
  ...override,
});

describe("JournalRecentEntries", () => {
  const onEditEntry = jest.fn();
  const onDeleteEntry = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("エントリが空のとき空メッセージを表示する", () => {
    render(
      <JournalRecentEntries
        entries={[]}
        onEditEntry={onEditEntry}
        onDeleteEntry={onDeleteEntry}
      />,
    );

    expect(screen.getByText("記録がありません")).toBeInTheDocument();
  });

  it("エントリがあるときタイトルと本文を表示する", () => {
    render(
      <JournalRecentEntries
        entries={[makeEntry()]}
        onEditEntry={onEditEntry}
        onDeleteEntry={onDeleteEntry}
      />,
    );

    expect(screen.getByText("日記タイトル")).toBeInTheDocument();
    expect(screen.getByText("本文テキスト")).toBeInTheDocument();
  });

  it("各エントリに編集ボタンと削除ボタンを表示する", () => {
    render(
      <JournalRecentEntries
        entries={[makeEntry()]}
        onEditEntry={onEditEntry}
        onDeleteEntry={onDeleteEntry}
      />,
    );

    expect(screen.getByRole("button", { name: "✏️ 編集" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "🗑️ 削除" })).toBeInTheDocument();
  });

  it("編集ボタンをクリックすると onEditEntry がエントリを引数にして呼ばれる", () => {
    const entry = makeEntry();
    render(
      <JournalRecentEntries
        entries={[entry]}
        onEditEntry={onEditEntry}
        onDeleteEntry={onDeleteEntry}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "✏️ 編集" }));
    expect(onEditEntry).toHaveBeenCalledWith(entry);
    expect(onDeleteEntry).not.toHaveBeenCalled();
  });

  it("削除ボタンをクリックすると onDeleteEntry がエントリを引数にして呼ばれる", () => {
    const entry = makeEntry();
    render(
      <JournalRecentEntries
        entries={[entry]}
        onEditEntry={onEditEntry}
        onDeleteEntry={onDeleteEntry}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "🗑️ 削除" }));
    expect(onDeleteEntry).toHaveBeenCalledWith(entry);
    expect(onEditEntry).not.toHaveBeenCalled();
  });

  it("複数エントリのとき編集・削除ボタンがエントリ数分表示される", () => {
    const entries = [
      makeEntry({ id: "a", title: "1件目" }),
      makeEntry({ id: "b", title: "2件目" }),
    ];
    render(
      <JournalRecentEntries
        entries={entries}
        onEditEntry={onEditEntry}
        onDeleteEntry={onDeleteEntry}
      />,
    );

    expect(screen.getAllByRole("button", { name: "✏️ 編集" })).toHaveLength(2);
    expect(screen.getAllByRole("button", { name: "🗑️ 削除" })).toHaveLength(2);
  });
});
