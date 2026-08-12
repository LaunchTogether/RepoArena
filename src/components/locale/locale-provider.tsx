"use client";

import { createContext, useContext, useEffect, useMemo, useSyncExternalStore } from "react";
import { messages, type Locale, type LocaleMessages } from "./messages";

const storageKey = "repoarena-locale";
const localeChangeEvent = "repoarena-locale-change";
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
}

function subscribeToLocale(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  window.addEventListener(localeChangeEvent, onStoreChange);

  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener(localeChangeEvent, onStoreChange);
  };
}

function storeLocale(locale: Locale) {
  localStorage.setItem(storageKey, locale);
  window.dispatchEvent(new Event(localeChangeEvent));
}

export function LocaleProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const locale = useSyncExternalStore(subscribeToLocale, readStoredLocale, () => defaultLocale);

  useEffect(() => {
    applyLocale(locale);
  }, [locale]);

  const value = useMemo<LocaleContextValue>(() => ({
    locale,
    messages: messages[locale],
    setLocale: (nextLocale) => {
      storeLocale(nextLocale);
    },
  }), [locale]);

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  return useContext(LocaleContext);
}
