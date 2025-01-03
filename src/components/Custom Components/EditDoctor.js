import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Container, Row, Col, Form, Button, Spinner } from 'react-bootstrap';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaArrowLeft } from 'react-icons/fa';
import EditScheduleModal from './EditScheduleModal';
import DoctorSchedule from '../Doctor/DoctorSchedules';
import DoctorServices from './EditDoctorService';
import { network_url } from '../Network/networkConfig';

const EditDoctorForm = () => {
    const { doctor_id } = useParams();
    const [doctor, setDoctor] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [isCustomSpecialty, setIsCustomSpecialty] = useState(false);
    const navigate = useNavigate();


    const firstNameRef = useRef();
    const lastNameRef = useRef();
    const specialtyRef = useRef();
    const emailRef = useRef();
    const mobileNumberRef = useRef();
    const availabilityRef = useRef();
    const consultationFeeRef = useRef();
    const joinedDateRef = useRef();
    const doctorPercentageCut = useRef();

    const specialtyOptions = [
        "Podiatrist",
        "Aesthetics",
        "Dermatologist",
        "General practitioner",
        "Orthopedist",
        "Cardiologist",
        "Neurologist",
    ];

    useEffect(() => {
        const fetchDoctorData = async () => {
            try {
                const response = await fetch(`${network_url}/api/Doctor/${doctor_id}`);
                if (!response.ok) throw new Error("Unable to fetch doctor data");

                const data = await response.json();
                console.log("data: ", data)
                setDoctor(data);
                setIsCustomSpecialty(!specialtyOptions.includes(data.specialty));
                setLoading(false);
            } catch (error) {
                toast.error(error.message || "Failed to fetch data.");
                setLoading(false);
            }
        };

        fetchDoctorData();
    }, [doctor_id]);

    // Handler to update the doctor's information
    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        const updatedDoctor = {
            firstName: firstNameRef.current.value,
            lastName: lastNameRef.current.value,
            specialty: specialtyRef.current.value,
            emailID: emailRef.current.value,
            mobileNumber: mobileNumberRef.current.value,
            availability: availabilityRef.current.value,
            consultationFee: parseFloat(consultationFeeRef.current.value),
            doctorPercentageCut: doctorPercentageCut.current.value
        };

        try {
            const response = await fetch(`${network_url}/api/Doctor/${doctor_id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedDoctor),
            });

            if (!response.ok) throw new Error("Failed to update doctor information.");

            toast.success("Doctor information updated successfully.");
        } catch (error) {
            toast.error(error.message || "Error updating doctor information.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleSpecialtyChange = (e) => {
        const selectedSpecialty = e.target.value;
        setIsCustomSpecialty(selectedSpecialty === "");
    };

    return (
        <Container fluid className="p-4">
            <div className="flex gap-3 mb-4 items-center align-middle">
                <button onClick={() => navigate('/receptionist/doctors-portal')} className="text-success -mt-2">
                    <FaArrowLeft size={20} />
                </button>
                <h2 className="text-left text-2xl font-bold">Edit Doctor</h2>
            </div>
            <ToastContainer />
            {loading ? (
                <div className="text-center">
                    <Spinner animation="border" variant="primary" />
                </div>
            ) : (
                <Form onSubmit={handleSubmit} className="space-y-4">
                    <Row>
                        <Col md={6}>
                            <Form.Group controlId="formFirstName">
                                <Form.Label className="text-[16px] font-medium leading-[22px] text-left">First Name</Form.Label>
                                <Form.Control
                                    type="text"
                                    ref={firstNameRef}
                                    placeholder="Enter first name"
                                    defaultValue={doctor?.firstName}
                                    className="!border-[#04394F] rounded-md"
                                    disabled={submitting}
                                />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group controlId="formLastName">
                                <Form.Label className="text-[16px] font-medium leading-[22px] text-left">Last Name</Form.Label>
                                <Form.Control
                                    type="text"
                                    ref={lastNameRef}
                                    placeholder="Enter last name"
                                    defaultValue={doctor?.lastName}
                                    className="!border-[#04394F] rounded-md"
                                    disabled={submitting}
                                />
                            </Form.Group>
                        </Col>
                    </Row>

                    <Row>
                        <Col md={6}>
                            <Form.Group controlId="formSpecialty">
                                <Form.Label className="text-[16px] font-medium leading-[22px] text-left">Specialty</Form.Label>
                                {isCustomSpecialty ? (
                                    <Form.Control
                                        type="text"
                                        ref={specialtyRef}
                                        defaultValue={doctor.specialty}
                                        placeholder="Enter specialty"
                                        className="!border-[#04394F] rounded-md"
                                        disabled={submitting}
                                    />
                                ) : (
                                    <Form.Control
                                        as="select"
                                        ref={specialtyRef}
                                        defaultValue={doctor.specialty}
                                        onChange={handleSpecialtyChange}
                                        className="!border-[#04394F] rounded-md"
                                        disabled={submitting}
                                    >
                                        <option value="">Select Specialty</option>
                                        {specialtyOptions.map((option) => (
                                            <option key={option} value={option}>{option}</option>
                                        ))}
                                    </Form.Control>
                                )}
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group controlId="formEmailID">
                                <Form.Label className="text-[16px] font-medium leading-[22px] text-left">Email ID</Form.Label>
                                <Form.Control
                                    type="email"
                                    ref={emailRef}
                                    placeholder="Enter email"
                                    defaultValue={doctor?.emailID}
                                    className="!border-[#04394F] rounded-md"
                                    disabled={submitting}
                                />
                            </Form.Group>
                        </Col>
                    </Row>

                    <Row>
                        <Col md={6}>
                            <Form.Group controlId="formMobileNumber">
                                <Form.Label className="text-[16px] font-medium leading-[22px] text-left">Mobile Number</Form.Label>
                                <Form.Control
                                    type="tel"
                                    ref={mobileNumberRef}
                                    placeholder="Enter mobile number"
                                    defaultValue={doctor?.mobileNumber}
                                    className="!border-[#04394F] rounded-md"
                                    disabled={submitting}
                                />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group controlId="formAvailability">
                                <Form.Label className="text-[16px] font-medium leading-[22px] text-left">Availability</Form.Label>
                                <Form.Control
                                    as="select"
                                    ref={availabilityRef}
                                    defaultValue={doctor?.availability}
                                    className="!border-[#04394F] rounded-md"
                                    disabled={submitting}
                                >
                                    <option value="">Select Availability</option>
                                    <option value="Available">Available</option>
                                    <option value="Not Available">Not Available</option>
                                </Form.Control>
                            </Form.Group>
                        </Col>
                    </Row>

                    <Row>
                        <Col md={6}>
                            <Form.Group controlId="formConsultationFee">
                                <Form.Label className="text-[16px] font-medium leading-[22px] text-left">Consultation Fee</Form.Label>
                                <Form.Control
                                    type="number"
                                    ref={consultationFeeRef}
                                    placeholder="Enter consultation fee"
                                    defaultValue={doctor?.consultationFee}
                                    className="!border-[#04394F] rounded-md"
                                    disabled={submitting}
                                />
                            </Form.Group>
                        </Col>
                        <Col hidden md={6}>
                            <Form.Group controlId="formJoinedDate">
                                <Form.Label className="text-[16px] font-medium leading-[22px] text-left">Joined Date</Form.Label>
                                <Form.Control
                                    type="date"
                                    ref={joinedDateRef}
                                    defaultValue={doctor?.joinedDate}
                                    className="!border-[#04394F] rounded-md"
                                    disabled={submitting}
                                />
                            </Form.Group>
                        </Col>
                        <Col>
                            <Form.Group >
                                <Form.Label className="text-[16px] font-medium leading-[22px] text-left">Doctor Cut Percentage</Form.Label>
                                <Form.Control
                                    type="number"
                                    placeholder="Enter Doctor Cut Percentage"
                                    ref={doctorPercentageCut}
                                    className="!border-[#04394F] rounded-md"
                                    defaultValue={doctor?.doctorPercentageCut}
                                    onChange={(e) => {
                                        if (e.target.value > 100) {
                                            e.target.value = 100; // Set value to 100 if it exceeds
                                        }
                                    }}
                                />
                            </Form.Group>
                        </Col>
                    </Row>

                    <Button variant='outline-success' type="submit" disabled={submitting}>
                        {submitting ? <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> : 'Update Doctor'}
                    </Button>
                </Form>
            )}

            <DoctorSchedule></DoctorSchedule>

            <DoctorServices doctorId={doctor_id}></DoctorServices>
        </Container>
    );
};

export default EditDoctorForm;
