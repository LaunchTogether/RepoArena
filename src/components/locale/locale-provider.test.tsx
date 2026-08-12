import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { LanguageSwitch } from "./language-switch";
import { LocaleProvider } from "./locale-provider";

describe("LocaleProvider", () => {
  afterEach(() => {
    localStorage.clear();
    document.documentElement.lang = "en";
    document.title = "";
  });

  it("persists Turkish and updates the document language", () => {
    render(
      <LocaleProvider>
        <LanguageSwitch />
      </LocaleProvider>
    );

    fireEvent.click(screen.getByRole("button", { name: "Türkçe" }));

    expect(localStorage.getItem("repoarena-locale")).toBe("tr");
    expect(document.documentElement.lang).toBe("tr");
    expect(document.title).toBe("RepoArena — GitHub Depolarını Karşılaştır");
    expect(screen.getByRole("button", { name: "Türkçe" })).toHaveAttribute("aria-pressed", "true");
  });
});
