import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Form, Container, Row, Col, Spinner, Modal, Dropdown } from 'react-bootstrap';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import { network_url } from '../Network/networkConfig';
import "../../styles/custom_checkbox.css";
import PrescriptionModal from '../Custom Components/PrescriptionModal';

const labelOptions = [
    "Problem",
    "History",
    "Examination",
    "Family History",
    "Social",
    "Comment",
    "Medication",
    "Follow Up",
    "Procedure",
    "Allergy",
    "Treatment",
    "Precautions"
];

const PrescriptionPage = () => {
    const { patientId, appointmentId, prescriptionId } = useParams();
    const isEditing = Boolean(prescriptionId); // Flag to determine editing or creating
    const [inventoryItems, setInventoryItems] = useState([]);
    const [medicines, setMedicines] = useState([]);
    const [doctorServices, setDoctorServices] = useState([]);
    const [selectedServices, setSelectedServices] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [totalAmount, setTotalAmount] = useState(0);
    const [instructions, setInstructions] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [prescriptionDetails, setPrescriptionDetails] = useState(null);
    const navigate = useNavigate();
    const [patientDetails, setPatientDetails] = useState(null);
    const [medication, setMedication] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [isConsultation, setIsConsultation] = useState(false);
    const [isProcedure, setIsProcedure] = useState(false);
    const [examination, setExamination] = useState("");
    const [labExam, setLabExam] = useState("");
    const [followUp, setFollowUp] = useState("");
    const [prescriptionNotes, setPrescriptionNotes] = useState("");
    const [procedureDetails, setProcedureDetails] = useState("");

    const doctor = JSON.parse(localStorage.getItem('doctor'));
    const doctorId = doctor.doctorID;
    const consultationFee = doctor.consultationFee;

    const [activeFields, setActiveFields] = useState([]);
    const [fieldValues, setFieldValues] = useState({});

    useEffect(() => {
        const fetchData = async () => {
            try {
                if (isEditing) {
                    const { data: prescription } = await axios.get(
                        `${network_url}/api/Prescription/${prescriptionId}`
                    );
                    setPatientDetails(prescription.patient);
                    initializeFieldsFromPrescription(prescription);
                }
                const patientResponse = await fetchPatientDetails(appointmentId, patientId);
                setPatientDetails(patientResponse);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
            finally {
                setIsLoading(false);

            }
        };
        fetchData();
    }, [isEditing, prescriptionId, patientId, appointmentId]);

    const initializeFieldsFromPrescription = (prescription) => {
        const initializedFields = [];
        const initializedValues = {};
        labelOptions.forEach((label) => {
            const fieldKey = label.toLowerCase().replace(/\s+/g, '');
            const hasFieldKey = `has${label.replace(/\s+/g, '')}`;
            if (prescription[hasFieldKey]) {
                initializedFields.push(label);
                initializedValues[label] = prescription[fieldKey] || '';
            }
        });
        setActiveFields(initializedFields);
        setFieldValues(initializedValues);
    };


    const handleAddField = (label) => {
        setActiveFields([...activeFields, label]);
        setFieldValues({ ...fieldValues, [label]: "" });
    };

    const handleRemoveField = (label) => {
        setActiveFields(activeFields.filter((field) => field !== label));
        const updatedValues = { ...fieldValues };
        delete updatedValues[label];
        setFieldValues(updatedValues);
    };

    const handleFieldChange = (label, value) => {
        setFieldValues({ ...fieldValues, [label]: value });
    };


    useEffect(() => {
        const fetchData = async () => {
            try {
                // const inventoryResponse = await axios.get(`${network_url}/api/Inventory`);
                // const servicesResponse = await axios.get(`${network_url}/api/Doctor/Get-service/${doctorId}`);
                const patientResponse = await fetchPatientDetails(appointmentId, patientId);
                // setInventoryItems(inventoryResponse.data);
                // setDoctorServices(servicesResponse.data);
                setPatientDetails(patientResponse);
                setIsLoading(false);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };
        // fetchData();
    }, [doctorId, patientId, appointmentId]);

    const fetchPatientDetails = async (appointmentID, patientID) => {
        try {
            const response = await fetch(`${network_url}/api/Doctor/patient-details/${patientID}`);
            const data = await response.json();
            data.appointmentID = appointmentID;
            return data;
        } catch (error) {
            console.error('Error fetching patient details:', error);
            return null;
        }
    };

    useEffect(() => {
        // Calculate total amount
        const calculateTotalAmount = () => {
            let total = consultationFee; // Start with consultation fee

            // Calculate medicine total
            medicines.forEach(medicine => {
                const item = inventoryItems.find(item => item.inventoryItemID === parseInt(medicine.inventoryItemID));
                if (item) {
                    total += item.price * medicine.quantity;
                }
            });

            // Calculate service total
            selectedServices.forEach(service => {
                total += service.price;
            });

            setTotalAmount(total);
        };

        calculateTotalAmount();
    }, [medicines, selectedServices, inventoryItems, consultationFee]);

    const addMedicine = () => {
        setMedicines([...medicines, { inventoryItemID: '', quantity: 1, instructions: '', days: 1, timesPerDay: 1, timeOfDay: 'Morning' }]);
    };

    const removeMedicine = (index) => {
        setMedicines(medicines.filter((_, i) => i !== index));
    };

    const handleMedicineChange = (e, index) => {
        const { name, value } = e.target;
        const updatedMedicines = medicines.map((medicine, i) =>
            i === index ? { ...medicine, [name]: value } : medicine
        );
        setMedicines(updatedMedicines);
    };

    const handleQuantityChange = (e, index) => {
        const { value } = e.target;
        const medicine = medicines[index];
        const stock = inventoryItems.find(item => item.inventoryItemID === parseInt(medicine.inventoryItemID));
        if (stock && value <= stock.stockQuantity) {
            const updatedMedicines = medicines.map((medicine, i) =>
                i === index ? { ...medicine, quantity: value } : medicine
            );
            setMedicines(updatedMedicines);
        }
    };

    const handleServiceSelection = (e) => {
        const serviceID = parseInt(e.target.value);
        if (!selectedServices.some(s => s.doctorServiceID === serviceID)) {
            const selectedService = doctorServices.find(service => service.doctorServiceID === serviceID);
            setSelectedServices([...selectedServices, selectedService]);
        }
    };

    const removeService = (serviceID) => {
        setSelectedServices(selectedServices.filter(service => service.doctorServiceID !== serviceID));
    };

    // const handleSubmit = async (e) => {
    //     e.preventDefault();
    //     const payload = {
    //         patientID: parseInt(patientId),
    //         doctorID: doctorId,
    //         appointmentID: parseInt(appointmentId),
    //         dateIssued: new Date().toISOString(),
    //         notes: instructions,
    //         prescriptionItems: medicines.map(m => ({
    //             inventoryItemID: parseInt(m.inventoryItemID),
    //             quantity: parseInt(m.quantity),
    //             instructions: m.instructions,
    //             days: m.days,
    //             timesPerDay: m.timesPerDay,
    //             timeOfDay: m.timeOfDay
    //         })),
    //         doctorServices: selectedServices.map(s => ({
    //             doctorServiceID: s.doctorServiceID
    //         }))
    //     };

    //     console.log("Payload", payload);

    //     try {
    //         const response = await axios.post(`${network_url}/api/Prescription/create-prescription-invoice`, payload);
    //         setPrescriptionDetails(response.data); // Set the prescription details
    //         // setShowModal(true); // Show modal on success
    //         navigate('/doctor/prescriptions')
    //     } catch (error) {
    //         console.error('Error submitting prescription:', error);
    //     }
    // };



    // const handleSubmit = async (e) => {
    //     e.preventDefault();

    //     if (!isConsultation && !isProcedure) {
    //         toast.error("Please select at least one option: Consultation or Procedure.");
    //         return;
    //     }

    //     setIsSubmitting(true);

    //     const payload = {
    //         patientID: parseInt(patientId),
    //         doctorID: doctorId,
    //         invoiceID: parseInt(appointmentId),
    //         isForConsultation: isConsultation,
    //         isForProcedure: isProcedure,
    //         examination,
    //         labExam: isConsultation || isProcedure ? labExam : '',
    //         prescriptionNotes: isConsultation ? prescriptionNotes : '',
    //         procedureDetails: isProcedure ? procedureDetails : '',
    //         followUp: isProcedure ? followUp : ''
    //     };

    //     try {
    //         await axios.post(`${network_url}/api/Prescription/create-prescription`, payload);
    //         toast.success('Prescription created successfully!');

    //         // Set the prescription details from state variables to display in the modal
    //         const prescriptionDetails = {
    //             doctor: {
    //                 firstName: JSON.parse(localStorage.getItem('doctor')).firstName,
    //                 lastName: JSON.parse(localStorage.getItem('doctor')).lastName,
    //                 mobileNumber: JSON.parse(localStorage.getItem('doctor')).mobileNumber,
    //                 specialty: JSON.parse(localStorage.getItem('doctor')).specialty,
    //                 // Add any other doctor details as needed
    //             },
    //             patient: {
    //                 firstName: patientDetails.patientDetails.firstName,
    //                 lastName: patientDetails.patientDetails.lastName,
    //                 mobileNumber: patientDetails.patientDetails.mobileNumber,
    //                 gender: patientDetails.patientDetails.gender,
    //                 medicalHistory: patientDetails.patientDetails.medicalHistory,
    //             },
    //             examination,
    //             isForConsultation: isConsultation,
    //             isForProcedure: isProcedure,
    //             labExam: isConsultation || isProcedure ? labExam : '',
    //             prescriptionNotes: isConsultation ? prescriptionNotes : '',
    //             procedureDetails: isProcedure ? procedureDetails : ''
    //         };

    //         setPrescriptionDetails(prescriptionDetails);
    //         console.log("Prescription Details: ", prescriptionDetails)
    //         setShowModal(true); // Show the modal after successful submission

    //     } catch (error) {
    //         console.error("Error submitting prescription:", error);
    //         toast.error("Error submitting prescription!");
    //     } finally {
    //         setIsSubmitting(false);
    //     }
    // };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const invalidFields = activeFields.filter(
            (label) => !fieldValues[label] || fieldValues[label].trim().length < 1
        );

        if (invalidFields.length > 0) {
            toast.error("All active fields must have a value of at least 1 character.");
            return;
        }

        const payload = {
            patientID: parseInt(patientId),
            doctorID: JSON.parse(localStorage.getItem("doctor")).doctorID,
            invoiceID: parseInt(appointmentId),

            // NHS fields with conditional "Has" flags
            hasProblem: !!fieldValues.Problem,
            problem: fieldValues.Problem || "",

            hasHistory: !!fieldValues.History,
            history: fieldValues.History || "",

            hasExamination: !!fieldValues.Examination,
            examination: fieldValues.Examination || "",

            hasFamilyHistory: !!fieldValues.FamilyHistory,
            familyHistory: fieldValues.FamilyHistory || "",

            hasSocial: !!fieldValues.Social,
            social: fieldValues.Social || "",

            hasComment: !!fieldValues.Comment,
            comment: fieldValues.Comment || "",

            hasMedication: !!fieldValues.Medication,
            medication: fieldValues.Medication || "",

            hasFollowUp: !!fieldValues.FollowUp,
            followUp: fieldValues.FollowUp || "",

            hasProcedure: !!fieldValues.ProcedureDetails,
            procedureDetails: fieldValues.ProcedureDetails || "",

            hasAllergy: !!fieldValues.Allergy,
            allergy: fieldValues.Allergy || "",

            hasTreatment: !!fieldValues.Treatment,
            treatment: fieldValues.Treatment || "",

            hasPrecautions: !!fieldValues.Precautions,
            precautions: fieldValues.Precautions || "",
        };

        console.log("PAyload: ", payload);

        try {
            let response = null;
            setIsSubmitting(true);
            if (isEditing) {
                response = await fetch(`${network_url}/api/Prescription/${prescriptionId}`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(payload),
                });

                if (response.ok) {
                    toast.success("Prescription updated successfully!");
                    setActiveFields([]);
                    setFieldValues({});
                }
                else {
                    toast.danger("Error in updating Prescription!");
                }
                // navigate('/doctor/prescriptions');
            }
            else {
                response = await fetch(`${network_url}/api/Prescription/create-prescription`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(payload),
                });

                if (response.ok) {
                    toast.success("Prescription created successfully!");
                    setActiveFields([]);
                    setFieldValues({});
                }
                else {
                    toast.success("Prescription created successfully!");
                }
            }

            if (response.ok) {
                const prescriptionDetails = {
                    doctor: {
                        firstName: JSON.parse(localStorage.getItem('doctor')).firstName,
                        lastName: JSON.parse(localStorage.getItem('doctor')).lastName,
                        mobileNumber: JSON.parse(localStorage.getItem('doctor')).mobileNumber,
                        specialty: JSON.parse(localStorage.getItem('doctor')).specialty,
                        // Add any other doctor details as needed
                    },
                    patient: {
                        firstName: patientDetails.patientDetails.firstName,
                        lastName: patientDetails.patientDetails.lastName,
                        mobileNumber: patientDetails.patientDetails.mobileNumber,
                        gender: patientDetails.patientDetails.gender,
                        medicalHistory: patientDetails.patientDetails.medicalHistory,
                    },
                    hasProblem: !!fieldValues.Problem,
                    problem: fieldValues.Problem || "",

                    hasHistory: !!fieldValues.History,
                    history: fieldValues.History || "",

                    hasExamination: !!fieldValues.Examination,
                    examination: fieldValues.Examination || "",

                    hasFamilyHistory: !!fieldValues.FamilyHistory,
                    familyHistory: fieldValues.FamilyHistory || "",

                    hasSocial: !!fieldValues.Social,
                    social: fieldValues.Social || "",

                    hasComment: !!fieldValues.Comment,
                    comment: fieldValues.Comment || "",

                    hasMedication: !!fieldValues.Medication,
                    medication: fieldValues.Medication || "",

                    hasFollowUp: !!fieldValues.FollowUp,
                    followUp: fieldValues.FollowUp || "",

                    hasProcedure: !!fieldValues.ProcedureDetails,
                    procedureDetails: fieldValues.ProcedureDetails || "",

                    hasAllergy: !!fieldValues.Allergy,
                    allergy: fieldValues.Allergy || "",

                    hasTreatment: !!fieldValues.Treatment,
                    treatment: fieldValues.Treatment || "",

                    hasPrecautions: !!fieldValues.Precautions,
                    precautions: fieldValues.Precautions || "",

                };

                setPrescriptionDetails(prescriptionDetails);
                console.log("Prescription Details: ", prescriptionDetails)
                setShowModal(true);
            }

        } catch (error) {
            console.error("Error submitting prescription:", error);
            toast.error("Error submitting prescription!");
        } finally {
            setIsSubmitting(false);
        }
    };

    const remainingLabels = labelOptions.filter(
        (label) => !activeFields.includes(label)
    );


    if (isLoading) return <Spinner className='mt-4' animation="border" />;

    return (
        <Container>
            <ToastContainer />

            <h2 className="text-2xl font-bold mb-4 pt-2">Create Prescription</h2>
            {patientDetails && (
                <div className="bg-[#F8F8F8] grid grid-cols-1 md:grid-cols-3 gap-4 p-6 mt-4 rounded-md">
                    <div className="patientDetails">
                        <p>Name</p>
                        <h2>{patientDetails.patientDetails.firstName}</h2>
                    </div>
                    <div className="patientDetails">
                        <p>Contact No</p>
                        <h2>{patientDetails.patientDetails.mobileNumber}</h2>
                    </div>
                    <div className="patientDetails">
                        <p>Gender</p>
                        <h2>{patientDetails.patientDetails.gender}</h2>
                    </div>
                    <div className="patientDetails">
                        <p>Doctor Name</p>
                        <h2>{JSON.parse(localStorage.getItem('doctor')).firstName} {JSON.parse(localStorage.getItem('doctor')).lastName}</h2>
                    </div>
                    <div className="patientDetails">
                        <p>Specialty</p>
                        <h2>{JSON.parse(localStorage.getItem('doctor')).specialty}</h2>
                    </div>
                    <div className="patientDetails">
                        <p>Consultation Fee</p>
                        <h2>Rs.{consultationFee}</h2>
                    </div>
                </div>
            )}

            {/* <Form onSubmit={handleSubmit}>
                <h4 className="text-lg font-bold mb-2">Medicines</h4>
                {medicines.map((medicine, index) => (
                    <Row key={index} className="mb-3">
                        <Col md={6}>
                            <Form.Group controlId={`medicine-${index}`}>
                                <Form.Label>Medicine</Form.Label>
                                <Form.Control
                                    as="select"
                                    name="inventoryItemID"
                                    value={medicine.inventoryItemID}
                                    onChange={(e) => handleMedicineChange(e, index)}
                                    className="border rounded-md"
                                >
                                    <option value="">Select Medicine</option>
                                    {inventoryItems
                                        .filter(item => !medicines.some(m => m.inventoryItemID === item.inventoryItemID))
                                        .map(item => (
                                            <option key={item.inventoryItemID} value={item.inventoryItemID}>
                                                {item.name} ({item.description})
                                            </option>
                                        ))}
                                </Form.Control>
                            </Form.Group>
                        </Col>
                        <Col md={4}>
                            <Form.Group controlId={`quantity-${index}`}>
                                <Form.Label>Quantity</Form.Label>
                                <Form.Control
                                    type="number"
                                    name="quantity"
                                    value={medicine.quantity}
                                    onChange={(e) => handleQuantityChange(e, index)}
                                    min="1"
                                    max={inventoryItems.find(item => item.inventoryItemID === parseInt(medicine.inventoryItemID))?.stockQuantity || 1}
                                    className={`border rounded-md ${medicine.quantity > inventoryItems.find(item => item.inventoryItemID === parseInt(medicine.inventoryItemID))?.stockQuantity ? 'border-red-500' : ''}`}
                                />
                            </Form.Group>
                        </Col>
                        <Col md={2} className="d-flex align-items-center">
                            <Button variant="danger" onClick={() => removeMedicine(index)}>
                                Remove
                            </Button>
                        </Col>

                        <Col md={6} className="mt-2">
                            <Form.Group controlId={`instructions-${index}`}>
                                <Form.Label>Instructions</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="instructions"
                                    value={medicine.instructions}
                                    onChange={(e) => handleMedicineChange(e, index)}
                                    className="border rounded-md"
                                    placeholder="Instructions..."
                                />
                            </Form.Group>
                        </Col>
                        <Col md={2} className="mt-2">
                            <Form.Group controlId={`days-${index}`}>
                                <Form.Label>No. of Days</Form.Label>
                                <Form.Control
                                    as="select"
                                    name="days"
                                    value={medicine.days}
                                    onChange={(e) => handleMedicineChange(e, index)}
                                    className="border rounded-md"
                                >
                                    {[...Array(10).keys()].map(i => (
                                        <option key={i + 1} value={i + 1}>{i + 1}</option>
                                    ))}
                                </Form.Control>
                            </Form.Group>
                        </Col>
                        <Col md={2} className="mt-2">
                            <Form.Group controlId={`timesPerDay-${index}`}>
                                <Form.Label>Times per Day</Form.Label>
                                <Form.Control
                                    as="select"
                                    name="timesPerDay"
                                    value={medicine.timesPerDay}
                                    onChange={(e) => handleMedicineChange(e, index)}
                                    className="border rounded-md"
                                >
                                    {[...Array(10).keys()].map(i => (
                                        <option key={i + 1} value={i + 1}>{i + 1}</option>
                                    ))}
                                </Form.Control>
                            </Form.Group>
                        </Col>
                        <Col md={2} className="mt-2">
                            <Form.Group controlId={`timeOfDay-${index}`}>
                                <Form.Label>Time of Day</Form.Label>
                                <Form.Control
                                    as="select"
                                    name="timeOfDay"
                                    value={medicine.timeOfDay}
                                    onChange={(e) => handleMedicineChange(e, index)}
                                    className="border rounded-md"
                                >
                                    {["Morning", "Morning/Evening", "Morning/Night", "Evening", "Night"].map((time, i) => (
                                        <option key={i} value={time}>{time}</option>
                                    ))}
                                </Form.Control>
                            </Form.Group>
                        </Col>
                    </Row>
                ))}
                <Button variant="secondary" onClick={addMedicine}>Add Medicine</Button>

                <Form.Group controlId="instructions" className="mt-4">
                    <Form.Label>Overall Instructions/Notes</Form.Label>
                    <Form.Control
                        as="textarea"
                        rows={3}
                        value={instructions}
                        onChange={(e) => setInstructions(e.target.value)}
                        placeholder="Enter overall instructions..."
                        className="border rounded-md"
                    />
                </Form.Group>

                <h4 className="text-lg font-bold mt-4">Additional Doctor Services</h4>
                <Form.Group controlId="services">
                    <Form.Label>Services</Form.Label>
                    <Form.Control
                        as="select"
                        onChange={handleServiceSelection}
                        className="border rounded-md"
                    >
                        <option value="">Select Service</option>
                        {doctorServices
                            .filter(service => !selectedServices.some(s => s.doctorServiceID === service.doctorServiceID))
                            .map(service => (
                                <option key={service.doctorServiceID} value={service.doctorServiceID}>
                                    {service.serviceName} (${service.price})
                                </option>
                            ))}
                    </Form.Control>
                </Form.Group>

                {selectedServices.map(service => (
                    <Row key={service.doctorServiceID} className="mb-3">
                        <Col md={8}>
                            <div>{service.serviceName} (${service.price})</div>
                        </Col>
                        <Col md={4} className="d-flex justify-content-end">
                            <Button variant="danger" onClick={() => removeService(service.doctorServiceID)}>Remove</Button>
                        </Col>
                    </Row>
                ))}

                <Row className="mt-4">
                    <Col md={8} className="font-bold">
                        Total Amount:
                    </Col>
                    <Col md={4} className="font-bold text-right">
                        Rs.{totalAmount.toFixed(2)}
                    </Col>
                </Row>

                <Button variant="primary" type="submit" className="mt-4">Submit Prescription</Button>
            </Form> */}

            {/* <Form onSubmit={handleSubmit} className="mt-4">
                <div className="mb-4 flex justify-center gap-10">
                    <Form.Check
                        type="checkbox"
                        id="isConsultation"
                        label="Consultation"
                        checked={isConsultation}
                        onChange={() => setIsConsultation(!isConsultation)}
                        className="custom-checkbox"

                    />
                    <Form.Check
                        type="checkbox"
                        id="isProcedure"
                        label="Procedure"
                        checked={isProcedure}
                        onChange={() => setIsProcedure(!isProcedure)}
                        className="custom-checkbox"

                    />
                </div>

                <Form.Group controlId="examination" className="mb-4">
                    <Form.Label>Examination</Form.Label>
                    <Form.Control
                        as="textarea"
                        rows={3}
                        value={examination}
                        onChange={(e) => setExamination(e.target.value)}
                        placeholder="Enter examination details..."
                        className="border rounded-md"
                    />
                </Form.Group>

                {isConsultation && (
                    <>
                        <Form.Group controlId="labExam" className="mb-4">
                            <Form.Label>Lab Exam</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                value={labExam}
                                onChange={(e) => setLabExam(e.target.value)}
                                placeholder="Enter lab exam details..."
                                className="border rounded-md"
                            />
                        </Form.Group>

                        <Form.Group controlId="prescriptionNotes" className="mb-4">
                            <Form.Label>Prescription Notes</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                value={prescriptionNotes}
                                onChange={(e) => setPrescriptionNotes(e.target.value)}
                                placeholder="Enter prescription notes..."
                                className="border rounded-md"
                            />
                        </Form.Group>
                    </>
                )}

                {isProcedure && (
                    <>

                        <Form.Group controlId="procedureDetails" className="mb-4">
                            <Form.Label>Procedure Details</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                value={procedureDetails}
                                onChange={(e) => setProcedureDetails(e.target.value)}
                                placeholder="Enter procedure details..."
                                className="border rounded-md"
                            />
                        </Form.Group>

                        <Form.Group controlId="procedureLabExam" className="mb-4">
                            <Form.Label>Follow Up</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                value={followUp}
                                onChange={(e) => setFollowUp(e.target.value)}
                                placeholder="Enter Follow up details..."
                                className="border rounded-md"
                            />
                        </Form.Group>
                    </>
                )}

                <Button
                    variant="outline-success"
                    className="mt-2 border border-success text-success bg-white hover:!bg-[#00743C] hover:!text-white"
                    type="submit"
                    disabled={isSubmitting || !isConsultation & !isProcedure}
                >
                    {isSubmitting ? (
                        <>
                            <Spinner animation="border" size="sm" /> Submitting...
                        </>
                    ) : (
                        'Submit Prescription'
                    )}
                </Button>
            </Form> */}

            <Form onSubmit={handleSubmit}>
                {activeFields.map((label) => (
                    <div
                        key={label}
                        className="my-3 flex items-center justify-between bg-gray-100 p-3 rounded-md"
                    >
                        <Form.Group controlId={`field-${label}`} className="flex-grow">
                            <Form.Label className="font-semibold">{label}</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                type="text"
                                value={fieldValues[label]}
                                onChange={(e) => handleFieldChange(label, e.target.value)}
                                placeholder={`Enter ${label.toLowerCase()}...`}
                                className="border rounded-md"
                            />
                        </Form.Group>
                        <Button
                            variant="danger"
                            onClick={() => handleRemoveField(label)}
                            className="ml-3 mt-4"
                        >
                            Remove
                        </Button>
                    </div>
                ))}

                <Dropdown className="my-4 !w-full">
                    <Dropdown.Toggle variant="success">
                        Add Field
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                        {remainingLabels.length > 0 ? (
                            remainingLabels.map((label) => (
                                <Dropdown.Item
                                    key={label}
                                    onClick={() => handleAddField(label)}
                                >
                                    {label}
                                </Dropdown.Item>
                            ))
                        ) : (
                            <Dropdown.Item disabled>No fields available</Dropdown.Item>
                        )}
                    </Dropdown.Menu>
                </Dropdown>

                <Button
                    type="submit"
                    variant="outline-success"
                    className="mt-4 w-full"
                    disabled={isSubmitting || activeFields.length === 0}
                >
                    {isSubmitting
                        ? isEditing
                            ? "Updating..."
                            : "Submitting..."
                        : isEditing
                            ? "Update"
                            : "Submit"}
                </Button>
            </Form>

            <PrescriptionModal
                showModal={showModal}
                setShowModal={setShowModal}
                prescriptionDetails={prescriptionDetails}
                examination={examination}
                medication={medication}
                patientDetails={patientDetails}
                openFromPrescriptions={false}
            />

        </Container>
    );
};

export default PrescriptionPage;

