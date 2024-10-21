import React, { useEffect, useState } from 'react';
import { Button, Table, Row, Col, Card, Spinner } from 'react-bootstrap';
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

const Dashboard = () => {
    const [loading, setLoading] = useState(true); // Loading state for all cards
    const [data, setData] = useState(null); // State to hold API data
    const [appointmentsLoading, setAppointmentsLoading] = useState(true); // Loading for appointments
    const [appointments, setAppointments] = useState([]); // State for upcoming appointments

    const navigate = useNavigate();

    useEffect(() => {
        // Fetch data from the backend
        const fetchData = async () => {
            try {
                const response = await axios.get('https://mustafahasnain36-001-site1.gtempurl.com/api/Receptionist/dashboard-overview');
                setData(response.data);
                setAppointments(response.data.upcomingAppointments);
            } catch (error) {
                console.error("Error fetching data", error);
            } finally {
                setLoading(false); // Stop loading after data is fetched
                setAppointmentsLoading(false);
            }
        };

        fetchData();
    }, []);

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
                <Col md={4} className="mb-3">
                    <InfoCard
                        count={loading ? <Spinner animation="border" /> : data?.overviewCounts.unpaidInvoices}
                        title="Pending Invoices"
                        textColor="#04394F"
                        svgIcon={docs_svg}
                        svgBgColor="#04394F"
                        viewAllLink="/receptionist/invoices"
                    />
                </Col>
                <Col md={4} className="mb-3">
                    <InfoCard
                        count={loading ? <Spinner animation="border" /> : data?.overviewCounts.clinicRevenue}
                        title="Total Revenue"
                        textColor="#04394F"
                        svgIcon={docs_svg}
                        svgBgColor="#E8B01D"
                        viewAllLink="/receptionist/revenue"
                    />
                </Col>
            </Row>

            {/* Appointments and Earnings */}
            <Row>
                {/* Appointments Table */}
                <Col md={8} className="mb-4">
                    <Card>
                        <Card.Header className="d-flex justify-content-between align-items-center !bg-white">
                            <h5 className='font-semibold text-lg'>Appointment</h5>
                            <Button variant="success">Add New Appointment</Button>
                        </Card.Header>
                        <Card.Body>
                            {appointmentsLoading ? (
                                <div className="d-flex justify-content-center">
                                    <Spinner animation="border" />
                                </div>
                            ) : appointments.length === 0 ? (
                                <p>No upcoming appointments</p>
                            ) : (
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
                                        {appointments.map(appointment => {
                                            const { start, end, day } = formatTime(appointment.appointmentTime, appointment.doctor.slotDuration);
                                            return (
                                                <tr key={appointment.appointmentID}>
                                                    <td>{appointment.patient.firstName}</td>
                                                    <td>Dr. {appointment.doctor.firstName} {appointment.doctor.lastName}</td>
                                                    <td>
                                                        <Button variant="outline-primary" size="sm">
                                                            {start} - {end} {day}
                                                        </Button>
                                                    </td>
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
                                                                                onClick={()=>(navigate(''))}
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
                                            );
                                        })}
                                    </tbody>
                                </Table>
                            )}
                        </Card.Body>
                    </Card>
                </Col>


                {/* Earnings Chart */}
                <Col md={4} className="mb-4">
                    <Card>
                        <Card.Header className='!bg-white'>
                        <h5 className='font-semibold text-lg'>Earnings From Appointments</h5>
                            </Card.Header>
                        <Card.Body>
                            {/* Placeholder for chart */}
                            <div className="text-center">
                                <LineGraph />
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default Dashboard;
