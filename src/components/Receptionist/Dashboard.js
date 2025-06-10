import React, { useEffect, useRef, useState } from 'react';
import { Button, Table, Row, Col, Card, Spinner, DropdownButton, Dropdown } from 'react-bootstrap';
import patients_svg from "../../assets/patients.svg";
import doctors_svg from "../../assets/doctors.svg";
import docs_svg from "../../assets/docs.svg";
import labreport_svg from "../../assets/labreport.svg";
import axios from 'axios';
import InfoCard from '../Custom Components/infoCard';
import LineGraph from '../Custom Components/RevenueGraph';
import { FaEllipsisV } from 'react-icons/fa';
import { Menu } from '@headlessui/react';
import { useNavigate } from 'react-router-dom';
import { useRefreshContext } from '../../contexts/RefreshContext';
import { useReactToPrint } from 'react-to-print';
import { network_url } from '../Network/networkConfig';
import { formatDoctorName } from '../utils/DoctorUtills';

const Dashboard = () => {
    const [loading, setLoading] = useState(true); // Loading state for all cards
    const [data, setData] = useState(null); // State to hold API data
    const [appointmentsLoading, setAppointmentsLoading] = useState(true); // Loading for appointments
    const [appointments, setAppointments] = useState([]); // State for upcoming appointments
    const [filteredAppointments, setFilteredAppointments] = useState([]); // State for filtered appointments
    const [doctorFilter, setDoctorFilter] = useState(""); // State for selected doctor
    const { refreshKey } = useRefreshContext(); // Use refreshKey from context


    const navigate = useNavigate();

    useEffect(() => {
        // Fetch data from the backend
        const fetchData = async () => {
            try {
                const response = await axios.get(`${network_url}/api/Receptionist/dashboard-overview`);
                console.log("Dashboard: ", response.data);
                setData(response.data);
                setAppointments(response.data.upcomingAppointments);
                setFilteredAppointments(response.data.upcomingAppointments);
            } catch (error) {
                console.error("Error fetching data", error);
            } finally {
                setLoading(false); // Stop loading after data is fetched
                setAppointmentsLoading(false);
            }
        };

        fetchData();

    }, [refreshKey]);

    const formatTime = (time24, duration) => {
        const [hours, minutes] = time24.split(':').map(Number);
        const startTime = new Date();
        startTime.setHours(hours, minutes);

        // Calculate end time
        const endTime = new Date(startTime.getTime() + duration * 60000); // duration in minutes

        const options = { hour: 'numeric', minute: 'numeric', hour12: true };
        return {
            start: startTime.toLocaleString('en-US', options),
            end: endTime.toLocaleString('en-US', options),
            day: startTime.toLocaleDateString('en-US', { weekday: 'long' })
        };
    };

    // const handlePrint = () => {
    //     const printContent = document.getElementById("appointmentsTable");
    //     const newWindow = window.open("", "", "width=800,height=600");
    //     newWindow.document.write("<html><head><title>Print Appointments</title></head><body>");
    //     newWindow.document.write(printContent.innerHTML);
    //     newWindow.document.write("</body></html>");
    //     newWindow.document.close();
    //     newWindow.print();
    // };

    const printRef = useRef();

    const handlePrint = useReactToPrint({
        content: () => printRef.current,
        documentTitle: 'Todays Appointments'
    });

    const handleFilterByDoctor = (doctorName) => {
        setDoctorFilter(doctorName); // Update the dropdown title
        if (!doctorName) {
            // If no doctor is selected, show all appointments
            setFilteredAppointments(appointments);
        } else {
            // Filter appointments for the selected doctor
            const filtered = appointments.filter(appointment =>
                `${appointment.doctor.firstName} ${appointment.doctor.lastName}` === doctorName
            );
            setFilteredAppointments(filtered);
        }
    };



    const getUniqueDoctors = () => {
        const uniqueDoctors = [...new Set(appointments.map(
            appointment => `${appointment.doctor.firstName} ${appointment.doctor.lastName}`
        ))];
        return uniqueDoctors;
    };

    return (
        <div className="p-2">
            <div className='flex-grow flex-row flex justify-between items-center mt-2 mb-4'>
                <p className='font-semibold text-2xl -mb-1'>Overview</p>
            </div>

            {/* Top Info Cards */}
            <Row className="mb-4">
                <Col md={4} className="mb-3">
                    <InfoCard
                        count={loading ? <Spinner animation="border" /> : data?.overviewCounts.totalPatients}
                        title="Total Patients"
                        textColor="#04394F"
                        svgIcon={patients_svg}
                        svgBgColor="#4B70F5"
                        viewAllLink="/receptionist/patients-portal"
                    />
                </Col>
                <Col md={4} className="mb-3">
                    <InfoCard
                        count={loading ? <Spinner animation="border" /> : data?.overviewCounts.totalAppointments}
                        title="Appointments"
                        textColor="#04394F"
                        svgIcon={docs_svg}
                        svgBgColor="#00B67A"
                        viewAllLink="/receptionist/upcoming-doctor-appointments"
                    />
                </Col>
                <Col md={4} className="mb-3">
                    <InfoCard
                        count={loading ? <Spinner animation="border" /> : data?.overviewCounts.totalDoctors}
                        title="Doctors Available"
                        textColor="#04394F"
                        svgIcon={doctors_svg}
                        svgBgColor="#00743C"
                        viewAllLink="/receptionist/doctors-portal"
                    />
                </Col>
                {/* <Col md={4} className="mb-3">
                    <InfoCard
                        count={loading ? <Spinner animation="border" /> : data?.overviewCounts.unpaidInvoices}
                        title="Pending Invoices"
                        textColor="#04394F"
                        svgIcon={docs_svg}
                        svgBgColor="#04394F"
                        viewAllLink="/receptionist/invoices"
                    />
                </Col> */}
                {/* <Col md={4} className="mb-3">
                    <InfoCard
                        count={loading ? <Spinner animation="border" /> : data?.overviewCounts.clinicRevenue}
                        title="Total Revenue"
                        textColor="#04394F"
                        svgIcon={docs_svg}
                        svgBgColor="#E8B01D"
                        viewAllLink="/receptionist/revenue"
                    />
                </Col> */}
            </Row>

            {/* Appointments and Earnings */}
            <Row>
                {/* Appointments Table */}
                <Col md={8} className="mb-4">
                    <Card>
                        <Card.Header className="d-flex justify-content-between align-items-center !bg-white">
                            <h5 className="font-semibold text-lg">Appointment</h5>
                            <div className="d-flex gap-2">
                                <Button variant="outline-success" onClick={() => { navigate('/receptionist/set-appointment') }}>
                                    Add New Appointment
                                </Button>
                                <DropdownButton
                                    id="doctorFilterDropdown"
                                    title={doctorFilter || "Filter by Doctor"} // Default to "Filter by Doctor" if no selection
                                    onSelect={handleFilterByDoctor}
                                    variant="outline-primary"
                                >
                                    <Dropdown.Item eventKey="">All Doctors</Dropdown.Item> {/* Show all when no doctor is selected */}
                                    {getUniqueDoctors().map(doctor => (
                                        <Dropdown.Item key={doctor} eventKey={doctor}>
                                            {doctor}
                                        </Dropdown.Item>
                                    ))}
                                </DropdownButton>
                                <Button variant="outline-info" onClick={handlePrint}>
                                    Print
                                </Button>
                            </div>
                        </Card.Header>
                        <Card.Body>
                            {appointmentsLoading ? (
                                <div className="d-flex justify-content-center">
                                    <Spinner animation="border" />
                                </div>
                            ) : filteredAppointments.length === 0 ? (
                                <p>No upcoming appointments</p>
                            ) : (
                                <div id="appointmentsTable">
                                    <Table responsive bordered hover>
                                        <thead>
                                            <tr>
                                                <th>Patient Name</th>
                                                <th>Doctor</th>
                                                <th>Appointments at</th>
                                                <th>Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredAppointments.map(appointment => {
                                                const { start, end, day } = formatTime(appointment.appointmentTime, appointment.doctor.slotDuration);
                                                return (
                                                    <tr key={appointment.appointmentID}>
                                                        <td>{appointment.patient.firstName}</td>
                                                        <td>{formatDoctorName(appointment.doctor.firstName)} {appointment.doctor.lastName}</td>
                                                        <td>
                                                            {!appointment.referredByDoctor ? (
                                                                <Button
                                                                    onClick={() => (navigate(`/receptionist/invoice-details/${appointment.appointmentID}`))}
                                                                    variant="outline-primary"
                                                                    size="sm"
                                                                >
                                                                    {start} - {end} {day}
                                                                </Button>
                                                            ) : (
                                                                <Button
                                                                    onClick={() => (navigate(`/receptionist/invoice-details/${appointment.appointmentID}`))}
                                                                    variant="outline-primary"
                                                                    size="sm"
                                                                >
                                                                    Referred By Doctor
                                                                </Button>
                                                            )}
                                                        </td>
                                                        <td>
                                                            <Button
                                                                variant="outline-success"
                                                                className="!text-xs"
                                                                onClick={() => (navigate(`/receptionist/invoice-details/${appointment.appointmentID}`))}
                                                            >
                                                                Details
                                                            </Button>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </Table>
                                </div>
                            )}
                        </Card.Body>

                        <div style={{ display: "none" }}>
                            <Card.Body ref={printRef} className='p-3'>
                                {appointmentsLoading ? (
                                    <div className="d-flex justify-content-center">
                                        <Spinner animation="border" />
                                    </div>
                                ) : filteredAppointments.length === 0 ? (
                                    <p>No upcoming appointments</p>
                                ) : (
                                    <div id="appointmentsTable">
                                        <h2 className='text-center mt-2 mb-4'>Today's Appointments</h2>
                                        <Table responsive bordered hover>
                                            <thead>
                                                <tr>
                                                    <th>Patient Name</th>
                                                    <th>Doctor</th>
                                                    <th>Appointment Time</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {filteredAppointments.map(appointment => {
                                                    const { start, end, day } = formatTime(appointment.appointmentTime, appointment.doctor.slotDuration);
                                                    return (
                                                        <tr key={appointment.appointmentID}>
                                                            <td>{appointment.patient.firstName}</td>
                                                            <td>{formatDoctorName(appointment.doctor.firstName)} {appointment.doctor.lastName}</td>
                                                            <td>
                                                                {!appointment.referredByDoctor ? (
                                                                    <Button
                                                                        onClick={() => (navigate(`/receptionist/invoice-details/${appointment.appointmentID}`))}
                                                                        variant="outline-primary"
                                                                        size="sm"
                                                                    >
                                                                        {start} - {end} {day}
                                                                    </Button>
                                                                ) : (
                                                                    <Button
                                                                        onClick={() => (navigate(`/receptionist/invoice-details/${appointment.appointmentID}`))}
                                                                        variant="outline-primary"
                                                                        size="sm"
                                                                    >
                                                                        Referred By Doctor
                                                                    </Button>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </Table>
                                    </div>
                                )}
                            </Card.Body>
                        </div>
                    </Card>
                </Col>


                {/* <Col md={4} className="mb-4">
                    <Card>
                        <Card.Header className='!bg-white'>
                            <h5 className='font-semibold text-lg'>Earnings From Appointments</h5>
                        </Card.Header>
                        <Card.Body>
                            <div className="text-center">
                                <LineGraph />
                            </div>
                        </Card.Body>
                    </Card>
                </Col> */}
            </Row>
        </div>
    );
};

export default Dashboard;
