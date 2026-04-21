import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";

type Theme = "dark" | "light";

interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
  isTransitioning: boolean;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: "dark",
  toggleTheme: () => {},
  isTransitioning: false,
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("masoul-theme") as Theme | null;
      if (stored === "dark" || stored === "light") return stored;
      return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }
    return "dark";
  });
  const [isTransitioning, setIsTransitioning] = useState(false);
  const transitioningRef = useRef(false);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("masoul-theme", theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    if (transitioningRef.current) return;
    transitioningRef.current = true;
    setIsTransitioning(true);

    // Small delay to let the transition overlay render
    setTimeout(() => {
      setTheme((prev) => (prev === "dark" ? "light" : "dark"));

      // Keep transitioning flag for the animation duration
      setTimeout(() => {
        setIsTransitioning(false);
        transitioningRef.current = false;
      }, 600);
    }, 50);
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isTransitioning }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
