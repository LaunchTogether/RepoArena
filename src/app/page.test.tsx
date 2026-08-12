import { fireEvent, render, screen } from "@testing-library/react";
import { vi } from "vitest";
import HomePage from "@/app/page";
import { LocaleProvider } from "@/components/locale/locale-provider";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

describe("HomePage", () => {
  it("renders the core landing thesis and labelled repository inputs", () => {
    render(<HomePage />);

    expect(screen.getByRole("heading", { name: /which repository wins/i })).toBeInTheDocument();
    expect(screen.getByLabelText("Repository A")).toBeInTheDocument();
    expect(screen.getByLabelText("Repository B")).toBeInTheDocument();
  });

  it("renders the landing interface in Turkish after changing locale", () => {
    render(<LocaleProvider><HomePage /></LocaleProvider>);

    fireEvent.click(screen.getByRole("button", { name: "Türkçe" }));

    expect(screen.getByRole("heading", { name: /hangi depo kazanır/i })).toBeInTheDocument();
    expect(screen.getByLabelText("Depo A")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Depoları karşılaştır" })).toBeInTheDocument();
  });
});
