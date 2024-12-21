import React, { useState, useRef } from 'react';
import { Container, Form, Button, Row, Col, Spinner, Table } from 'react-bootstrap';
import { FaArrowLeft } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'tailwindcss/tailwind.css';
import AdDoctorServiceModal from '../Custom Components/AddDoctorServicesModal';
import { network_url } from '../Network/networkConfig';

function AddDoctor() {
    const [schedules, setSchedules] = useState([{ dayOfWeek: '', startTime: '', endTime: '', slotDuration: '' }]);
    const [loading, setLoading] = useState(false);
    const [specialty, setSpecialty] = useState(""); // State to track specialty selection
    const [doctorServices, setDoctorServices] = useState([]); // New state for managing doctor services
    const [showServiceModal, setShowServiceModal] = useState(false); // State to manage modal visibility



    // Refs for form inputs
    const firstNameRef = useRef(null);
    const lastNameRef = useRef(null);
    const specialtyRef = useRef(null);
    const otherSpecialtyRef = useRef(null);
    const emailRef = useRef(null);
    const mobileNumberRef = useRef(null);
    const availabilityRef = useRef(null);
    const consultationFeeRef = useRef(null);
    const joinedDateRef = useRef(null);
    const username = useRef(null);
    const doctorPercentage = useRef(null);


    // Add service to doctorServices state
    const addService = (newService) => {
        setDoctorServices([...doctorServices, newService]);
    };

    // Delete service from doctorServices state
    const deleteService = (index) => {
        const updatedServices = doctorServices.filter((_, i) => i !== index);
        setDoctorServices(updatedServices);
    };

    // Handle specialty selection change
    const handleSpecialtyChange = (e) => {
        const selectedValue = e.target.value;
        setSpecialty(selectedValue);
    };

    const navigate = useNavigate();

    // Handle changes in schedule fields
    const handleScheduleChange = (e, index) => {
        const { name, value } = e.target;
        const updatedSchedules = [...schedules];
        updatedSchedules[index] = {
            ...updatedSchedules[index],
            [name]: value
        };
        setSchedules(updatedSchedules);
    };

    // Add new schedule form
    const addSchedule = () => {
        setSchedules([...schedules, { dayOfWeek: '', startTime: '', endTime: '', slotDuration: '' }]);
    };

    // Remove schedule form
    const removeSchedule = (index) => {
        const updatedSchedules = schedules.filter((_, i) => i !== index);
        setSchedules(updatedSchedules);
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        // Basic validation to ensure all fields are filled
        if (!firstNameRef.current.value.trim()) {
            toast.error('First name is required.');
            firstNameRef.current.focus();
            setLoading(false);
            return;
        }
        if (!lastNameRef.current.value.trim()) {
            toast.error('Last name is required.');
            lastNameRef.current.focus();
            setLoading(false);
            return;
        }
        if (!specialtyRef.current.value) {
            toast.error('Specialty is required.');
            specialtyRef.current.focus();
            setLoading(false);
            return;
        }
        if (!emailRef.current.value.trim()) {
            toast.error('Email is required.');
            emailRef.current.focus();
            setLoading(false);
            return;
        }
        if (!mobileNumberRef.current.value.trim()) {
            toast.error('Mobile number is required.');
            mobileNumberRef.current.focus();
            setLoading(false);
            return;
        }
        if (!availabilityRef.current.value) {
            toast.error('Availability is required.');
            availabilityRef.current.focus();
            setLoading(false);
            return;
        }
        if (!consultationFeeRef.current.value.trim()) {
            toast.error('Consultation fee is required.');
            consultationFeeRef.current.focus();
            setLoading(false);
            return;
        }
        if (!joinedDateRef.current.value) {
            toast.error('Joined date is required.');
            joinedDateRef.current.focus();
            setLoading(false);
            return;
        }

        for (let i = 0; i < schedules.length; i++) {
            const { dayOfWeek, startTime, endTime, slotDuration } = schedules[i];
            if (!dayOfWeek) {
                toast.error(`Day of Week is required for schedule ${i + 1}.`);
                setLoading(false);
                return;
            }
            if (!startTime || !endTime) {
                toast.error(`Start and End time are required for schedule ${i + 1}.`);
                setLoading(false);
                return;
            }
            if (startTime >= endTime) {
                toast.error(`Start time should be before End time in schedule ${i + 1}.`);
                setLoading(false);
                return;
            }
            if (!slotDuration) {
                toast.error(`Slot duration is required for schedule ${i + 1}.`);
                setLoading(false);
                return;
            }
        }

        // Prepare data for submission
        const doctorData = {
            FirstName: firstNameRef.current.value.trim(),
            LastName: lastNameRef.current.value.trim(),
            Specialty: specialtyRef.current.value.trim(),
            EmailID: emailRef.current.value.trim(),
            MobileNumber: mobileNumberRef.current.value.trim(),
            Availability: availabilityRef.current.value.trim(),
            ConsultationFee: parseFloat(consultationFeeRef.current.value),
            JoinedDate: new Date(joinedDateRef.current.value).toISOString(),
            Schedules: schedules.map(schedule => ({
                DayOfWeek: schedule.dayOfWeek.trim(),
                StartTime: schedule.startTime,
                EndTime: schedule.endTime,
                SlotDuration: parseInt(schedule.slotDuration)
            })),
            DoctorServices: doctorServices.map(service => ({
                ServiceName: service.serviceName.trim(),
                Description: service.description.trim(),
                Price: service.price,
                DoctorCutPercentage: service.doctorCutPercentage,
            }))
        };

        try {
            const response = await fetch(`${network_url}/api/Receptionist/register-doctor`, {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(doctorData),
            });

            if (!response.ok) {
                setLoading(false);
                throw new Error('Network response was not ok');
            }

            // On success, show toast and clear form
            toast.success('Doctor registered successfully!');
            clearForm();
            setLoading(false);
            navigate('/receptionist/doctors-portal');
        } catch (err) {
            toast.error('Failed to register doctor: ' + err.message);
            setLoading(false);
        }
    };

    // Clear form after successful submission
    const clearForm = () => {
        firstNameRef.current.value = '';
        lastNameRef.current.value = '';
        specialtyRef.current.value = '';
        emailRef.current.value = '';
        mobileNumberRef.current.value = '';
        availabilityRef.current.value = '';
        consultationFeeRef.current.value = '';
        joinedDateRef.current.value = '';
        setSchedules([{ dayOfWeek: '', startTime: '', endTime: '', slotDuration: '' }]);
        setDoctorServices([]);
    };

    return (
        <Container fluid className="p-4">
            <div className="flex gap-3 mb-4">
                <button onClick={() => navigate('/receptionist/doctors-portal')} className="text-success -mt-2">
                    <FaArrowLeft size={20} />
                </button>
                <h2 className="text-left text-2xl font-bold">Register New Doctor</h2>
            </div>
            <ToastContainer />
            <Row className="justify-content-left">
                <Col md={10}>
                    <Form onSubmit={handleSubmit} className="space-y-4">
                        <Row>
                            <Col md={6}>
                                <Form.Group controlId="formFirstName">
                                    <Form.Label className="text-[16px] font-medium leading-[22px] text-left">First Name</Form.Label>
                                    <Form.Control
                                        type="text"
                                        ref={firstNameRef}
                                        placeholder="Enter first name"
                                        className="!border-[#04394F]  rounded-md"
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
                                        className="!border-[#04394F]  rounded-md"
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        <Row>
                            <Col md={6}>
                                <Form.Group controlId="formSpecialty">
                                    <Form.Label className="text-[16px] font-medium leading-[22px] text-left">Specialty</Form.Label>
                                    {/* Conditionally render either the select box or the input based on the specialty state */}
                                    {specialty !== "Others" ? (
                                        <Form.Control
                                            as="select"
                                            ref={specialtyRef}
                                            value={specialty}
                                            onChange={handleSpecialtyChange}
                                            className="!border-[#04394F] rounded-md"
                                        >
                                            <option value="">Select Specialty</option>
                                            <option value="Podiatrist">Podiatrist</option>
                                            <option value="Aesthetics">Aesthetics</option>
                                            <option value="Dermatologist">Dermatologist</option>
                                            <option value="General practitioner">General practitioner</option>
                                            <option value="Orthopedist">Orthopedist</option>
                                            <option value="Cardiologist">Cardiologist</option>
                                            <option value="Neurologist">Neurologist</option>
                                            <option value="Others">Others</option>
                                        </Form.Control>
                                    ) : (
                                        <Form.Control
                                            type="text"
                                            placeholder="Enter specialty"
                                            ref={specialtyRef}
                                            className="!border-[#04394F] rounded-md"
                                        />
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
                                        className="!border-[#04394F]  rounded-md"
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
                                        className="!border-[#04394F]  rounded-md"
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group controlId="formAvailability">
                                    <Form.Label className="text-[16px] font-medium leading-[22px] text-left">Availability</Form.Label>
                                    <Form.Control
                                        as="select"
                                        ref={availabilityRef}
                                        className="!border-[#04394F]  rounded-md"
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
                                        className="!border-[#04394F]  rounded-md"
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group controlId="formJoinedDate">
                                    <Form.Label className="text-[16px] font-medium leading-[22px] text-left">Joined Date</Form.Label>
                                    <Form.Control
                                        type="date"
                                        ref={joinedDateRef}
                                        className="!border-[#04394F]  rounded-md"
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                        <Row>
                            <Col md={6}>
                                <Form.Group >
                                    <Form.Label className="text-[16px] font-medium leading-[22px] text-left">Doctor Username</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Enter Doctor Username"
                                        ref={username}
                                        className="!border-[#04394F] rounded-md"
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group >
                                    <Form.Label className="text-[16px] font-medium leading-[22px] text-left">Doctor Cut Percentage</Form.Label>
                                    <Form.Control
                                        type="number"
                                        placeholder="Enter Doctor Cut Percentage"
                                        ref={doctorPercentage}
                                        className="!border-[#04394F] rounded-md"
                                        onChange={(e) => {
                                            if (e.target.value > 100) {
                                                e.target.value = 100; // Set value to 100 if it exceeds
                                            }
                                        }}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        <h3 className="mb-4 text-left text-xl font-semibold mt-4">Set Doctor's Schedule</h3>
                        {schedules.map((schedule, index) => (
                            <div key={index} className=" !border-[#04394F] p-4 border-[1px] border-solid rounded-md mb-4">
                                <Row>
                                    <Col md={6}>
                                        <Form.Group controlId={`formDayOfWeek-${index}`}>
                                            <Form.Label className="text-[16px] font-medium leading-[22px] text-left">Day of Week</Form.Label>
                                            <Form.Control
                                                as="select"
                                                name="dayOfWeek"
                                                value={schedule.dayOfWeek}
                                                onChange={(e) => handleScheduleChange(e, index)}
                                                className="!border-[#04394F]  rounded-md"
                                            >
                                                <option value="">Select Day</option>
                                                <option value="Monday">Monday</option>
                                                <option value="Tuesday">Tuesday</option>
                                                <option value="Wednesday">Wednesday</option>
                                                <option value="Thursday">Thursday</option>
                                                <option value="Friday">Friday</option>
                                                <option value="Saturday">Saturday</option>
                                                <option value="Sunday">Sunday</option>
                                            </Form.Control>
                                        </Form.Group>
                                    </Col>
                                    <Col md={3}>
                                        <Form.Group controlId={`formStartTime-${index}`}>
                                            <Form.Label className="text-[16px] font-medium leading-[22px] text-left">Start Time</Form.Label>
                                            <Form.Control
                                                type="time"
                                                name="startTime"
                                                value={schedule.startTime}
                                                onChange={(e) => handleScheduleChange(e, index)}
                                                className="!border-[#04394F]  rounded-md"
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={3}>
                                        <Form.Group controlId={`formEndTime-${index}`}>
                                            <Form.Label className="text-[16px] font-medium leading-[22px] text-left">End Time</Form.Label>
                                            <Form.Control
                                                type="time"
                                                name="endTime"
                                                value={schedule.endTime}
                                                onChange={(e) => handleScheduleChange(e, index)}
                                                className="!border-[#04394F]  rounded-md"
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>

                                {/* <Row>
                                    <Col md={6}>
                                        <Form.Group controlId={`formSlotDuration-${index}`}>
                                            <Form.Label className="text-[16px] font-medium leading-[22px] text-left mt-4">Slot Duration (minutes)</Form.Label>
                                            <Form.Control
                                                type="number"
                                                name="slotDuration"
                                                value={schedule.slotDuration}
                                                onChange={(e) => handleScheduleChange(e, index)}
                                                placeholder="Enter slot duration"
                                                className="!border-[#04394F]  rounded-md"
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row> */}
                                <Row>
                                    <Col md={6}>
                                        <Form.Group controlId={`formSlotDuration-${index}`}>
                                            <Form.Label className="text-[16px] font-medium leading-[22px] text-left mt-4">Meeting Duration (minutes)</Form.Label>
                                            <Form.Control
                                                as="select"
                                                name="slotDuration"
                                                value={schedule.slotDuration}
                                                onChange={(e) => handleScheduleChange(e, index)}
                                                className="!border-[#04394F] rounded-md"
                                            >
                                                <option value="">Select Duration</option> {/* Default option */}
                                                <option value="15">15 minutes</option>
                                                <option value="20">20 minutes</option>
                                                <option value="30">30 minutes</option>
                                                <option value="45">45 minutes</option>
                                                <option value="60">60 minutes</option>
                                                <option value="80">80 minutes</option>
                                            </Form.Control>
                                        </Form.Group>
                                    </Col>
                                </Row>
                                <Row className="mt-3">
                                    <Col>
                                        <Button
                                            variant="outline-danger"
                                            onClick={() => removeSchedule(index)}
                                            disabled={schedules.length === 1} // Disable if only one schedule exists
                                            className="w-full"
                                        >
                                            Delete Schedule
                                        </Button>
                                    </Col>
                                </Row>
                            </div>
                        ))}
                        <Row>

                            <Button variant="outline-primary" type="button" onClick={addSchedule} className="w-full max-w-md mx-auto mb-10 mt-2">
                                Add Schedule
                            </Button>

                            <h3 className="mb-4 text-left text-xl font-semibold mt-4">Set Doctor's Services</h3>
                            <Button variant="outline-primary" onClick={() => setShowServiceModal(true)} className="mb-4">
                                Add Doctor Service
                            </Button>

                            {/* Table to show added services */}
                            <Table striped bordered hover responsive>
                                <thead>
                                    <tr>
                                        <th>Service Name</th>
                                        <th>Description</th>
                                        <th>Price</th>
                                        <th>Doctor's Cut (%)</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {doctorServices.length > 0 ? (
                                        doctorServices.map((service, index) => (
                                            <tr key={index}>
                                                <td>{service.serviceName}</td>
                                                <td>{service.description || 'N/A'}</td>
                                                <td>{service.price}</td>
                                                <td>{service.doctorCutPercentage}</td>
                                                <td>
                                                    <Button variant="outline-danger" size='sm' className='!text-xs' onClick={() => deleteService(index)}>
                                                        Delete
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="5" className="text-center">
                                                No services added.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </Table>


                            <Button
                                variant="outline-success"
                                type="submit"
                                className="w-full max-w-md mx-auto"
                                disabled={loading} // Disable the button when loading
                            >
                                {loading ? (
                                    <>
                                        <Spinner
                                            animation="border"
                                            size="sm"
                                            role="status"
                                            aria-hidden="true"
                                            className="me-2"
                                        />
                                        Loading...
                                    </>
                                ) : (
                                    'Register Doctor'
                                )}
                            </Button>
                        </Row>
                    </Form>
                </Col>
            </Row>
            <AdDoctorServiceModal
                show={showServiceModal}
                onHide={() => setShowServiceModal(false)}
                addService={addService}
            />
        </Container>

    );
}

export default AddDoctor;
