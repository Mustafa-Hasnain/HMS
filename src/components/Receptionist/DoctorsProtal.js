import React, { useState, useEffect } from 'react';
import { Table, Pagination, Card, Accordion, Spinner, Alert, Button, Form } from 'react-bootstrap';
import axios from 'axios';
import { FaEdit, FaTrash, FaCalendarAlt, FaArrowLeft } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import ConfirmationModal from '../Custom Components/confirmationModal';

const DoctorPortal = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [doctorsPerPage] = useState(10);
  const [showModal, setShowModal] = useState(false);
  const [deleteDoctorId, setDeleteDoctorId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  // Fetch doctors data from the API
  const fetchDoctors = async () => {
    try {
      setLoading(true);
      setError(null); // Reset error before fetching
      const response = await axios.get('https://mustafahasnain36-001-site1.gtempurl.com/api/Receptionist/doctors');
      setDoctors(response.data);
    } catch (error) {
      setError('Error fetching doctor data. Please try again.');
      console.error('Error fetching doctor data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  // Pagination Logic
  const indexOfLastDoctor = currentPage * doctorsPerPage;
  const indexOfFirstDoctor = indexOfLastDoctor - doctorsPerPage;
  const currentDoctors = doctors
    .filter(doctor =>
      doctor.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .slice(indexOfFirstDoctor, indexOfLastDoctor);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const setDoctorUnavailable = async (doctorId) => {
    setShowModal(false);
    try {
      const response = await fetch(`https://mustafahasnain36-001-site1.gtempurl.com/api/Receptionist/doctors/${doctorId}/set-unavailable`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to set doctor as unavailable');
      }

      const result = await response.json();
      toast.success(result.Message || 'Doctor set to unavailable successfully');
      fetchDoctors();
    } catch (error) {
      toast.error(error.message || 'An error occurred');
    }
  };

  // Show spinner while loading data
  if (loading) {
    return (
      <div className="flex justify-center items-center h-[450px]">
        <Spinner animation="border" variant="primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  // Show error alert if fetch error occurs
  if (error) {
    return (
      <div className="flex justify-center items-center pt-20">
        <Alert variant="danger">{error}</Alert>
      </div>
    );
  }

  // No Data Found Logic
  if (doctors.length === 0) {
    return (
      <div className="flex justify-center items-center pt-20">
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
    <>
      <ToastContainer />
      <div className="container mx-auto py-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex gap-3 items-center align-middle">
            <button onClick={() => navigate('/receptionist/overview')} className="text-success -mt-2">
              <FaArrowLeft size={20} />
            </button>
            <div className="flex gap-3">
              <h1 className="text-2xl font-bold">Doctors</h1>
              <h1 className="text-2xl font-bold">({currentDoctors.length})</h1>
            </div>
          </div>
          <Button onClick={() => navigate('/receptionist/add-doctor')} variant="success">
            Add New Doctor
          </Button>
        </div>

        {/* Search input */}
        <Form.Control
          type="text"
          placeholder="Search by name or specialty"
          className="mb-4"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        {currentDoctors.map((doctor) => (
          <Card className="mb-5" key={doctor.doctorID}>
            <Card.Body>
              <Table className="table" hover responsive>
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
                      <div className="flex gap-2">
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={() => navigate(`/receptionist/edit-doctor/${doctor.doctorID}`)}
                        >
                          <FaEdit />
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => {
                            setDeleteDoctorId(doctor.doctorID);
                            setShowModal(true);
                          }}
                        >
                          <FaTrash />
                        </Button>
                      </div>
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
                              {/* <td>
                                <FaEdit
                                  className="text-primary cursor-pointer"
                                  onClick={() => navigate(`/receptionist/update-schedule/${doctor.doctorID}`)}
                                />
                              </td> */}
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

      <ConfirmationModal
        show={showModal}
        onHide={() => setShowModal(false)}
        onConfirm={setDoctorUnavailable}
        confirmText="Are you sure you want to delete this doctor?"
        confirmButtonText="Confirm Delete"
        cancelButtonText="Cancel"
        id={deleteDoctorId}
      />
    </>
  );
};

export default DoctorPortal;
