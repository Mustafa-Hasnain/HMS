import React, { useState, useEffect } from 'react';
import { Table, Pagination, Card, Accordion, Spinner, Alert, Button } from 'react-bootstrap';
import axios from 'axios';
import "../../styles/table.css";
import { Menu } from '@headlessui/react';
import { FaEllipsisV } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const PatientPortal = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true); // Loading state
  const [currentPage, setCurrentPage] = useState(1);
  const [patientsPerPage] = useState(10);

  const navigate = useNavigate()

  useEffect(() => {
    // Fetch patients data from the API
    const fetchPatients = async () => {
      try {
        const response = await axios.get('https://mustafahasnain36-001-site1.gtempurl.com/api/Receptionist/patients'); // Adjust API endpoint as needed
        console.log("Patients: ", response.data)
        setPatients(response.data);
        setLoading(false); // Stop loading once data is fetched
      } catch (error) {
        console.error('Error fetching patient data:', error);
        setLoading(false); // Stop loading even if there's an error
      }
    };

    fetchPatients();
  }, []);

  // Pagination Logic
  const indexOfLastPatient = currentPage * patientsPerPage;
  const indexOfFirstPatient = indexOfLastPatient - patientsPerPage;
  const currentPatients = patients.slice(indexOfFirstPatient, indexOfLastPatient);

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

  // No Data Found Logic
  if (patients.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center pt-20">
        <Alert variant="warning" className="text-center">
          No Patients Added.
        </Alert>
        <Button onClick={() => (navigate('/receptionist/set-appointment'))} variant="success">Add New Patient</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-5">
      <div className='flex items-center justify-between align-middle mb-4'>
        <div className='flex gap-[4%]'>
          <h1 className="text-2xl font-bold">Patients</h1>
          <h1 className="text-2xl font-bold">({patients.length})</h1>
        </div>
        <Button onClick={() => (navigate('/receptionist/set-appointment'))} variant="success">Add New Patient</Button>
      </div>
      <Table className='table' hover responsive>
        <thead>
          <tr>
            <th>Patient ID</th>
            <th>Name</th>
            <th>Phone No</th>
            <th>Gender</th>
            <th>Registration Date</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {currentPatients.map((patient) => (
            <tr key={patient.patientID}>
              <td>{patient.patientID}</td>
              <td>{patient.firstName}</td>
              <td>{patient.mobileNumber}</td>
              <td>{patient.gender}</td>
              <td>{new Date(patient.registrationDate).toLocaleDateString()}</td>
              <td>
                <Menu as="div" className="relative inline-block text-left">
                  <Menu.Button>
                    <FaEllipsisV />
                  </Menu.Button>

                  <Menu.Items className="origin-top-right absolute right-3 bottom-[-10px] mt-2 w-32 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                    <div className="py-1 Barlow">
                      <Menu.Item>
                        {({ active }) => (
                          <a
                            href="#"
                            onClick={() => (navigate(`/receptionist/patients-details/${patient.patientID}`))}
                            className={`block px-4 py-2 !no-underline text-xs ${active ? 'bg-gray-100' : ''}`}
                          >
                            View Details
                          </a>
                        )}
                      </Menu.Item>
                    </div>
                  </Menu.Items>
                </Menu>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Pagination */}
      <div className="flex justify-center mt-4">
        <Pagination>
          {Array.from({ length: Math.ceil(patients.length / patientsPerPage) }, (_, index) => (
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
