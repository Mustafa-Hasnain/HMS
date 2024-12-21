import React, { useEffect, useState } from 'react';
import { Form, Button, Spinner, Container } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaArrowLeft } from 'react-icons/fa';
import { network_url } from '../Network/networkConfig';

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
    const [country, setCountry] = useState('');
    const [state, setState] = useState('');
    const [city, setCity] = useState('');
    const [streetAddress, setStreetAddress] = useState('');
    const [postalCode, setPostalCode] = useState('');
    const [medicalHistory, setMedicalHistory] = useState('');

    const [validationErrors, setValidationErrors] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchPatientData = async () => {
            setLoading(true);
            try {
                const response = await axios.get(`${network_url}/api/Receptionist/get-patient-details/${patient_id}`);
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
                    setCountry(patientData.country || '');
                    setCity(patientData.city || '');
                    setState(patientData.state || '');
                    setStreetAddress(patientData.streetAddress || '');
                    setPostalCode(patientData.postalCode || '');
                    

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

    const [countries, setCountries] = useState([]);
    const [states, setStates] = useState([]);
    const [cities, setCities] = useState([]);

    // Fetch countries on component mount
    useEffect(() => {
        const fetchCountries = async () => {
            try {
                const response = await axios.get("https://countriesnow.space/api/v0.1/countries/states");
                setCountries(response.data.data);
            } catch (error) {
                console.error("Error fetching countries:", error);
            }
        };
        fetchCountries();
    }, []);

    // Fetch states when the country changes
    useEffect(() => {
        if (country) {
            const selectedCountry = countries.find(
                (item) => item.name === country
            );
            setStates(selectedCountry ? selectedCountry.states : []);
            setCities([]);

        }
    }, [country, countries]);

    // Fetch cities when the state changes
    useEffect(() => {
        if (state && country) {
            const fetchCities = async () => {
                try {
                    const response = await axios.post(
                        "https://countriesnow.space/api/v0.1/countries/state/cities",
                        {
                            country: country,
                            state: state
                        }
                    );
                    setCities(response.data.data);
                } catch (error) {
                    console.error("Error fetching cities:", error);
                }
            };
            fetchCities();
        }
    }, [state, country]);


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
            medicalHistory,
            address: "",
            username: "",
            license_no: "",
            country,
            city,
            state,
            streetAddress,
            postalCode
        };

        try {
            setLoading(true);
            await axios.put(`${network_url}/api/Receptionist/patient/${patient_id}`, updatedPatient);
            toast.success("Patient details updated successfully");
            navigate(`/receptionist/patients-details/${patient_id}/`);
        } catch (error) {
            toast.error("Failed to update patient details");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-[450px]">
                <Spinner animation="border" variant="primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </Spinner>
            </div>
        );
    }

    if (error) {
        return <div className="text-red-500 mt-5">{error}</div>;
    }

    return (
        <Container className='pt-3'>
            <div className="flex gap-3 items-center align-middle">
                <button onClick={() => navigate(-1)} className="text-success -mt-2">
                    <FaArrowLeft size={20} />
                </button>
                <h2 className="font-semibold text-2xl">Update Patient Details</h2>
            </div>
            <Form onSubmit={handleSubmit} className="space-y-4 w-[450px] mt-4">
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

                <Form.Group controlId="formCountry">
                    <Form.Label>Country</Form.Label>
                    <Form.Control
                        as="select"
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                    >
                        <option value="">Select Country</option>
                        {countries.map((country, index) => (
                            <option key={index} value={country.name}>
                                {country.name}
                            </option>
                        ))}
                    </Form.Control>
                </Form.Group>

                {/* State */}
                <Form.Group controlId="formState">
                    <Form.Label>State</Form.Label>
                    <Form.Control
                        as="select"
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                    >
                        <option value="">Select State</option>
                        {states.map((state, index) => (
                            <option key={index} value={state.name}>
                                {state.name}
                            </option>
                        ))}
                    </Form.Control>
                </Form.Group>

                {/* City */}
                <Form.Group controlId="formCity">
                    <Form.Label>City</Form.Label>
                    <Form.Control
                        as="select"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                    >
                        <option value="">Select City</option>
                        {cities.map((city, index) => (
                            <option key={index} value={city}>
                                {city}
                            </option>
                        ))}
                    </Form.Control>
                </Form.Group>

                {/* Street Address */}
                <Form.Group controlId="formStreetAddress">
                    <Form.Label>Street Address</Form.Label>
                    <Form.Control
                        type="text"
                        value={streetAddress}
                        onChange={(e) => setStreetAddress(e.target.value)}
                    />
                </Form.Group>

                {/* Postal Code */}
                <Form.Group controlId="formPostalCode">
                    <Form.Label>Postal Code</Form.Label>
                    <Form.Control
                        type="text"
                        value={postalCode}
                        onChange={(e) => setPostalCode(e.target.value)}
                    />
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
