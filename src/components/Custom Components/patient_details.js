import React, { useEffect, useState } from "react";
import axios from "axios";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Button, Container, Form, Nav, Tab, Table } from "react-bootstrap";
import "../../styles/patient_details.css";
import "../../styles/table.css";
import { FaArrowLeft, FaEdit, FaEye } from "react-icons/fa";
import { network_url } from "../Network/networkConfig";
import PrescriptionModal from "./PrescriptionModal";

const PatientDetails = () => {
    const { patient_id } = useParams(); // Get patient ID from the route params
    const [patient, setPatient] = useState(null);
    const [patientPrescriptions, setPatientPrescriptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingPrescriptions, setLoadingPrescriptions] = useState(true);
    const [error, setError] = useState(null);
    const [filteredPrescriptions, setFilteredPrescriptions] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedPrescription, setSelectedPrescription] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [inventoryItems, setInventoryItems] = useState([]);
    const [totalAmount, setTotalAmount] = useState(0);


    const navigate = useNavigate();

    const location = useLocation();
    const [isDoctor, setIsDoctor] = useState(false);
    const [isReceptionist, setIsReceptionist] = useState(false);

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
                let response = null;
                let doctorData = null;
                if (location.pathname.includes('/doctor/')) {
                    doctorData = JSON.parse(localStorage.getItem('doctor'));
                    response = await axios.get(
                        `${network_url}/api/Receptionist/patient-details/${patient_id}?doctorId=${doctorData.doctorID}`
                    );
                    setIsDoctor(true);
                }
                else {
                    response = await axios.get(
                        `${network_url}/api/Receptionist/patient-details/${patient_id}`
                    );
                    setIsReceptionist(true)
                }
                setPatient(response.data);
                setLoading(false);
            } catch (error) {
                setError("Unable to fetch patient details");
                setLoading(false);
            }
        };

        const fetchPatientPrescriptions = async () => {
            try {
                let response = null;
                let doctorData = null;
                if (location.pathname.includes('/doctor/')) {
                    doctorData = JSON.parse(localStorage.getItem('doctor'));
                    response = await axios.get(
                        `${network_url}/api/Prescription/patients/${patient_id}?doctorId=${doctorData.doctorID}`
                    );
                    setIsDoctor(true);
                }
                else {
                    response = await axios.get(
                        `${network_url}/api/Prescription/patients/${patient_id}`
                    );
                    setIsReceptionist(true)
                }
                setPatientPrescriptions(response.data);
                setFilteredPrescriptions(response.data);
            } catch (error) {
                setError("Unable to fetch patient Prescriptions");
            }
            finally {
                setLoadingPrescriptions(false)
            }
        };

        fetchPatientDetails();
        fetchPatientPrescriptions();
    }, [patient_id]);

    const handleSearch = (e) => {
        const query = e.target.value.toLowerCase();
        setSearchQuery(query);
        const filtered = patientPrescriptions.filter((prescription) =>
            prescription.doctor.firstName.toLowerCase().includes(query) ||
            prescription.doctor.lastName.toLowerCase().includes(query) ||
            prescription.doctor.mobileNumber.includes(query) ||
            prescription.invoiceID.includes(query) ||
            prescription.doctorID.includes(query) ||
            prescription.dateIssued.includes(query)
        );
        setFilteredPrescriptions(filtered);
    };

    const handleViewPrescription = (prescription) => {
        console.log("Prescription: ", prescription)
        setSelectedPrescription(prescription);
        // calculateTotalAmount(prescription);
        setShowModal(true);
    };

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
                    <button onClick={() => navigate(isReceptionist ? '/receptionist/patients-portal' : '/doctor/patients-portal')} className="text-success -mt-2">
                        <FaArrowLeft size={20} />
                    </button>
                    <h2 className="font-semibold text-2xl">Patient Details</h2>
                </div>
                {isReceptionist && <Button onClick={(() => { navigate(`/receptionist/edit-patient/${patient_id}`) })} variant="success">Edit Patient</Button>}
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

            <Tab.Container defaultActiveKey="appointments">
                <Nav variant="tabs">
                    <Nav.Item>
                        <Nav.Link eventKey="appointments">Appointments</Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                        <Nav.Link eventKey="workbooks">WorkBooks</Nav.Link>
                    </Nav.Item>
                </Nav>
                <Tab.Content className="mt-3 p-3">

                    <Tab.Pane eventKey="appointments">
                        <div>
                            <h3 className="text-2xl mb-4">Appointments</h3>
                        </div>
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
                                        <th>Action</th>
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
                                            <td> <Button
                                                variant="outline-success"
                                                className=' !text-xs'
                                                onClick={() => navigate(isReceptionist ? `/receptionist/invoice-details/${appointment.appointmentID}` : `/doctor/invoice-details/${appointment.appointmentID}`)}
                                            >
                                                Details
                                            </Button></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        )}
                    </Tab.Pane>
                    <Tab.Pane eventKey="workbooks">
                        <h3 className="text-2xl mb-4">Patient WorkBooks</h3>
                        <Form.Control
                            type="text"
                            placeholder="Search by patient name or phone number"
                            value={searchQuery}
                            onChange={handleSearch}
                            className="mb-4"
                        />
                        <div className="overflow-auto">
                            {filteredPrescriptions.length === 0 ? (
                                <p>No prescriptions available.</p>
                            ) : (
                                <Table bordered hover responsive className="table-auto w-full">
                                    <thead className="thead-dark">
                                        <tr>
                                            <th>#</th>
                                            <th>Doctor Name</th>
                                            <th>Patient Name</th>
                                            <th>Phone Number</th>
                                            <th>Date Issued</th>
                                            <th>Invoice ID</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredPrescriptions.map((prescription, index) => (
                                            <tr key={prescription.prescriptionID}>
                                                <td>{index + 1}</td>
                                                <td>{prescription.doctor?.firstName} {prescription.doctor?.lastName}</td>
                                                <td>{prescription.patient.firstName} {prescription.patient.lastName}</td>
                                                <td>{prescription.patient.mobileNumber}</td>
                                                <td>{new Date(prescription.dateIssued).toLocaleDateString()}</td>
                                                <td>{prescription.invoiceID}</td>
                                                <td>
                                                    <div className='flex gap-3'>
                                                        {isDoctor && <Button
                                                            variant="outline-primary"
                                                            size="sm"
                                                            onClick={(e) => {
                                                                e.stopPropagation(); // Prevent row click from firing
                                                                navigate(`/doctor/edit-prescription/${prescription.patientID}/${prescription.invoiceID}/${prescription.prescriptionID}`);
                                                            }}
                                                        >
                                                            <FaEdit />
                                                        </Button>}
                                                        <Button
                                                            variant="outline-info"
                                                            onClick={() => handleViewPrescription(prescription)}
                                                        >
                                                            <FaEye />
                                                        </Button>
                                                        <Button
                                                            variant="outline-success"
                                                            onClick={() => navigate(isDoctor ? `/doctor/invoice-details/${prescription.invoiceID}` : `/receptionist/invoice-details/${prescription.invoiceID}`)}
                                                        >
                                                            Details
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            )}
                        </div>
                    </Tab.Pane>
                </Tab.Content>
            </Tab.Container>
            {selectedPrescription && (
                <PrescriptionModal
                    showModal={showModal}
                    setShowModal={setShowModal}
                    prescriptionDetails={selectedPrescription}
                    totalAmount={totalAmount}
                    inventoryItems={inventoryItems}
                    openFromPrescriptions={true}
                />
            )}
        </Container>
    );
};

export default PatientDetails;
