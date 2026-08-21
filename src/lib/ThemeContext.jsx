import React, { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext({ theme: "dark", toggle: () => {} });

const CYCLE = ["dark", "light", "gold"];

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    if (typeof window === "undefined") return "dark";
    return localStorage.getItem("nexus-theme") || "dark";
  });

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
    root.classList.toggle("gold", theme === "gold");
    localStorage.setItem("nexus-theme", theme);
  }, [theme]);

  const toggle = () =>
    setTheme((t) => {
      const idx = CYCLE.indexOf(t);
      return CYCLE[(idx + 1) % CYCLE.length];
    });

  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);