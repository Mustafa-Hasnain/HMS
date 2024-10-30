import React, { useState, useEffect } from 'react';
import { Form, InputGroup, Spinner, ListGroup, Card, Table, Badge, Button } from 'react-bootstrap';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Menu } from '@headlessui/react';
import { FaEllipsisV } from 'react-icons/fa';
import PaymentModal from '../Custom Components/PaymentModal';

const UpcomingDoctorAppointments = () => {
    const [searchInput, setSearchInput] = useState('');
    const [doctors, setDoctors] = useState([]);
    const [filteredDoctors, setFilteredDoctors] = useState([]);
    const [loadingDoctors, setLoadingDoctors] = useState(true);
    const [loadingAppointments, setLoadingAppointments] = useState(false);
    const [appointments, setAppointments] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [filteredRecords, setFilteredRecords] = useState([]);
    const [updatingInvoiceID, setUpdatingInvoiceID] = useState(null);
    const [invoices, setInvoices] = useState([]);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    




    const navigate = useNavigate();

    useEffect(() => {
        fetchDoctors();
        fetchUpcomingAppointments(); // Fetch upcoming appointments on component load
    }, []);

    const fetchDoctors = async () => {
        try {
            setLoadingDoctors(true);
            const response = await axios.get('http://localhost:5037/api/Receptionist/doctors');
            setDoctors(response.data);
            setFilteredDoctors(response.data); // Initially, display all doctors
        } catch (error) {
            console.error("Error fetching doctors:", error);
        } finally {
            setLoadingDoctors(false);
        }
    };

    const fetchUpcomingAppointments = async () => {
        try {
            setLoadingAppointments(true);
            const response = await axios.get('http://localhost:5037/api/Receptionist/upcoming-appointments');
            console.log(response.data);
            setAppointments(response.data);
        } catch (error) {
            console.error('Error fetching upcoming appointments:', error);
        } finally {
            setLoadingAppointments(false);
        }
    };

    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchInput(value);

        if (value === '') {
            setFilteredDoctors(doctors);
        } else {
            const filtered = doctors.filter(doctor =>
                doctor.firstName.toLowerCase().includes(value.toLowerCase()) ||
                doctor.specialty.toLowerCase().includes(value.toLowerCase())
            );
            setFilteredDoctors(filtered);
        }
        setShowDropdown(true); // Show the dropdown when typing
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

    // Mark an invoice as paid
    const markAsPaid = async (invoiceID) => {
        setUpdatingInvoiceID(invoiceID);
        try {
            await axios.post('http://localhost:5037/api/Prescription/invoice-pay', { invoiceID });
            fetchUpcomingAppointments();
        } catch (error) {
            console.error('Error marking invoice as paid:', error);
        } finally {
            setUpdatingInvoiceID(null);
        }
    };

    const handleFilter = async () => {
        // if (fromDate && toDate) {
        //     try {
        //         setLoadingAppointments(true);
        //         const response = await axios.get(`http://localhost:5037/api/Receptionist/appointments?fromDate=${fromDate}&toDate=${toDate}`);
        //         setFilteredRecords(response.data);
        //     } catch (error) {
        //         console.error('Error fetching filtered appointments:', error);
        //     } finally {
        //         setLoadingAppointments(false);
        //     }
        // }
    };

    return (
        <div className="container mt-2">
            <div className='flex justify-between items-center'>
                <h2 className="font-semibold text-2xl mt-3">Appointments</h2>
                {/* {loadingDoctors && <Spinner animation="border" variant="primary" />} */}
                <Button onClick={() => (navigate('/receptionist/set-appointment'))} variant="success">Set a Appointment</Button>
            </div>
            <InputGroup className="mb-3 relative">
                <Form.Control
                    placeholder="Search Appointments"
                    value={searchInput}
                    onChange={handleSearchChange}
                    onFocus={() => setShowDropdown(true)} // Show dropdown when input is focused
                />
            </InputGroup>

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

            {/* {showDropdown && (
                <ListGroup style={{ position: 'absolute', width: '75%', zIndex: '1000', maxHeight: '200px', overflowY: 'auto' }}>
                    {filteredDoctors.length > 0 ? (
                        filteredDoctors.map((doctor) => (
                            <ListGroup.Item
                                key={doctor.doctorID}
                                action
                            >
                                {doctor.firstName} {doctor.lastName} ({doctor.specialty})
                            </ListGroup.Item>
                        ))
                    ) : (
                        <ListGroup.Item>No doctors found.</ListGroup.Item>
                    )}
                </ListGroup>
            )} */}

            <div className="mt-4">
                <h5>
                    {fromDate && toDate
                        ? `Appointments from ${fromDate} to ${toDate} (${filteredRecords.length} records found)`
                        : 'Upcoming Appointments'}
                </h5>

                {loadingAppointments ? (
                    <Spinner animation="border" variant="primary" />
                ) : (
                    <Card>
                        <Card.Header>Appointments</Card.Header>
                        <Card.Body>
                            {filteredRecords.length > 0 || appointments.length > 0 ? (
                                <Table hover>
                                    <thead>
                                        <tr>
                                            <th>Day</th>
                                            {/* <th>Appointment Time</th> */}
                                            <th>Patient Name</th>
                                            <th>Doctor Name</th>
                                            <th>Appointment Time</th>
                                            <th>Invoice Status</th>
                                            <th>Appointment Status</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {(fromDate && toDate ? filteredRecords : appointments).map((appt, index) => (
                                            <tr key={index}>
                                                <td>{new Date(appt.appointmentDate).toLocaleDateString('en-US', {
                                                    weekday: 'short',
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric'
                                                })}</td>
                                                {/* <td>{formatTime(appt.appointmentTime)}</td> */}
                                                <td>{appt.patient.firstName}</td>
                                                <td>{appt.doctor.firstName} {appt.doctor.lastName}</td>
                                                <td>{getMeetingTime(appt)}</td>
                                                <td>
                                                    <Badge bg={appt.invoices[0]?.status === 'Paid' ? 'success' : 'danger'}>
                                                        {appt.invoices[0]?.status || 'Unpaid'}
                                                    </Badge>
                                                </td>
                                                <td>{appt.status}</td>

                                                <td>
                                                    <div className='flex gap-2'>
                                                        {appt.invoices[0]?.status !== 'Paid' &&
                                                            <Button
                                                                variant="outline-success"
                                                                className=' !text-xs'
                                                                onClick={() => {
                                                                    setUpdatingInvoiceID(appt.invoices[0]?.invoiceID)
                                                                    setShowPaymentModal(true);
                                                                }}
                                                            >
                                                                Mark as Paid
                                                            </Button>}
                                                        <Button
                                                            variant="outline-success"
                                                            className=' !text-xs'
                                                            onClick={()=>(navigate(`/receptionist/invoice-details/${appt.appointmentID}`))}
                                                        >
                                                            Details
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            ) : (
                                <p>No appointments found.</p>
                            )}
                        </Card.Body>
                    </Card>
                )}
            </div>
            <PaymentModal
                show={showPaymentModal}
                onHide={() => setShowPaymentModal(false)}
                invoiceID={updatingInvoiceID}
                markAsPaid={() => markAsPaid(updatingInvoiceID)}
            />
        </div>
    );
};

export default UpcomingDoctorAppointments;
