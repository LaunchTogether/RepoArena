import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { LocaleProvider } from "@/components/locale/locale-provider";
import { LanguageSwitch } from "@/components/locale/language-switch";
import { AnalysisProgress } from "./analysis-progress";

describe("AnalysisProgress", () => {
  it("renders repository analysis stages in Turkish", () => {
    render(
      <LocaleProvider>
        <LanguageSwitch />
        <AnalysisProgress />
      </LocaleProvider>
    );

    fireEvent.click(screen.getByRole("button", { name: "Türkçe" }));

    expect(screen.getByRole("heading", { name: "Depo sinyalleri okunuyor." })).toBeInTheDocument();
    expect(screen.getByText("Depo metaverisi")).toBeInTheDocument();
  });
});
