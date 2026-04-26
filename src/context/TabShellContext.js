import React, { createContext, useContext } from "react";

const TabShellContext = createContext(null);

export const TabShellProvider = ({ value, children }) => {
  return <TabShellContext.Provider value={value}>{children}</TabShellContext.Provider>;
};

export const useTabShell = () => {
  return useContext(TabShellContext);
};
