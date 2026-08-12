"use client";

import { useEffect, useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";
import { useLocale } from "@/components/locale/locale-provider";

type Theme = "dark" | "light";

const storageKey = "repoarena-theme";
const themeChangeEvent = "repoarena-theme-change";

function getStoredTheme(): Theme {
  return localStorage.getItem(storageKey) === "light" ? "light" : "dark";
}

function subscribeToThemeChange(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  window.addEventListener(themeChangeEvent, onStoreChange);

  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener(themeChangeEvent, onStoreChange);
  };
}

function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  localStorage.setItem(storageKey, theme);
  window.dispatchEvent(new Event(themeChangeEvent));
}

export function ThemeToggle() {
  const theme = useSyncExternalStore(subscribeToThemeChange, getStoredTheme, () => "dark");
  const { messages } = useLocale();

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  const nextTheme: Theme = theme === "dark" ? "light" : "dark";
  const label = nextTheme === "light" ? messages.theme.switchToLight : messages.theme.switchToDark;

  return (
    <button
      className="theme-toggle"
      type="button"
      onClick={() => {
        applyTheme(nextTheme);
      }}
      aria-label={label}
      title={label}
    >
      {theme === "dark" ? <Sun size={16} aria-hidden="true" /> : <Moon size={16} aria-hidden="true" />}
      <span>{theme === "dark" ? messages.theme.light : messages.theme.dark}</span>
    </button>
  );
}
