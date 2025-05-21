// src/ReceptionistDashboardLayout.js
import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './sidebar';
import NavbarHeader from './navbarheader';

function ReceptionistDashboardLayout() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkWindowSize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Check on initial load
    checkWindowSize();
    
    // Add event listener
    window.addEventListener('resize', checkWindowSize);
    
    // Cleanup
    return () => window.removeEventListener('resize', checkWindowSize);
  }, []);

  return (
    <div className="dashboard-container flex">
      <Sidebar />
      <div className={`main-content flex-1 ${!isMobile ? 'ml-48' : 'ml-0'} mt-16`}>
        <NavbarHeader />
        <div className="p-6 relative">
          <Outlet /> {/* This is where the receptionist-specific routes will be rendered */}
        </div>
      </div>
    </div>
  );
}

export default ReceptionistDashboardLayout;