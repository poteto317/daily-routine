import { render, screen } from "@testing-library/react";
import { ApiKeySection } from "../ApiKeySection";

const mockFirebase = jest.fn();

jest.mock("@/lib/firebase", () => ({
  get isFirebaseConfigured() {
    return mockFirebase();
  },
}));
jest.mock("../ApiKeyPanel", () => ({
  ApiKeyPanel: () => <div data-testid="api-key-panel" />,
}));

describe("ApiKeySection", () => {
  it("Firebase が設定済みなら API キー欄を表示する", () => {
    mockFirebase.mockReturnValue(true);
    render(<ApiKeySection />);
    expect(screen.getByTestId("api-key-panel")).toBeInTheDocument();
  });

  it("Firebase 未設定（ローカルモード）なら何も表示しない", () => {
    mockFirebase.mockReturnValue(false);
    const { container } = render(<ApiKeySection />);
    expect(screen.queryByTestId("api-key-panel")).toBeNull();
    expect(container).toBeEmptyDOMElement();
  });
});
