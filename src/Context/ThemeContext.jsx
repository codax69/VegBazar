/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext();

const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

const ThemeProvider = ({ children }) => {
  const [theme, setThemeState] = useState("light");

  const applyTheme = (newTheme) => {
    const root = document.documentElement;
    root.setAttribute("data-theme", newTheme);
    root.style.colorScheme = newTheme;
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "light";
    setThemeState(savedTheme);
    applyTheme(savedTheme);
  }, []);

  const setTheme = (newTheme) => {
    setThemeState(newTheme);
    localStorage.setItem("theme", newTheme);
    applyTheme(newTheme);
  };

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ 
      theme,
      setTheme,
      toggleTheme
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

export { ThemeProvider, useTheme };