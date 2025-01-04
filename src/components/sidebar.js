// src/Sidebar.js
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Logo from "../assets/Logo Green.png";
import { FaTachometerAlt, FaUserFriends, FaCalendarAlt, FaUserMd, FaFileInvoiceDollar, FaChartLine, FaMoneyBillWave, FaBoxes } from 'react-icons/fa';  // Importing icons
import "../styles/sidebar.css";


function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  // Function to handle navigation
  const handleNavigation = (path) => {
    navigate(path);
  };
  

  // return (
  //   <div className="fixed top-0 left-0 h-full bg-[#FFFFFF] text-black w-64 flex flex-col border-[1px] border-solid border-[rgba(4, 57, 79, 0.3)]">
  //     <div className="p-4 border-b border-[rgba(4, 57, 79, 0.3)] flex items-center justify-center">
  //       <img src={Logo} alt='Logo' className=' opacity-100' />
  //     </div>
  //     <div className="flex flex-col mt-4 px-2">
  //       {[
  //         { label: 'Dashboard', path: '/receptionist/overview' },
  //         { label: 'Patients', path: '/receptionist/patients-portal' },
  //         { label: 'Appointments', path: '/receptionist/upcoming-doctor-appointments' },
  //         { label: 'Doctors/Staff', path: '/receptionist/doctors-portal' },
  //         // { label: 'Add Doctor', path: '/receptionist/add-doctor' },
  //         // { label: 'Upcoming Doctor Appointments', path: '/receptionist/upcoming-doctor-appointments' },
  //         // { label: 'Inventory', path: '/receptionist/inventory' },
  //         { label: 'Invoices', path: '/receptionist/invoices' },
  //         { label: 'Revenue', path: '/receptionist/revenue' },
  //       ].map((item) => (
  //         <button
  //           key={item.path}
  //           className={`my-2 text-left w-full px-4 py-2 rounded transition-colors cursor-pointer ${
  //           location.pathname === item.path ? 'bg-[#00743C] text-white' : 'hover:bg-[#00743C] hover:text-white'
  //           }`}
  //           onClick={() => handleNavigation(item.path)}
  //         >
  //           {item.label}
  //         </button>
  //       ))}
  //     </div>
  //   </div>
  // );

  return (
    <div className="fixed top-0 left-0 h-full bg-[#FFFFFF] text-black w-48 flex flex-col border-[1px] border-solid border-[rgba(4, 57, 79, 0.3)]">
      {/* Main Logo Section */}
      <div className="p-4 border-b border-[rgba(4, 57, 79, 0.3)] flex items-center justify-center">
        <img src={Logo} alt='Logo' className='opacity-100' />
      </div>

      {/* Sidebar Items */}
      <div className="flex flex-col mt-4 px-2">
        {[
          { label: 'Dashboard', path: '/receptionist/overview', icon: <FaTachometerAlt /> },
          { label: 'Patients', path: '/receptionist/patients-portal', icon: <FaUserFriends /> },
          { label: 'Appointments', path: '/receptionist/upcoming-doctor-appointments', icon: <FaCalendarAlt /> },
          { label: 'Doctors/Staff', path: '/receptionist/doctors-portal', icon: <FaUserMd /> },
          { label: 'Invoices', path: '/receptionist/invoices', icon: <FaFileInvoiceDollar /> },
          { label: 'Revenue', path: '/receptionist/revenue', icon: <FaChartLine /> },
          { label: 'Expenses', path: '/receptionist/expenses', icon: <FaMoneyBillWave /> },
          { label: 'Inventory', path: '/receptionist/inventory', icon: <FaBoxes /> },
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

export default Sidebar;
