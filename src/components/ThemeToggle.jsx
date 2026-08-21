import React from "react";
import { Moon, Sun, Sparkles } from "lucide-react";
import { useTheme } from "@/lib/ThemeContext";

export default function ThemeToggle({ className = "" }) {
  const { theme, toggle } = useTheme();
  const label =
    theme === "dark" ? "Modo claro" : theme === "light" ? "Modo dorado" : "Modo oscuro";
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      title={label}
      className={`w-9 h-9 rounded-xl glass flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-accent transition-colors ${className}`}
    >
      {theme === "dark" ? (
        <Sun className="w-4 h-4" />
      ) : theme === "light" ? (
        <Sparkles className="w-4 h-4" />
      ) : (
        <Moon className="w-4 h-4" />
      )}
    </button>
  );
}