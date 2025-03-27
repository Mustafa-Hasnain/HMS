// src/DoctorDashboardLayout.js
import React from 'react';
import { Outlet } from 'react-router-dom';
import NavbarHeader from './navbarheader';
import Sidebar_Doctor from './sidebar_Doctor';

function DoctorDashboardLayout() {
  return (
    <div className="flex">
      <Sidebar_Doctor />
      <div className="main-content flex-1 ml-48 mt-16">
        <NavbarHeader />
        <div className="p-4 relative">
          <Outlet /> {/* This is where the doctor-specific routes will be rendered */}
        </div>
      </div>
    </div>
  );
}

export default DoctorDashboardLayout;
