import React, { useEffect, useState } from 'react';
import { Form, Button, Spinner, Container } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import axios from 'axios';
import { toast } from 'react-toastify';

const EditPatientDetails = () => {
    const { patient_id } = useParams();
    const navigate = useNavigate();

    // Separate state variables for each field
    const [firstName, setFirstName] = useState('');
    const [mobileNumber, setMobileNumber] = useState('');
    const [gender, setGender] = useState('');
    const [dateOfBirth, setDateOfBirth] = useState(null);
    const [cnic, setCnic] = useState('');
    const [bloodGroup, setBloodGroup] = useState('');
    const [email, setEmail] = useState('');
    const [medicalHistory, setMedicalHistory] = useState('');

    const [validationErrors, setValidationErrors] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchPatientData = async () => {
            setLoading(true);
            try {
                const response = await axios.get(`https://mustafahasnain36-001-site1.gtempurl.com/api/Receptionist/get-patient-details/${patient_id}`);
                const patientData = response.data;

                if (patientData) {
                    setFirstName(patientData.firstName || '');
                    setMobileNumber(patientData.mobileNumber || '');
                    setGender(patientData.gender || '');
                    setDateOfBirth(patientData.dateOfBirth ? new Date(patientData.dateOfBirth) : null);
                    setCnic(patientData.cnic || '');
                    setBloodGroup(patientData.bloodGroup || '');
                    setEmail(patientData.email || '');
                    setMedicalHistory(patientData.medicalHistory || '');
                } else {
                    setError("Patient not found");
                }
            } catch (err) {
                setError("An error occurred while fetching the patient data");
            } finally {
                setLoading(false);
            }
        };
        fetchPatientData();
    }, [patient_id]);

    const validateForm = () => {
        const errors = {};

        if (!firstName) errors.firstName = 'First Name is required';
        if (!mobileNumber) {
            errors.mobileNumber = 'Mobile Number is required';
        } else if (!/^\d{11}$/.test(mobileNumber)) {
            errors.mobileNumber = 'Mobile Number must be exactly 11 digits';
        }

        if (cnic && !/^\d{13}$/.test(cnic)) {
            errors.cnic = 'CNIC must be exactly 13 digits';
        }

        if (!gender) errors.gender = 'Please select Gender';
        if (!dateOfBirth) errors.dateOfBirth = 'Date of Birth is required';

        if (email && !/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(email)) {
            errors.email = 'Please enter a valid email';
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        const updatedPatient = {
            firstName,
            mobileNumber,
            gender,
            dateOfBirth,
            cnic,
            bloodGroup,
            email,
            medicalHistory
        };

        try {
            setLoading(true);
            await axios.put(`https://mustafahasnain36-001-site1.gtempurl.com/api/Receptionist/patient/${patient_id}`, updatedPatient);
            toast.success("Patient details updated successfully");
            navigate(`/receptionist/patients-details/${patient_id}/`);
        } catch (error) {
            toast.error("Failed to update patient details");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <Spinner animation="border" className="mt-5" />;
    }

    if (error) {
        return <div className="text-red-500 mt-5">{error}</div>;
    }

    return (
        <Container className='pt-3'>
            <h2 className="font-semibold text-2xl">Update Patient Details</h2>
            <Form onSubmit={handleSubmit} className="space-y-4 w-[450px]">
                <Form.Group controlId="formFirstName">
                    <Form.Label>Name</Form.Label>
                    <Form.Control
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="!border-[#04394F]"
                        isInvalid={!!validationErrors.firstName}
                    />
                    <Form.Control.Feedback type="invalid">
                        {validationErrors.firstName}
                    </Form.Control.Feedback>
                </Form.Group>

                <Form.Group controlId="formMobileNumber">
                    <Form.Label>Mobile Number</Form.Label>
                    <Form.Control
                        type="text"
                        value={mobileNumber}
                        onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, ''))}
                        className="!border-[#04394F]"
                        isInvalid={!!validationErrors.mobileNumber}
                    />
                    <Form.Control.Feedback type="invalid">
                        {validationErrors.mobileNumber}
                    </Form.Control.Feedback>
                </Form.Group>

                <Form.Group controlId="formCNIC">
                    <Form.Label>CNIC</Form.Label>
                    <Form.Control
                        type="text"
                        value={cnic}
                        onChange={(e) => setCnic(e.target.value.replace(/\D/g, ''))}
                        className="!border-[#04394F]"
                        isInvalid={!!validationErrors.cnic}
                    />
                    <Form.Control.Feedback type="invalid">
                        {validationErrors.cnic}
                    </Form.Control.Feedback>
                </Form.Group>

                <Form.Group controlId="formGender">
                    <Form.Label>Gender</Form.Label>
                    <div className="d-flex gap-3">
                        <Form.Check
                            type="radio"
                            label="Male"
                            value="Male"
                            checked={gender === "Male"}
                            onChange={(e) => setGender(e.target.value)}
                        />
                        <Form.Check
                            type="radio"
                            label="Female"
                            value="Female"
                            checked={gender === "Female"}
                            onChange={(e) => setGender(e.target.value)}
                        />
                    </div>
                    {validationErrors.gender && <div className="text-red-500 mt-1">{validationErrors.gender}</div>}
                </Form.Group>

                <Form.Group controlId="formBloodGroup">
                    <Form.Label>Blood Group</Form.Label>
                    <Form.Control
                        as="select"
                        value={bloodGroup}
                        onChange={(e) => setBloodGroup(e.target.value)}
                        className="!border-[#04394F]"
                        isInvalid={!!validationErrors.bloodGroup}
                    >
                        <option value="">Select Blood Group</option>
                        <option value="A+">A+</option>
                        <option value="A-">A-</option>
                        <option value="B+">B+</option>
                        <option value="B-">B-</option>
                        <option value="AB+">AB+</option>
                        <option value="AB-">AB-</option>
                        <option value="O+">O+</option>
                        <option value="O-">O-</option>
                    </Form.Control>
                    <Form.Control.Feedback type="invalid">
                        {validationErrors.bloodGroup}
                    </Form.Control.Feedback>
                </Form.Group>

                <Form.Group controlId="formEmail">
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="!border-[#04394F]"
                        isInvalid={!!validationErrors.email}
                    />
                    <Form.Control.Feedback type="invalid">
                        {validationErrors.email}
                    </Form.Control.Feedback>
                </Form.Group>

                <Form.Group controlId="formDateOfBirth" className='flex flex-col'>
                    <Form.Label>Date of Birth</Form.Label>
                    <DatePicker
                        selected={dateOfBirth}
                        onChange={(date) => setDateOfBirth(date)}
                        dateFormat="dd-MM-yyyy"
                        className="form-control !border-[#04394F]"
                    />
                    {validationErrors.dateOfBirth && (
                        <div className="text-red-500 text-sm mt-1">{validationErrors.dateOfBirth}</div>
                    )}
                </Form.Group>

                <Form.Group controlId="formMedicalHistory">
                    <Form.Label>Medical History</Form.Label>
                    <Form.Control
                        as="textarea"
                        rows={3}
                        value={medicalHistory}
                        onChange={(e) => setMedicalHistory(e.target.value)}
                        className="!border-[#04394F]"
                    />
                </Form.Group>

                <Button variant="outline-success" type="submit" disabled={loading}>
                    {loading ? <Spinner animation="border" size="sm" /> : "Update Details"}
                </Button>
            </Form>
        </Container>
    );
};

export default EditPatientDetails;
