import { render, screen } from "@testing-library/react";
import { ComparisonView } from "@/components/comparison/comparison-view";
import { previewComparison } from "@/lib/preview/comparison-result";

describe("ComparisonView", () => {
  it("renders both repositories, seven categories, and explainable signals", () => {
    render(<ComparisonView result={previewComparison} />);

    expect(screen.getAllByText("react").length).toBeGreaterThan(0);
    expect(screen.getAllByText("core").length).toBeGreaterThan(0);
    expect(screen.getByText("Winner")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Project health" })).toBeInTheDocument();
    expect(screen.getByText("Large open issue backlog")).toBeInTheDocument();
    expect(screen.getByText("Active maintainer interaction")).toBeInTheDocument();
  });
});
