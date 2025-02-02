import React, { useState, useEffect, useRef } from 'react';
import { Form, InputGroup, Spinner, ListGroup, Card, Table, Badge, Button } from 'react-bootstrap';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import { Menu } from '@headlessui/react';
import { FaArrowLeft, FaEllipsisV } from 'react-icons/fa';
import PaymentModal from './PaymentModal';
import { toast, ToastContainer } from 'react-toastify';
import { network_url } from '../Network/networkConfig';

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
    const [info, setinfo] = useState("Today's Appointment")
    const navigate = useNavigate();

    const location = useLocation();
    const [isDoctor, setIsDoctor] = useState(false);
    const [isReceptionist, setIsReceptionist] = useState(false);


    useEffect(() => {
        const determineRole = () => {
            if (location.pathname.includes('/doctor/')) {
                setIsDoctor(true);
                setIsReceptionist(false);
            } else if (location.pathname.includes('/receptionist/')) {
                setIsReceptionist(true);
                setIsDoctor(false);
            } else {
                setIsDoctor(false);
                setIsReceptionist(false);
            }
        };

        determineRole();
    }, [location.pathname]);

    useEffect(() => {
        if (isDoctor || isReceptionist) {
            fetchUpcomingAppointments();
        }
    }, [isDoctor, isReceptionist]);


    const fetchDoctors = async () => {
        try {
            setLoadingDoctors(true);
            let response = null;
            if (isDoctor) {
                const doctorData = JSON.parse(localStorage.getItem('doctor'));
                response = await axios.get(`${network_url}/api/Receptionist/doctors?doctorId=${doctorData.doctorID}`);
            }
            else {
                response = await axios.get(`${network_url}/api/Receptionist/doctors`);
            }
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
            let response = null;
            if (isDoctor) {
                const doctorData = JSON.parse(localStorage.getItem('doctor'));
                response = await axios.get(`${network_url}/api/Receptionist/upcoming-appointments?doctorId=${doctorData.doctorID}`);
            }
            else {
                response = await axios.get(`${network_url}/api/Receptionist/upcoming-appointments`);
            }
            console.log(response.data);
            setAppointments(response.data);
            setFilteredRecords(response.data);
        } catch (error) {
            console.error('Error fetching upcoming appointments:', error);
        } finally {
            setLoadingAppointments(false);
        }
    };


    const handleSearchChange = (e) => {
        const searchValue = e.target.value.toLowerCase();
        setSearchInput(searchValue);

        // Check if searchValue is a numeric string with less than 3 digits
        const isShortNumeric = /^\d{1,2}$/.test(searchValue);

        const filtered = (fromDate && toDate ? filteredRecords : appointments).filter(appt => {
            const {
                patient: { firstName: patientName, patientID, mobileNumber: patientMobile },
                doctor: { firstName: doctorFirstName, lastName: doctorLastName, specialty, mobileNumber: doctorMobile },
                status,
                referredByDoctor,
                invoices
            } = appt;

            if (isShortNumeric) {
                // Only filter by patientID when searchValue is a short numeric string
                return String(patientID).includes(searchValue);
            } else {
                // Filter by all attributes otherwise
                return (
                    patientName.toLowerCase().includes(searchValue) ||
                    String(patientID).includes(searchValue) ||
                    patientMobile.includes(searchValue) ||
                    doctorFirstName.toLowerCase().includes(searchValue) ||
                    doctorLastName.toLowerCase().includes(searchValue) ||
                    specialty.toLowerCase().includes(searchValue) ||
                    doctorMobile.includes(searchValue) ||
                    status.toLowerCase().includes(searchValue) ||
                    (referredByDoctor && 'referred by doctor'.includes(searchValue)) ||
                    invoices.some(invoice =>
                        invoice.status.toLowerCase().includes(searchValue)
                    )
                );
            }
        });

        setFilteredRecords(filtered);
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
            await axios.post(`${network_url}/api/Prescription/invoice-pay`, { invoiceID });
            fetchUpcomingAppointments();
        } catch (error) {
            console.error('Error marking invoice as paid:', error);
        } finally {
            setUpdatingInvoiceID(null);
        }
    };

    const handleFilter = async () => {
        if (fromDate && toDate) {
            try {
                setLoadingAppointments(true);
                let response = null
                if (isDoctor) {
                    const doctorData = JSON.parse(localStorage.getItem('doctor'));
                    response = await axios.get(`${network_url}/api/Receptionist/upcoming-appointments/${fromDate}/${toDate}?doctorId=${doctorData.doctorID}`);
                }
                else {
                    response = await axios.get(`${network_url}/api/Receptionist/upcoming-appointments/${fromDate}/${toDate}`);
                }
                const heading = fromDate && toDate ? `Appointments from ${fromDate} to ${toDate} (${response.data.length} records found)` : 'Upcoming Appointments'
                setinfo(heading);
                setFilteredRecords(response.data);
            } catch (error) {
                console.error('Error fetching filtered appointments:', error);
                toast.error('Failed to fetch filtered appointments.');
            } finally {
                setLoadingAppointments(false);

            }
        } else {
            toast.warn('Please select both Dates.');
        }
    };


    return (
        <div className="container mt-2 p-4">
            <ToastContainer />
            <div className='flex justify-between items-center mb-4'>
                <div className="flex gap-3 items-center align-middle">
                    <button onClick={() => navigate(isReceptionist ? '/receptionist/overview' : '/doctor/overview')} className="text-success -mt-2">
                        <FaArrowLeft size={20} />
                    </button>
                    <h2 className="font-bold text-2xl">Appointments</h2>
                </div>
                {/* {loadingDoctors && <Spinner animation="border" variant="primary" />} */}
                <Button onClick={() => (navigate(isDoctor ? '/doctor/set-appointment' : '/receptionist/set-appointment'))} variant="success">Create Appointment</Button>

            </div>
            <InputGroup className="mb-3 relative">
                <Form.Control
                    placeholder="Search Appointments"
                    value={searchInput}
                    onChange={handleSearchChange}
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
                    {/* {fromDate && toDate
                        ? `Appointments from ${fromDate} to ${toDate} (${filteredRecords.length} records found)`
                        : 'Upcoming Appointments'} */}
                    {info}
                </h5>

                {loadingAppointments ? (
                    <Spinner animation="border" variant="primary" />
                ) : (
                    <Card>
                        <Card.Header>{info}</Card.Header>
                        <Card.Body>
                            {filteredRecords.length > 0 ? (
                                <Table hover>
                                    <thead>
                                        <tr>
                                            <th>Day</th>
                                            <th>MR. No.</th>
                                            <th>Patient Name</th>
                                            <th>Doctor Name</th>
                                            <th>Appointment Time</th>
                                            <th>Appointment Status</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredRecords.map((appt, index) => (
                                            <tr key={index}>
                                                <td>{new Date(appt.appointmentDate).toLocaleDateString('en-US', {
                                                    weekday: 'short',
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric'
                                                })}</td>
                                                <td>{appt.patient.patientID}</td>
                                                <td>{appt.patient.firstName}</td>
                                                <td>{appt.doctor.firstName} {appt.doctor.lastName}</td>
                                                <td>{appt.referredByDoctor ? 'Referred By Doctor' : getMeetingTime(appt)}</td>
                                                <td>{appt.status}</td>
                                                <td>
                                                    <div className='flex gap-2'>
                                                        <Button
                                                            variant="outline-success"
                                                            className=' !text-xs'
                                                            onClick={() => navigate(isDoctor ? `/doctor/invoice-details/${appt.appointmentID}` : `/receptionist/invoice-details/${appt.appointmentID}`)}
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
