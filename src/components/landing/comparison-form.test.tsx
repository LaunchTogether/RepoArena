import { fireEvent, render, screen } from "@testing-library/react";
import { vi } from "vitest";
import { ComparisonForm } from "@/components/landing/comparison-form";

const push = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

describe("ComparisonForm", () => {
  beforeEach(() => {
    push.mockReset();
  });

  it("fills the official preview repositories", () => {
    render(<ComparisonForm />);

    fireEvent.click(screen.getByRole("button", { name: "Try React vs Vue" }));

    expect(screen.getByLabelText("Repository A")).toHaveValue("https://github.com/facebook/react");
    expect(screen.getByLabelText("Repository B")).toHaveValue("https://github.com/vuejs/core");
  });

  it("shows a recovery message for each empty repository", () => {
    render(<ComparisonForm />);

    fireEvent.click(screen.getByRole("button", { name: "Compare repositories" }));

    expect(screen.getByText("Enter the first GitHub repository URL.")).toBeInTheDocument();
    expect(screen.getByText("Enter the second GitHub repository URL.")).toBeInTheDocument();
  });
});
