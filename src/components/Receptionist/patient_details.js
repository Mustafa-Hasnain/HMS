import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { Button, Container, Table } from "react-bootstrap";
import "../../styles/patient_details.css";
import "../../styles/table.css";
import { FaArrowLeft } from "react-icons/fa";

const PatientDetails = () => {
    const { patient_id } = useParams(); // Get patient ID from the route params
    const [patient, setPatient] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const calculateAge = (dateString) => {
        const birthDate = new Date(dateString);
        const today = new Date();

        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        const dayDiff = today.getDate() - birthDate.getDate();

        // Adjust if the current month and day are before the birth month and day
        if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
            age--;
        }

        return age;
    };

    useEffect(() => {
        if (!patient_id) {
            setLoading(false);
            setError("No details found");
            return;
        }

        const fetchPatientDetails = async () => {
            try {
                const response = await axios.get(
                    `https://mustafahasnain36-001-site1.gtempurl.com/api/Receptionist/patient-details/${patient_id}`
                );
                setPatient(response.data);
                setLoading(false);
            } catch (error) {
                setError("Unable to fetch patient details");
                setLoading(false);
            }
        };

        fetchPatientDetails();
    }, [patient_id]);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    if (!patient) {
        return <div>No details found</div>;
    }

    const sortedAppointments = [...patient.appointments].sort(
        (a, b) => new Date(b.appointmentDate) - new Date(a.appointmentDate)
    );

    return (
        <Container className="pt-4">
            <div className="flex justify-between">
                <div className="flex gap-3 items-center align-middle">
                    <button onClick={() => navigate('/receptionist/patients-portal')} className="text-success -mt-2">
                        <FaArrowLeft size={20} />
                    </button>
                    <h2 className="font-semibold text-2xl">Patient Details</h2>
                </div>
                <Button onClick={(() => { navigate(`/receptionist/edit-patient/${patient_id}`) })} variant="success">Edit Patient</Button>
            </div>
            <div className="bg-[#F8F8F8] grid grid-cols-1 md:grid-cols-3 gap-4 p-6 mt-4 rounded-md">
                <div className="patientDetails">
                    <p>Name</p>
                    <h2>{patient.firstName}</h2>
                </div>
                <div className="patientDetails">
                    <p>Contact No</p>
                    <h2>{patient.mobileNumber}</h2>
                </div>
                <div className="patientDetails">
                    <p>Gender</p>
                    <h2>{patient.gender}</h2>
                </div>
                <div className="patientDetails">
                    <p>Date of Birth</p>
                    <h2>{patient?.dateOfBirth ? new Date(patient.dateOfBirth).toLocaleDateString() : 'N/A'}</h2>
                </div>
                <div className="patientDetails">
                    <p>Age</p>
                    <h2>{patient?.dateOfBirth ? calculateAge(patient.dateOfBirth) : 'N/A'} Years</h2>
                </div>
                <div className="patientDetails">
                    <p>CNIC</p>
                    <h2>{patient?.cnic || 'N/A'}</h2>
                </div>
                <div className="patientDetails">
                    <p>Blood Group</p>
                    <h2>{patient?.bloodGroup ? patient?.bloodGroup : 'N/A'}</h2>
                </div>
            </div>

            <h3 className="text-2xl mt-3 mb-4">Appointments</h3>
            {sortedAppointments.length === 0 ? (
                <p>No appointments</p>
            ) : (
                <Table className="table" hover responsive>
                    <thead>
                        <tr>
                            <th>Doctor</th>
                            <th>Appointment Date</th>
                            <th>Amount</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedAppointments.map((appointment) => (
                            <tr key={appointment.appointmentID}>
                                <td>
                                    {appointment.doctor.firstName} {appointment.doctor.lastName}
                                </td>
                                <td>
                                    {new Date(appointment.appointmentDate).toLocaleDateString('en-US', {
                                        weekday: 'long',
                                        year: 'numeric',
                                        month: 'short',
                                        day: 'numeric',
                                    })}{" "}
                                    at {appointment.appointmentTime}
                                </td>
                                <td>
                                    {appointment.invoices.length > 0
                                        ? appointment.invoices[0].amount
                                        : "N/A"}
                                </td>
                                <td>{appointment.status}</td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            )}
        </Container>
    );
};

export default PatientDetails;
