import React, { useState, useEffect } from 'react';
import { Table, Pagination, Card, Accordion, Spinner, Alert, Button, Form } from 'react-bootstrap';
import axios from 'axios';
import "../../styles/table.css";
import { FaArrowLeft, FaEdit } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { network_url } from '../Network/networkConfig';

const PatientPortal = () => {
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // Error state
  const [currentPage, setCurrentPage] = useState(1);
  const [patientsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState(''); // Search term state

  const navigate = useNavigate();

  useEffect(() => {
    // Fetch patients data from the API
    const fetchPatients = async () => {
      try {
        const response = await axios.get(`${network_url}/api/Receptionist/patients`);
        setPatients(response.data);
        setFilteredPatients(response.data); // Initialize filteredPatients
        setLoading(false);
      } catch (error) {
        console.error('Error fetching patient data:', error);
        setError('Failed to fetch patient data. Please try again later.');
        setLoading(false);
      }
    };

    fetchPatients();
  }, []);

  // Search filter logic
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setFilteredPatients(
      patients.filter(patient =>
        Object.values(patient).some(val =>
          val.toString().toLowerCase().includes(e.target.value.toLowerCase())
        )
      )
    );
  };

  // Pagination Logic
  const indexOfLastPatient = currentPage * patientsPerPage;
  const indexOfFirstPatient = indexOfLastPatient - patientsPerPage;
  const currentPatients = filteredPatients.slice(indexOfFirstPatient, indexOfLastPatient);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Show spinner while loading data
  if (loading) {
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
            <button onClick={() => navigate('/receptionist/overview')} className="text-success -mt-2">
              <FaArrowLeft size={20} />
            </button>
            <h1 className="text-2xl font-bold">Patients</h1>
            <h1 className="text-2xl font-bold">({filteredPatients.length})</h1>
          </div>
        </div>
        <Button onClick={() => navigate('/receptionist/set-appointment')} variant="success">
          Add New Patient
        </Button>
      </div>

      {/* Search Bar */}
      <Form.Group className="mb-4">
        <Form.Control
          type="text"
          placeholder="Search Patients..."
          value={searchTerm}
          onChange={handleSearch}
        />
      </Form.Group>

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
          {currentPatients.map((patient) => (
            <tr key={patient.patientID} onClick={() => navigate(`/receptionist/patients-details/${patient.patientID}`)} style={{ cursor: 'pointer' }}>
              <td>{patient.patientID}</td>
              <td>{patient.firstName}</td>
              <td>{patient.mobileNumber}</td>
              <td>{patient.gender}</td>
              <td>{new Date(patient.registrationDate).toLocaleDateString()}</td>
              <td>
                <div className='flex gap-3'>
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent row click from firing
                      navigate(`/receptionist/edit-patient/${patient.patientID}`);
                    }}
                  >
                    <FaEdit />
                  </Button>
                  <Button
                    variant="outline-success"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      localStorage.setItem('patient', JSON.stringify(patient));
                      navigate(`/receptionist/set-appointment`);
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

      {/* Pagination */}
      <div className="flex justify-center mt-4">
        <Pagination>
          {Array.from({ length: Math.ceil(filteredPatients.length / patientsPerPage) }, (_, index) => (
            <Pagination.Item key={index + 1} active={index + 1 === currentPage} onClick={() => paginate(index + 1)}>
              {index + 1}
            </Pagination.Item>
          ))}
        </Pagination>
      </div>
    </div>
  );
};

export default PatientPortal;
