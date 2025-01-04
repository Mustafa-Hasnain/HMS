// src/NavbarHeader.js
import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button, Form, FormControl, InputGroup } from 'react-bootstrap';
import { FaBars, FaBell, FaSearch, FaSync } from 'react-icons/fa';
import { useRefreshContext } from '../contexts/RefreshContext';

function NavbarHeader() {
  const navigate = useNavigate();
  const location = useLocation();
  const [welcomeMessage, setWelcomeMessage] = useState('');
  const [currentDate, setCurrentDate] = useState('');
  const { handleReload } = useRefreshContext();


  useEffect(() => {
    const today = new Date();
    setCurrentDate(today.toLocaleString()); // Format the date and time as needed

    if (location.pathname.startsWith('/doctor/')) {
      const doctorData = JSON.parse(localStorage.getItem('doctor'));
      if (doctorData) {
        setWelcomeMessage(`Welcome Dr. ${doctorData.firstName} ${doctorData.lastName}!`);
      } else {
        navigate('/'); // Navigate to home if no doctor data is found
      }
    } else if (location.pathname.startsWith('/receptionist/')) {
      setWelcomeMessage('Welcome Admin!');
    } else {
      setWelcomeMessage(''); // Clear message for other paths
    }
  }, [location.pathname, navigate]);

  const handleLogout = () => {
    localStorage.removeItem('doctor'); // Clear doctor data from localStorage
    navigate('/'); // Navigate to home
  };

  return (
    <div className="bg-white text-white p-4 flex items-center justify-between fixed top-0 left-48 right-0 z-40 border-b border-[rgba(4, 57, 79, 0.3)]">
      <div className='flex flex-row w-[100%] justify-end '>

        {/* <Form  className="d-none d-md-flex mx-4 w-[40%]">
          <InputGroup className='relative'>
            <FormControl
              type="search"
              placeholder="Search"
              className="border-0 focus:!border-0 shadow-inner !bg-black !bg-opacity-20 !rounded-md"
            />
            <InputGroup.Text className=" !bg-transparent border-0 absolute right-0 top-2 z-50">
              <FaSearch />
            </InputGroup.Text>
          </InputGroup>
        </Form> */}

        {/* Right section: Notification and Profile */}
        <div className="d-flex align-items-center gap-3">
          <button
            className="text-black border border-black rounded p-2 hover:bg-gray-200"
            onClick={()=>window.location.reload(false)}
          >
            <FaSync />
          </button>
          <div className='flex gap-2 -mb-2'>
            <div className="text-sm font-semibold text-black">{welcomeMessage}</div>
            <div className='text-black'>|</div>
            {currentDate && <div className="text-sm text-gray-600 font-semibold">{currentDate}</div>}
          </div>
          {/* Notification Icon */}
          {/* <Button variant="link" className="text-white me-3 p-0">
            <FaBell size={20} />
          </Button> */}

          <Button variant='outline-danger' className="px-4 py-2 rounded" onClick={handleLogout}>
            Logout
          </Button>

          {/* Hamburger button for mobile */}
          <Button
            variant="outline-light"
            className="d-md-none ms-3"
          // onClick={toggleSidebar}
          >
            <FaBars />
          </Button>
        </div>
      </div>
    </div>
  );
}

export default NavbarHeader;
