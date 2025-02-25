import React, { useState, useEffect, useRef } from 'react';
import { Table, Pagination, Card, Accordion, Spinner, Alert, Button, Form } from 'react-bootstrap';
import axios from 'axios';
import "../../styles/table.css";
import { FaArrowLeft, FaEdit, FaEye } from 'react-icons/fa';
import { useLocation, useNavigate } from 'react-router-dom';
import { network_url } from '../Network/networkConfig';

const PatientPortal = () => {
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState(null); // Error state
  const [currentPage, setCurrentPage] = useState(1);
  const [patientsPerPage] = useState(10);
  const [totalPatients, setTotalPatients] = useState(null);

  const navigate = useNavigate();

  const location = useLocation();
  const [isDoctor, setIsDoctor] = useState(false);
  const [isReceptionist, setIsReceptionist] = useState(false);
  const searchTermRef = useRef(null);
  const [typingTimeout, setTypingTimeout] = useState(null);

  // useEffect(() => {
  //   if (location.pathname.includes('/doctor/')) {
  //     setIsDoctor(true);
  //   } else if (location.pathname.includes('/receptionist/')) {
  //     setIsReceptionist(true);
  //   } else {
  //     setIsDoctor(false)
  //     setIsReceptionist(false);
  //   }
  // }, [location.pathname]);

  const fetchPatients = async () => {
    try {
      setLoading(true)
      let response;
      let doctorData = null;

      if (location.pathname.includes('/doctor/')) {
        doctorData = JSON.parse(localStorage.getItem('doctor'));
        response = await axios.get(`${network_url}/api/Receptionist/patients`, {
          params: { doctorID: doctorData.doctorID, pageNumber: currentPage, pageSize: 50 }
        });
        setIsDoctor(true);
      } else {
        response = await axios.get(`${network_url}/api/Receptionist/patients`, {
          params: { pageNumber: currentPage, pageSize: 50 }
        });
        setIsReceptionist(true);
      }

      setPatients(response.data.patients);
      setFilteredPatients(response.data.patients);
      setTotalPatients(response.data.totalPatients);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching patient data:', error);
      setError('Failed to fetch patient data. Please try again later.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients(currentPage);
  }, [currentPage]);


  const handleSearch = async () => {
    const searchTerm = searchTermRef.current?.value.trim();
    if (!searchTerm) {
      fetchPatients(currentPage);
      return; // Prevent empty searches
    }

    try {
      setSearching(true);
      const response = await axios.get(`${network_url}/api/Receptionist/search-patients`, {
        params: { searchTerm }
      });
      console.log("Search Patients:", response.data);
      setFilteredPatients(response.data.patients);
    } catch (error) {
      console.error('Error searching patients:', error);
    } finally {
      setSearching(false);
    }
  };

  // Trigger search on Enter key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };



  // // Search filter logic
  // const handleSearch = (e) => {
  //   setSearchTerm(e.target.value);
  //   e.preventDefault();
  //   setFilteredPatients(
  //     patients.filter(patient =>
  //       Object.values(patient).some(val =>
  //         val.toString().toLowerCase().includes(e.target.value.toLowerCase())
  //       )
  //     )
  //   );
  // };



  // // Pagination Logic
  // const indexOfLastPatient = currentPage * patientsPerPage;
  // const indexOfFirstPatient = indexOfLastPatient - patientsPerPage;
  // const currentPatients = filteredPatients.slice(indexOfFirstPatient, indexOfLastPatient);

  const totalPages = Math.ceil(totalPatients / 50);

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber)
    window.scrollTo({ top: 0, behavior: 'smooth' });

  };

  if (loading || searching) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner animation="border" variant="primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  // Error message if data fetching fails
  if (error) {
    return (
      <div className="flex flex-col justify-center items-center pt-20">
        <Alert variant="danger" className="text-center">
          {error}
        </Alert>
      </div>
    );
  }

  // No Data Found Logic
  if (patients.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center pt-20">
        <Alert variant="warning" className="text-center">
          No Patients Added.
        </Alert>
        <Button onClick={() => navigate('/receptionist/set-appointment')} variant="success">
          Add New Patient
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-5">
      <div className="flex items-center justify-between align-middle mb-4">
        <div className="flex gap-[4%]">
          <div className="flex gap-3 items-center align-middle">
            <button onClick={() => navigate(isReceptionist ? '/receptionist/overview' : '/doctor/overview')} className="text-success -mt-2">
              <FaArrowLeft size={20} />
            </button>
            <h1 className="text-2xl font-bold">Patients</h1>
            <h1 className="text-2xl font-bold">({totalPatients})</h1>
          </div>
        </div>
        {isReceptionist &&
          <Button onClick={() => navigate('/receptionist/set-appointment')} variant="success">
            Add New Patient
          </Button>}
      </div>

      {/* Search Bar */}
      <Form.Group className="mb-4 flex justify-between gap-3">
        <Form.Control
          type="text"
          placeholder="Search Patients..."
          ref={searchTermRef}
          onKeyPress={handleKeyPress}
          disabled={searching}
        />
        <Button onClick={() => handleSearch()} variant="outline-primary" disabled={searching}>
          Search
        </Button>
      </Form.Group>


      {(loading || searching)
        ?
        <div className="flex justify-center items-center h-screen">
          <Spinner animation="border" variant="primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
        :
        <Table className="table" hover responsive>
          <thead>
            <tr>
              <th>MR. No.</th>
              <th>Name</th>
              <th>Phone No</th>
              <th>Gender</th>
              <th>Registration Date</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredPatients.map((patient) => (
              <tr key={patient.patientID} onClick={() => navigate(isReceptionist ? `/receptionist/patients-details/${patient.patientID}` : `/doctor/patients-details/${patient.patientID}`)} style={{ cursor: 'pointer' }}>
                <td>{patient.patientID}</td>
                <td>{patient.firstName}</td>
                <td>{patient.mobileNumber}</td>
                <td>{patient.gender}</td>
                <td>{new Date(patient.registrationDate).toLocaleDateString()}</td>
                <td>
                  <div className='flex gap-3'>
                    {isReceptionist &&
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent row click from firing
                          navigate(`/receptionist/edit-patient/${patient.patientID}`);
                        }}
                      >
                        <FaEdit />
                      </Button>}

                    <Button
                      variant="outline-info"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(isReceptionist ? `/receptionist/patients-details/${patient.patientID}` : `/doctor/patients-details/${patient.patientID}`)
                      }}
                    >
                      <FaEye />
                    </Button>

                    <Button
                      variant="outline-success"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        localStorage.setItem('patient', JSON.stringify(patient));
                        navigate(isReceptionist ? `/receptionist/set-appointment` : `/doctor/set-appointment`);
                      }}
                    >
                      Set Appointment
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      }
      {!searchTermRef.current?.value && <div className="flex justify-center mt-4">
        <Pagination>
          {[...Array(totalPages)].map((_, index) => (
            <Pagination.Item key={index + 1} active={index + 1 === currentPage} onClick={() => paginate(index + 1)}>
              {index + 1}
            </Pagination.Item>
          ))}
        </Pagination>
      </div>}
    </div>
  );
};

export default PatientPortal;
