"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { messages, type Locale, type LocaleMessages } from "./messages";

const storageKey = "repoarena-locale";
const defaultLocale: Locale = "en";

type LocaleContextValue = {
  locale: Locale;
  messages: LocaleMessages;
  setLocale: (locale: Locale) => void;
};

const LocaleContext = createContext<LocaleContextValue>({
  locale: defaultLocale,
  messages: messages[defaultLocale],
  setLocale: () => undefined,
});

function readStoredLocale(): Locale {
  return localStorage.getItem(storageKey) === "tr" ? "tr" : defaultLocale;
}

function applyLocale(locale: Locale) {
  document.documentElement.lang = locale;
  document.title = messages[locale].documentTitle;
  localStorage.setItem(storageKey, locale);
}

export function LocaleProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const [locale, setLocaleState] = useState<Locale>(() => typeof window === "undefined" ? defaultLocale : readStoredLocale());

  useEffect(() => {
    applyLocale(locale);
  }, [locale]);

  const value = useMemo<LocaleContextValue>(() => ({
    locale,
    messages: messages[locale],
    setLocale: (nextLocale) => {
      setLocaleState(nextLocale);
    },
  }), [locale]);

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  return useContext(LocaleContext);
}
