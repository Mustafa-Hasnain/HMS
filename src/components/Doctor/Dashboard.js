import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Table, Button, Spinner } from 'react-bootstrap';
import { FaEllipsisV } from 'react-icons/fa';
import { Menu } from '@headlessui/react';
import patients_svg from '../../assets/patients.svg';
import docs_svg from '../../assets/docs.svg';
import doctors_svg from '../../assets/doctors.svg';
import InfoCard from '../Custom Components/infoCard';
import { useNavigate } from 'react-router-dom';
import { useRefreshContext } from '../../contexts/RefreshContext';
import { network_url } from '../Network/networkConfig';

const DoctorDashboard = () => {
    const [data, setData] = useState(null); // Store the overview data
    const [appointments, setAppointments] = useState([]); // Store the appointments data
    const [loading, setLoading] = useState(true); // For loading state
    const [appointmentsLoading, setAppointmentsLoading] = useState(true);
    const { setRefreshFunction } = useRefreshContext();


    const navigate = useNavigate();

    // Fetch appointments for the doctor
    const fetchAppointments = async (doctorID) => {
        try {
            const response = await fetch(`${network_url}/api/Doctor/dashbord-overview/${doctorID}`);
            const result = await response.json();
            console.log("Data: ", result);
            setData(result);
            setAppointments(result.upcomingAppointments); // Set appointments data

        } catch (error) {
            console.error("Error fetching data", error);
        } finally {
            setLoading(false);
            setAppointmentsLoading(false);
        }
    };

    useEffect(() => {
        const doctorData = JSON.parse(localStorage.getItem('doctor'));
        if (doctorData && doctorData.doctorID) {
            fetchAppointments(doctorData.doctorID);
        }
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
                <p className='font-bold text-2xl -mb-1'>Overview</p>
            </div>

            {/* Top Info Cards */}
            <Row className="mb-4">
                <Col md={4} className="mb-3">
                    <InfoCard
                        count={loading ? <Spinner animation="border" /> : data?.totalAppointments}
                        title="Appointments"
                        textColor="#04394F"
                        svgIcon={docs_svg}
                        svgBgColor="#00B67A"
                    />
                </Col>
                <Col md={4} className="mb-3">
                    <InfoCard
                        count={loading ? <Spinner animation="border" /> : data?.totalScheduledAppointments}
                        title="Scheduled Appointments"
                        textColor="#04394F"
                        svgIcon={docs_svg}
                        svgBgColor="#00743C"
                    />
                </Col>
                <Col md={4} className="mb-3">
                    <InfoCard
                        count={loading ? <Spinner animation="border" /> : data?.totalUpcomingAppointments}
                        title="Today's Appointments"
                        textColor="#04394F"
                        svgIcon={docs_svg}
                        svgBgColor="#4B70F5"
                    />
                </Col>
                <Col md={4} className="mb-3">
                    <InfoCard
                        count={loading ? <Spinner animation="border" /> : data?.totalCanceledAppointments}
                        title="Canceled Appointments"
                        textColor="#04394F"
                        svgIcon={docs_svg}
                        svgBgColor="#FF4B4B"
                    />
                </Col>
            </Row>

            {/* Appointments Table */}
            <Row>
                <Col md={12} className="mb-4">
                    <Card>
                        <Card.Header className="d-flex justify-content-between align-items-center !bg-white">
                            <h5 className='font-semibold text-lg'>Appointments</h5>
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
                                            <th>Appointment Time</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {appointments.map(appointment => {
                                            const slotDuration = appointment.doctor.schedules.find(schedule => schedule.dayOfWeek === new Date(appointment.appointmentDate).toLocaleString('en-US', { weekday: 'long' }))?.slotDuration || 30;
                                            const { start, end, day } = formatTime(appointment.appointmentTime, slotDuration);
                                            return (
                                                <tr key={appointment.appointmentID}>
                                                    <td>{appointment.patient.firstName}</td>
                                                    <td>Dr. {appointment.doctor.firstName} {appointment.doctor.lastName}</td>
                                                    <td>
                                                        <Button variant="outline-primary" size="sm">
                                                            {start} - {end}, {day}
                                                        </Button>
                                                    </td>
                                                    <td>
                                                        <Button onClick={()=>(navigate(`/doctor/invoice-details/${appointment.appointmentID}`))} variant="outline-success">View Details</Button>
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
            </Row>
        </div>
    );
};

export default DoctorDashboard;
