import { fireEvent, render, screen } from "@testing-library/react";
import { vi } from "vitest";
import { ComparisonForm } from "@/components/landing/comparison-form";

const push = vi.fn();
let searchParams = new URLSearchParams();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
  useSearchParams: () => searchParams,
}));

describe("ComparisonForm", () => {
  beforeEach(() => {
    push.mockReset();
    searchParams = new URLSearchParams();
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

  it("prefills repository inputs from a shared comparison URL", () => {
    searchParams = new URLSearchParams({
      "repo-a": "https://github.com/kutluhangil/Astrobender",
      "repo-b": "https://github.com/gokcank/ProjectNucleus",
    });

    render(<ComparisonForm />);

    expect(screen.getByLabelText("Repository A")).toHaveValue("https://github.com/kutluhangil/Astrobender");
    expect(screen.getByLabelText("Repository B")).toHaveValue("https://github.com/gokcank/ProjectNucleus");
  });

  it("opens the live comparison route for valid repository URLs", () => {
    render(<ComparisonForm />);

    fireEvent.change(screen.getByLabelText("Repository A"), {
      target: { value: "https://github.com/kutluhangil/Astrobender" },
    });
    fireEvent.change(screen.getByLabelText("Repository B"), {
      target: { value: "https://github.com/gokcank/ProjectNucleus" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Compare repositories" }));

    expect(push).toHaveBeenCalledWith("/compare/kutluhangil/Astrobender/vs/gokcank/ProjectNucleus");
  });
});
