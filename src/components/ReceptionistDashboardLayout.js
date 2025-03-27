// src/ReceptionistDashboardLayout.js
import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './sidebar';
import NavbarHeader from './navbarheader';

function ReceptionistDashboardLayout() {
  return (
    <div className="dashboard-container flex">
      <Sidebar />
      <div className="main-content flex-1 ml-48 mt-16">
        <NavbarHeader />
        <div className="p-6 relative">
          <Outlet /> {/* This is where the receptionist-specific routes will be rendered */}
        </div>
      </div>
    </div>
  );
}

export default ReceptionistDashboardLayout;
