// Code for maintaining color mode across pages
import React, { createContext, useState, useContext, useEffect } from "react";

const ModeContext = createContext<any>(null);

export const ModeProvider = ({ children }: { children: React.ReactNode }) => {
  const [mode, setMode] = useState(localStorage.getItem("mode") || "dark");

  // Update theme when mode changes
  useEffect(() => {
    document.body.setAttribute("data-theme", mode);
    localStorage.setItem("mode", mode);

    const root = document.documentElement;
    if (mode === "light") {
      root.style.setProperty("--bg-color", "#dae1f1");
      root.style.setProperty("--text-color", "black");
      root.style.setProperty("--div-color", "#becbf4");
      root.style.setProperty("--button-bg", "#2047c0");
      root.style.setProperty("--button-text", "black");
    } else {
      root.style.setProperty("--bg-color", "#192642");
      root.style.setProperty("--text-color", "white");
      root.style.setProperty("--div-color", "#0f2157");
      root.style.setProperty("--button-bg", "#2047c0");
      root.style.setProperty("--button-text", "white");
    }
  }, [mode]);

  const toggleMode = () => setMode((prev) => (prev === "light" ? "dark" : "light"));

  return (
    <ModeContext.Provider value={{ mode, toggleMode }}>
      {children}
    </ModeContext.Provider>
  );
};

export const useColorMode = () => useContext(ModeContext);