// src/contexts/RefreshContext.js
import React, { createContext, useContext, useState } from 'react';

const RefreshContext = createContext();

export const useRefreshContext = () => useContext(RefreshContext);

export const RefreshProvider = ({ children }) => {
    const [refreshKey, setRefreshKey] = useState(0); // Changed to use a simple number

    const handleReload = () => {
        setRefreshKey(prev => prev + 1); // Increment to trigger re-fetch
    };

    return (
        <RefreshContext.Provider value={{ refreshKey, handleReload }}>
            {children}
        </RefreshContext.Provider>
    );
};
