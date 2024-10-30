import React, { useState, useEffect } from 'react';
import { Table, Button, Container, Modal, InputGroup, Form, Spinner } from 'react-bootstrap';
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa'; // Importing icons
import { useNavigate } from 'react-router-dom';

const AppointmentTable = () => {
    const [appointments, setAppointments] = useState([]);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [filteredAppointments, setFilteredAppointments] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [searchInput, setSearchInput] = useState('');
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [loading, setLoading] = useState(true); // Loading state
    const [patientLoading, setPatientLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const doctorData = JSON.parse(localStorage.getItem('doctor'));
        if (doctorData && doctorData.doctorID) {
            fetchAppointments(doctorData.doctorID);
        }
    }, []);

    const fetchAppointments = async (doctorID) => {
        setLoading(true); // Set loading state before data fetch
        try {
            const response = await fetch(`http://localhost:5037/api/Receptionist/Appointment/${doctorID}`);
            const data = await response.json();
            console.log("Appointments data: ", data);
            setAppointments(data);
            setFilteredAppointments(data); // Set filtered appointments initially
        } catch (error) {
            console.error('Error fetching appointments:', error);
        } finally {
            setLoading(false); // Remove loading state after fetch completes
        }
    };

    const fetchPatientDetails = async (appointmentID, patientID) => {
        setPatientLoading(true); // Show loading state for patient details
        try {
            const response = await fetch(`http://localhost:5037/api/Doctor/patient-details/${patientID}`);
            const data = await response.json();
            data.appointmentID = appointmentID;
            console.log("patientDetails: ", data);
            setSelectedPatient(data);
            setShowModal(true);
        } catch (error) {
            console.error('Error fetching patient details:', error);
        } finally {
            setPatientLoading(false); // Remove patient loader
        }
    };

    const handleViewPatient = (appointmentID, patientID) => {
        fetchPatientDetails(appointmentID, patientID);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedPatient(null);
    };

    const handleFilter = () => {
        // const filtered = appointments.filter(appt => {
        //     const appointmentDate = new Date(appt.appointmentDate).getTime();
        //     const from = new Date(fromDate).getTime();
        //     const to = new Date(toDate).getTime();
        //     return appointmentDate >= from && appointmentDate <= to;
        // });
        // setFilteredAppointments(filtered);
    };

    const handleSearchChange = (e) => {
        const value = e.target.value.toLowerCase();
        setSearchInput(value);
        const filtered = appointments.filter(appt =>
            appt.patient.firstName.toLowerCase().includes(value) ||
            appt.doctor.firstName.toLowerCase().includes(value) ||
            appt.status.toLowerCase().includes(value)
        );
        setFilteredAppointments(filtered);
    };

    const formatTime = (time) => {
        const [hour, minute] = time.split(':');
        const date = new Date();
        date.setHours(hour, minute);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
    };

    const getMeetingTime = (appointment) => {
        const startTime = formatTime(appointment.appointmentTime);
        const slotDuration = appointment.doctor.schedules.find(schedule => schedule.dayOfWeek === new Date(appointment.appointmentDate).toLocaleString('en-US', { weekday: 'long' }))?.slotDuration || 30;
        const endTime = new Date(new Date(`1970-01-01T${appointment.appointmentTime}`).getTime() + slotDuration * 60000)
            .toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
        return `${startTime} - ${endTime}`;
    };

    return (
        <Container className="mt-4">
            <div className='flex justify-between items-center'>
                <h2 className="text-2xl font-bold  mb-4">Doctor's Appointments</h2>
                <Button onClick={()=>(navigate("/doctor/set-appointment"))} variant="success" className='-mt-2'>Set Appointment</Button>
            </div>
            {/* Search bar */}
            <InputGroup className="mb-3">
                <Form.Control
                    placeholder="Search patient, doctor, or status"
                    value={searchInput}
                    onChange={handleSearchChange}
                />
            </InputGroup>

            {/* Date filter */}
            <div className="d-flex align-items-center mb-3">
                <Form.Control
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    placeholder="From Date"
                    className="me-2"
                />
                <Form.Control
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    placeholder="To Date"
                    className="me-2"
                />
                <Button onClick={handleFilter} variant="primary">Filter</Button>
            </div>


            {/* Check if loading */}
            {loading ? (
                <div className="text-center">
                    <Spinner animation="border" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </Spinner>
                </div>
            ) : appointments.length === 0 ? (
                <p className="text-center">No upcoming appointments</p>
            ) : (
                <Table hover responsive="sm" className="bg-white rounded">
                    <thead className="bg-blue-500 text-white">
                        <tr>
                            <th>Appointment ID</th>
                            <th>Patient Name</th>
                            <th>Appointment Date</th>
                            <th>Appointment Time</th>
                            <th>Status</th>
                            <th>Invoice Status</th>
                            <th>Booked On</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredAppointments.map((appointment) => (
                            <tr key={appointment.appointmentID}>
                                <td>{appointment.appointmentID}</td>
                                <td>{appointment.patient.firstName}</td>
                                <td>{new Date(appointment.appointmentDate).toLocaleDateString()}</td>
                                <td>{getMeetingTime(appointment)}</td>
                                <td>{appointment.status.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase())}</td>
                                <td>
                                    {appointment.invoices && appointment.invoices.length > 0 ? (
                                        appointment.invoices[0].status === 'Unpaid' ? (
                                            <FaTimesCircle color="red" size={20} />
                                        ) : (
                                            <FaCheckCircle color="green" size={20} />
                                        )
                                    ) : (
                                        <span>No Invoice</span>
                                    )}
                                </td>
                                <td>{new Date(appointment.bookedOn).toLocaleString()}</td>
                                <td>
                                    <Button variant="primary" size="sm" onClick={() => handleViewPatient(appointment.appointmentID, appointment.patient.patientID)}>
                                        View Patient
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            )}


            {selectedPatient && (
                <Modal show={showModal} onHide={handleCloseModal} size="lg">
                    <Modal.Header closeButton>
                        <Modal.Title>Patient Details</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        {/* <div className="grid grid-cols-2 gap-4">
                            <div>
                                <h5 className="text-lg font-bold">Patient Information</h5>
                                <p><strong>Patient ID:</strong> {selectedPatient.patientDetails.patientID}</p>
                                <p><strong>Name:</strong> {selectedPatient.patientDetails.firstName}</p>
                                <p><strong>Mobile Number:</strong> {selectedPatient.patientDetails.mobileNumber}</p>
                                <p><strong>Gender:</strong> {selectedPatient.patientDetails.gender}</p>
                                <p><strong>Medical History:</strong> {selectedPatient.patientDetails.medicalHistory}</p>
                                <p><strong>Registration Date:</strong> {new Date(selectedPatient.patientDetails.registrationDate).toLocaleDateString()}</p>
                            </div>
                        </div> */}

                        <div className="bg-[#F8F8F8] grid grid-cols-1 md:grid-cols-3 gap-4 p-6 mt-4 rounded-md">
                            <div className="patientDetails">
                                <p>Name</p>
                                <h2>{selectedPatient.patientDetails.firstName}</h2>
                            </div>
                            <div className="patientDetails">
                                <p>Contact No</p>
                                <h2>{selectedPatient.patientDetails.mobileNumber}</h2>
                            </div>
                            <div className="patientDetails">
                                <p>Gender</p>
                                <h2>{selectedPatient.patientDetails.gender}</h2>
                            </div>
                            <div className="patientDetails">
                                <p>Registration Date</p>
                                <h2>{new Date(selectedPatient.patientDetails.registrationDate).toLocaleDateString()}</h2>
                            </div>
                            <div className="patientDetails">
                                <p>Medical History</p>
                                <h2>{selectedPatient.patientDetails.medicalHistory}</h2>
                            </div>
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="primary" onClick={() => (navigate(`/doctor/prescriptions/${selectedPatient.patientDetails.patientID}/${selectedPatient.appointmentID}`))}>
                            Give Prescription
                        </Button>
                    </Modal.Footer>
                </Modal>
            )}
        </Container>
    );
};

export default AppointmentTable;
