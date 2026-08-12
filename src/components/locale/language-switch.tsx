"use client";

import { useLocale } from "./locale-provider";

export function LanguageSwitch() {
  const { locale, messages, setLocale } = useLocale();

  return (
    <div className="language-switch" aria-label={messages.language.label}>
      <button type="button" onClick={() => setLocale("tr")} aria-pressed={locale === "tr"} aria-label={messages.language.turkish}>TR</button>
      <button type="button" onClick={() => setLocale("en")} aria-pressed={locale === "en"} aria-label={messages.language.english}>EN</button>
    </div>
  );
}
