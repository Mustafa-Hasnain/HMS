import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Row, Col, Form, Button, Spinner } from 'react-bootstrap';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const EditDoctorForm = () => {
    const { doctor_id } = useParams();
    const [doctor, setDoctor] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [isCustomSpecialty, setIsCustomSpecialty] = useState(false);


    const firstNameRef = useRef();
    const lastNameRef = useRef();
    const specialtyRef = useRef();
    const emailRef = useRef();
    const mobileNumberRef = useRef();
    const availabilityRef = useRef();
    const consultationFeeRef = useRef();
    const joinedDateRef = useRef();

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
                const response = await fetch(`https://mustafahasnain36-001-site1.gtempurl.com/api/Doctor/${doctor_id}`);
                if (!response.ok) throw new Error("Unable to fetch doctor data");

                const data = await response.json();
                console.log("data: ",data)
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
            consultationFee: parseFloat(consultationFeeRef.current.value)
        };

        try {
            const response = await fetch(`https://mustafahasnain36-001-site1.gtempurl.com/api/Doctor/${doctor_id}`, {
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
            <h2 className="text-left text-2xl mb-4 font-bold">Edit Doctor</h2>
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
                    </Row>

                    <Button type="submit" className="bg-[#04394F] text-white" disabled={submitting}>
                        {submitting ? <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> : 'Update Doctor'}
                    </Button>
                </Form>
            )}
        </Container>
    );
};

export default EditDoctorForm;
