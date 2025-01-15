// src/Sidebar_Doctor.js
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Logo from "../assets/Logo Green.png";
import "../styles/sidebar.css";
import { FaTachometerAlt, FaCalendarAlt, FaFileMedical, FaClipboardList, FaClock, FaDollarSign } from 'react-icons/fa'; // Importing icons


function Sidebar_Doctor() {
  const location = useLocation();
  const navigate = useNavigate();

  // Function to handle navigation
  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <div className="fixed top-0 left-0 h-full bg-[#FFFFFF] text-black w-48 flex flex-col border-[1px] border-solid border-[rgba(4, 57, 79, 0.3)]">
      <div className="p-4 border-b border-[rgba(4, 57, 79, 0.3)] flex items-center justify-center">
        <img src={Logo} alt='Logo' className=' opacity-100' />
      </div>
      <div className="flex flex-col mt-4 px-2">
        {[
          { label: 'Dashboard', path: '/doctor/overview', icon: <FaTachometerAlt /> },
          { label: 'Appointments', path: '/doctor/appointments', icon: <FaCalendarAlt /> },
          { label: 'Prescriptions', path: '/doctor/prescriptions', icon: <FaFileMedical /> },
          // { label: 'Set Appointment', path: '/doctor/set-appointment', icon: <FaClipboardList /> },
          { label: 'Schedules', path: '/doctor/schedules', icon: <FaClock /> },
          { label: 'Services', path: '/doctor/services', icon: <FaClock /> },
          { label: 'Revenue', path: '/doctor/revenue', icon: <FaDollarSign /> },
          { label: 'Profile', path: '/doctor/profile', icon: <FaDollarSign /> },
        ].map((item) => (
          <button
            key={item.path}
            className={`sidebar-button ${location.pathname === item.path ? 'active' : ''}`}
            onClick={() => handleNavigation(item.path)}
          >
            {/* Icon */}
            <span className="sidebar-icon">
              {item.icon}
            </span>
            {/* Label */}
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default Sidebar_Doctor;
