// Code for maintaining color mode across pages
import React, { createContext, useState, useContext, useEffect } from "react";

const ModeContext = createContext<any>(null);

export const ModeProvider = ({ children }: { children: React.ReactNode }) => {
  const [mode, setMode] = useState(localStorage.getItem("mode") || "light");

  useEffect(() => {
    document.body.setAttribute("data-theme", mode);
    localStorage.setItem("mode", mode);
  }, [mode]);

  const toggleMode = () => {
    setMode(prev => (prev === "light" ? "dark" : "light"));
  };

  return (
    <ModeContext.Provider value={{ mode, toggleMode }}>
      {children}
    </ModeContext.Provider>
  );
};

export const useColorMode = () => useContext(ModeContext);