import React, { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Container, Row, Col, Form, Button, Spinner, Card } from 'react-bootstrap';
import { ToastContainer, toast } from 'react-toastify';
import { FaArrowLeft, FaEdit } from 'react-icons/fa';
import DoctorSchedule from '../Doctor/DoctorSchedules';
import DoctorServices from './EditDoctorService';
import { network_url } from '../Network/networkConfig';
import ChangePasswordCard from './ChangePassword';

const EditDoctorForm = () => {
    let { doctor_id } = useParams();
    if (!doctor_id) {
        doctor_id = JSON.parse(localStorage.getItem('doctor'))?.doctorID;
    }

    const [doctor, setDoctor] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [isCustomSpecialty, setIsCustomSpecialty] = useState(false);
    const [editing, setEditing] = useState(false);
    const navigate = useNavigate();

    const location = useLocation();
    const [isDoctor, setIsDoctor] = useState(false);
    const [isReceptionist, setIsReceptionist] = useState(false);

    useEffect(() => {
        if (location.pathname.includes('/doctor/')) {
            setIsDoctor(true);
        } else if (location.pathname.includes('/receptionist/')) {
            setIsReceptionist(true);
            setEditing(true);
        } else {
            setIsDoctor(false)
            setIsReceptionist(false);
        }
    }, [location.pathname]);


    const firstNameRef = useRef();
    const lastNameRef = useRef();
    const specialtyRef = useRef();
    const emailRef = useRef();
    const mobileNumberRef = useRef();
    const availabilityRef = useRef();
    const consultationFeeRef = useRef();
    const joinedDateRef = useRef();
    const usernameRef = useRef();
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
            username: usernameRef.current.value,
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
            isDoctor && setEditing(false);
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
                <h2 className="text-left text-2xl font-bold">Doctor Profile</h2>
            </div>
            <ToastContainer />
            {loading ? (
                <div className="text-center">
                    <Spinner animation="border" variant="primary" />
                </div>
            ) : (
                !editing ?
                    (<Card className="shadow-sm p-4">
                        <Card.Body>
                            <Row className="mb-3">
                                <Col md={6} className="mb-3 md:mb-0">
                                    <p className="text-[16px] font-medium leading-[22px]">
                                        <strong>First Name:</strong>
                                    </p>
                                    <p className="text-[14px] text-gray-700">{doctor.firstName}</p>
                                </Col>
                                <Col md={6}>
                                    <p className="text-[16px] font-medium leading-[22px]">
                                        <strong>Last Name:</strong>
                                    </p>
                                    <p className="text-[14px] text-gray-700">{doctor.lastName}</p>
                                </Col>
                            </Row>

                            <Row className="mb-3">
                                <Col md={6} className="mb-3 md:mb-0">
                                    <p className="text-[16px] font-medium leading-[22px]">
                                        <strong>Specialty:</strong>
                                    </p>
                                    <p className="text-[14px] text-gray-700">{doctor.specialty}</p>
                                </Col>
                                <Col md={6}>
                                    <p className="text-[16px] font-medium leading-[22px]">
                                        <strong>Email ID:</strong>
                                    </p>
                                    <p className="text-[14px] text-gray-700">{doctor.emailID}</p>
                                </Col>
                            </Row>

                            <Row className="mb-3">
                                <Col md={6} className="mb-3 md:mb-0">
                                    <p className="text-[16px] font-medium leading-[22px]">
                                        <strong>Mobile Number:</strong>
                                    </p>
                                    <p className="text-[14px] text-gray-700">{doctor.mobileNumber}</p>
                                </Col>
                                <Col md={6}>
                                    <p className="text-[16px] font-medium leading-[22px]">
                                        <strong>Availability:</strong>
                                    </p>
                                    <p className="text-[14px] text-gray-700">{doctor.availability}</p>
                                </Col>
                            </Row>

                            <Row className="mb-3">
                                <Col md={6} className="mb-3 md:mb-0">
                                    <p className="text-[16px] font-medium leading-[22px]">
                                        <strong>Consultation Fee:</strong>
                                    </p>
                                    <p className="text-[14px] text-gray-700">Rs. {doctor.consultationFee}/-</p>
                                </Col>
                                <Col md={6}>
                                    <p className="text-[16px] font-medium leading-[22px]">
                                        <strong>Username:</strong>
                                    </p>
                                    <p className="text-[14px] text-gray-700">{doctor.username}</p>
                                </Col>
                            </Row>

                            <Row className="mb-3">
                                <Col md={6}>
                                    <p className="text-[16px] font-medium leading-[22px]">
                                        <strong>Doctor Cut Percentage:</strong>
                                    </p>
                                    <p className="text-[14px] text-gray-700">{doctor.doctorPercentageCut}%</p>
                                </Col>
                            </Row>

                            <div className="flex justify-end mt-4">
                                <Button
                                    variant="outline-primary"
                                    className="px-4 py-2 text-[16px] font-medium leading-[22px] rounded-lg hover:bg-primary hover:text-white"
                                    onClick={() => setEditing(true)}
                                >
                                    <FaEdit className="inline mr-2" /> Edit Information
                                </Button>
                            </div>
                        </Card.Body>
                    </Card>
                    )
                    :
                    (< Form onSubmit={handleSubmit} className="space-y-4">
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
                            <Col md={6}>
                                <Form.Group controlId="formConsultationFee">
                                    <Form.Label className="text-[16px] font-medium leading-[22px] text-left">Username</Form.Label>
                                    <Form.Control
                                        type="text"
                                        ref={usernameRef}
                                        placeholder="Enter Login Username"
                                        defaultValue={doctor?.username}
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
                    </Form>)
            )
            }

            {isReceptionist &&
                <>
                    <DoctorSchedule></DoctorSchedule>

                    <DoctorServices doctorId={doctor_id}></DoctorServices>
                </>}

            {isDoctor &&
                <ChangePasswordCard></ChangePasswordCard>
            }
        </Container >
    );
};

export default EditDoctorForm;
