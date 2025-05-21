// src/Sidebar.js
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Logo from "../assets/Logo Green.png";
import { FaTachometerAlt, FaUserFriends, FaCalendarAlt, FaUserMd, FaFileInvoiceDollar, FaChartLine, FaMoneyBillWave, FaBoxes, FaUndoAlt, FaBars, FaTimes } from 'react-icons/fa';
import "../styles/sidebar.css";

function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Function to handle navigation
  const handleNavigation = (path) => {
    navigate(path);
    if (isMobile) {
      setMobileMenuOpen(false); // Close mobile menu after navigation
    }
  };

  // Function to toggle mobile menu
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  // Function to check window size
  useEffect(() => {
    const checkWindowSize = () => {
      setIsMobile(window.innerWidth < 768);
      
      // Close mobile menu when resizing to desktop
      if (window.innerWidth >= 768) {
        setMobileMenuOpen(false);
      }
    };

    // Check on initial load
    checkWindowSize();
    
    // Add event listener
    window.addEventListener('resize', checkWindowSize);
    
    // Cleanup
    return () => window.removeEventListener('resize', checkWindowSize);
  }, []);

  const menuItems = [
    { label: 'Dashboard', path: '/receptionist/overview', icon: <FaTachometerAlt /> },
    { label: 'Patients', path: '/receptionist/patients-portal', icon: <FaUserFriends /> },
    { label: 'Appointments', path: '/receptionist/upcoming-doctor-appointments', icon: <FaCalendarAlt /> },
    { label: 'Doctors/Staff', path: '/receptionist/doctors-portal', icon: <FaUserMd /> },
    { label: 'Invoices', path: '/receptionist/invoices', icon: <FaFileInvoiceDollar /> },
    { label: 'Revenue', path: '/receptionist/revenue', icon: <FaChartLine /> },
    { label: 'Expenses', path: '/receptionist/expenses', icon: <FaMoneyBillWave /> },
    { label: 'Inventory', path: '/receptionist/inventory', icon: <FaBoxes /> },
    { label: 'Refund Items', path: '/receptionist/refund-items', icon: <FaUndoAlt /> },
  ];

  // Mobile hamburger menu button component
  const MobileMenuButton = () => (
    <button 
      className="fixed top-4 left-4 z-50 text-[#00743C] p-2 rounded-md bg-white shadow-md" 
      onClick={toggleMobileMenu}
    >
      {mobileMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
    </button>
  );

  // Sidebar content component
  const SidebarContent = ({ className = "" }) => (
    <div className={`bg-[#FFFFFF] text-black flex flex-col border-[1px] border-solid border-[rgba(4, 57, 79, 0.3)] ${className}`}>
      {/* Main Logo Section */}
      <div className="p-4 border-b border-[rgba(4, 57, 79, 0.3)] flex items-center justify-center">
        <img src={Logo} alt='Logo' className='opacity-100' />
      </div>

      {/* Sidebar Items */}
      <div className="flex flex-col mt-4 px-2 overflow-y-auto flex-grow sidebar-scroll">
        {menuItems.map((item) => (
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

  return (
    <>
      {/* Mobile Menu Button - Only visible on mobile */}
      {isMobile && <MobileMenuButton />}

      {/* Desktop Sidebar - Hidden on mobile */}
      {!isMobile && (
        <div className="fixed top-0 left-0 h-full w-48">
          <SidebarContent />
        </div>
      )}

      {/* Mobile Overlay Menu - Only visible when menu is open on mobile */}
      {isMobile && mobileMenuOpen && (
        <div className="fixed inset-0 z-40 flex">
          {/* Dark overlay behind the menu */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50" 
            onClick={toggleMobileMenu}
          ></div>
          
          {/* Mobile sidebar */}
          <div className="relative z-50 w-64 max-w-[80%] h-full">
            <SidebarContent className="h-full" />
          </div>
        </div>
      )}
    </>
  );
}

export default Sidebar;