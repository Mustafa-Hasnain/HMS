// RefreshContext.js
import React, { createContext, useContext, useState, useCallback } from 'react';

const RefreshContext = createContext();

export const useRefreshContext = () => useContext(RefreshContext);

export const RefreshProvider = ({ children }) => {
  const [refreshFunction, setRefreshFunction] = useState(null);

  const handleRefresh = useCallback(() => {
    if (refreshFunction) {
      refreshFunction();
    }
  }, [refreshFunction]);

  return (
    <RefreshContext.Provider value={{ setRefreshFunction, handleRefresh }}>
      {children}
    </RefreshContext.Provider>
  );
};
