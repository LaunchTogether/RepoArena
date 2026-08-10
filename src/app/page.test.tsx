import { render, screen } from "@testing-library/react";
import { vi } from "vitest";
import HomePage from "@/app/page";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

describe("HomePage", () => {
  it("renders the core landing thesis and labelled repository inputs", () => {
    render(<HomePage />);

    expect(screen.getByRole("heading", { name: /which repository wins/i })).toBeInTheDocument();
    expect(screen.getByLabelText("Repository A")).toBeInTheDocument();
    expect(screen.getByLabelText("Repository B")).toBeInTheDocument();
  });
});
