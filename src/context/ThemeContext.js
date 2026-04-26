import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { MD3DarkTheme as PaperDarkTheme, MD3LightTheme as PaperLightTheme } from "react-native-paper";

const lightColors = {
  background: "#FFFFFF",
  surface: "#FFFFFF",
  surfaceMuted: "#F7F3FF",
  border: "#EEE6FF",
  text: "#1F1B2E",
  textMuted: "#6B6780",
  primary: "#A259FF",
  danger: "#E25555",
  success: "#2E9E6F",
};

const darkColors = {
  background: "#14111F",
  surface: "#1F1B2E",
  surfaceMuted: "#2D2740",
  border: "#3B3353",
  text: "#FFFFFF",
  textMuted: "#C8C1E6",
  primary: "#BB86FC",
  danger: "#FF8A80",
  success: "#77D3A8",
};

const ThemeContext = createContext(null);

const getAdaptiveDarkMode = (date = new Date()) => {
  const hour = date.getHours();
  return hour >= 19 || hour < 7;
};

export const ThemeProvider = ({ children }) => {
  const [themeMode, setThemeMode] = useState("light");
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    if (themeMode !== "adaptive") return undefined;

    const timer = setInterval(() => {
      setNow(new Date());
    }, 60 * 1000);

    return () => clearInterval(timer);
  }, [themeMode]);

  const value = useMemo(() => {
    const isDarkMode =
      themeMode === "dark" || (themeMode === "adaptive" && getAdaptiveDarkMode(now));
    const colors = isDarkMode ? darkColors : lightColors;
    const paperTheme = {
      ...(isDarkMode ? PaperDarkTheme : PaperLightTheme),
      colors: {
        ...(isDarkMode ? PaperDarkTheme.colors : PaperLightTheme.colors),
        primary: colors.primary,
        background: colors.background,
        surface: colors.surface,
        onSurface: colors.text,
        text: colors.text,
      },
    };

    return {
      isDarkMode,
      themeMode,
      colors,
      paperTheme,
      setThemeMode,
    };
  }, [now, themeMode]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useAppTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useAppTheme must be used within ThemeProvider");
  }
  return context;
};
