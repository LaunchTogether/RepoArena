import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { hydrateRoot } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";
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

  it("hydrates stored locale preferences without a server/client mismatch", async () => {
    const markup = renderToString(
      <LocaleProvider>
        <LanguageSwitch />
      </LocaleProvider>
    );
    const container = document.createElement("div");
    container.innerHTML = markup;
    document.body.append(container);
    localStorage.setItem("repoarena-locale", "tr");
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);

    hydrateRoot(container, <LocaleProvider><LanguageSwitch /></LocaleProvider>);

    await waitFor(() => expect(document.documentElement.lang).toBe("tr"));
    expect(consoleError).not.toHaveBeenCalled();
    consoleError.mockRestore();
  });
});
