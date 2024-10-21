import React, { useState, useEffect } from 'react';
import { Table, Pagination, Card, Accordion, Spinner, Alert, Button } from 'react-bootstrap';
import axios from 'axios';
import { FaEllipsisV } from 'react-icons/fa';
import { Menu } from '@headlessui/react';
import { useNavigate } from 'react-router-dom';

const DoctorPortal = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true); // Loading state
  const [currentPage, setCurrentPage] = useState(1);
  const [doctorsPerPage] = useState(10);

  const navigate = useNavigate();

  useEffect(() => {
    // Fetch doctors data from the API
    const fetchDoctors = async () => {
      try {
        const response = await axios.get('https://mustafahasnain36-001-site1.gtempurl.com/api/Receptionist/doctors');
        setDoctors(response.data);
        setLoading(false); // Stop loading once data is fetched
      } catch (error) {
        console.error('Error fetching doctor data:', error);
        setLoading(false); // Stop loading even if there's an error
      }
    };

    fetchDoctors();
  }, []);

  // Pagination Logic
  const indexOfLastDoctor = currentPage * doctorsPerPage;
  const indexOfFirstDoctor = indexOfLastDoctor - doctorsPerPage;
  const currentDoctors = doctors.slice(indexOfFirstDoctor, indexOfLastDoctor);

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
  if (doctors.length === 0) {
    return (
      <div className="flex justify-center items-center pt-20 ">
        <div className="text-center">
            <Alert variant="warning">
                No doctors available.
            </Alert>
            <Button 
                onClick={() => navigate('/receptionist/add-doctor')} 
                variant="success"
            >
                Add New Doctor
            </Button>
        </div>
    </div>
    );
  }

  return (
    <div className="container mx-auto py-5">
      <div className='flex items-center justify-between align-middle mb-4'>
        <div className='flex gap-[4%]'>
          <h1 className="text-2xl font-bold">Doctors</h1>
          <h1 className="text-2xl font-bold">({currentDoctors.length})</h1>
        </div>
        <Button onClick={()=>(navigate('/receptionist/add-doctor'))} variant="success">Add New Doctor</Button>
      </div>
      {currentDoctors.map((doctor) => (
        <Card className="mb-5" key={doctor.doctorID}>
          <Card.Body>
            <Table className='table' hover responsive>
              <thead>
                <tr>
                  <th>Doctor ID</th>
                  <th>Name</th>
                  <th>Specialty</th>
                  <th>Email</th>
                  <th>Mobile Number</th>
                  <th>Consultation Fee</th>
                  <th>Joined Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{doctor.doctorID}</td>
                  <td>{`${doctor.firstName} ${doctor.lastName}`}</td>
                  <td>{doctor.specialty}</td>
                  <td>{doctor.emailID}</td>
                  <td>{doctor.mobileNumber}</td>
                  <td>Rs.{doctor.consultationFee}</td>
                  <td>{new Date(doctor.joinedDate).toLocaleDateString()}</td>
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
              </tbody>
            </Table>

            <Accordion>
              <Accordion.Item eventKey="0">
                <Accordion.Header>Schedules</Accordion.Header>
                <Accordion.Body>
                  <Table striped bordered hover responsive>
                    <thead>
                      <tr>
                        <th>Schedule ID</th>
                        <th>Day of Week</th>
                        <th>Start Time</th>
                        <th>End Time</th>
                        <th>Meeting Duration (mins)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {doctor.schedules && doctor.schedules.length > 0 ? (
                        doctor.schedules.map((schedule) => (
                          <tr key={schedule.doctorScheduleId}>
                            <td>{schedule.doctorScheduleId}</td>
                            <td>{schedule.dayOfWeek}</td>
                            <td>{schedule.startTime}</td>
                            <td>{schedule.endTime}</td>
                            <td>{schedule.slotDuration} minutes</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="5" className="text-center">
                            No schedules available
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </Table>
                </Accordion.Body>
              </Accordion.Item>
            </Accordion>
          </Card.Body>
        </Card>
      ))}

      {/* Pagination */}
      <Pagination>
        {Array.from({ length: Math.ceil(doctors.length / doctorsPerPage) }, (_, index) => (
          <Pagination.Item key={index + 1} active={index + 1 === currentPage} onClick={() => paginate(index + 1)}>
            {index + 1}
          </Pagination.Item>
        ))}
      </Pagination>
    </div>
  );
};

export default DoctorPortal;
