import React, { useState, useEffect } from 'react';
import { Button, Col, Form, Modal, Nav, Row, Tab } from "react-bootstrap";

const AddProcedureModal = ({
    show,
    handleClose,
    newProcedure,
    setNewProcedure,
    onAddProcedure,
    loading,
    doctors,
    selectedDoctor,
    setSelectedDoctor,
    doctorDefaultSelected
}) => {
    const [isDiscounted, setIsDiscounted] = useState(false);
    const [discountPercentage, setDiscountPercentage] = useState(null);
    const [discountedAmount, setDiscountedAmount] = useState(newProcedure.Amount);
    const [isDoctorSelected, setIsDoctorSelected] = useState(false); // Track if "Doctor" is selected
    const [isValid, setIsValid] = useState(false);
    const [selectedService, setSelectedService] = useState(null); // For Doctors Tab

        // Initial state values
        const initialProcedureState = {
            ProcedureName: "",
            Amount: "",
            ProcedureDetail: "",
            DoctorID: null,
        };
    

    const resetState = () => {
        setNewProcedure(initialProcedureState);
        setIsDiscounted(false);
        setDiscountPercentage(null);
        setDiscountedAmount(0);
        // setSelectedDoctor(null);
        setSelectedService(null);
        setIsValid(false);
    };

    const onCloseModal = () => {
        resetState();
        handleClose();
    };


    const handleChange = (e) => {
        const { name, value } = e.target;
        setNewProcedure(prev => ({ ...prev, [name]: value }));
    };

    const handleDiscountChange = (e) => {
        const value = Math.min(e.target.value, 100); // Limit percentage to 100%
        setDiscountPercentage(value);
    };

    const handleCheckboxChange = () => {
        setIsDiscounted(!isDiscounted);
    };

    const handleDoctorSelection = () => {
        setIsDoctorSelected(true);
        setNewProcedure(prev => ({ ...prev, DoctorID: selectedDoctor ? selectedDoctor.doctorID : null }));
    };

    const handleClinicSelection = () => {
        setIsDoctorSelected(false);
        setNewProcedure(prev => ({ ...prev, DoctorID: null }));
    };

    useEffect(() => {
        if (isDiscounted && discountPercentage > 0 && newProcedure.Amount) {
            const discount = (newProcedure.Amount * discountPercentage) / 100;
            const newAmount = newProcedure.Amount - discount;
            setDiscountedAmount(newAmount);
        } else {
            setDiscountedAmount(newProcedure.Amount);
        }
    }, [isDiscounted, discountPercentage, newProcedure.Amount]);

    const handleAddProcedure = () => {
        const finalAmount = isDiscounted ? discountedAmount : newProcedure.Amount;
        const procedurePayload = {
            ...newProcedure,
            Amount: finalAmount,
            DoctorID: selectedDoctor ? selectedDoctor?.doctorID : null
        };
        console.log("Procedure Payload: ", procedurePayload);
        onAddProcedure(procedurePayload);
        resetState();
    };

    const handleServiceSelection = (serviceID) => {
        const service = selectedDoctor.doctorServices.find(
            (svc) => svc.doctorServiceID === parseInt(serviceID)
        );
        setSelectedService(service);
        setNewProcedure((prev) => ({
            ...prev,
            ProcedureName: service.serviceName,
            Amount: service.price,
            ProcedureDetail: service.description,
            DoctorServiceID: service.doctorServiceID
        }));
    };

    useEffect(() => {
        const isFormValid =
            newProcedure.ProcedureName &&
            newProcedure.Amount &&
            (!isDiscounted || (discountPercentage >= 0 && discountPercentage <= 100));
        setIsValid(isFormValid);
    }, [newProcedure, isDiscounted, discountPercentage]);

    return (
        <Modal show={show} onHide={onCloseModal} centered>
            <Modal.Header closeButton>
                <Modal.Title>Add Procedure Item</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Tab.Container defaultActiveKey="doctors">
                    <Nav variant="tabs">
                        <Nav.Item>
                            <Nav.Link eventKey="doctors">Doctors</Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link eventKey="others">Others</Nav.Link>
                        </Nav.Item>
                    </Nav>
                    <Tab.Content className="mt-3">


                        <Tab.Pane eventKey="doctors">
                            <Form>
                                <Form.Group controlId="doctorSelection">
                                    <Form.Label>Select Doctor</Form.Label>
                                    <Form.Control
                                        as="select"
                                        value={selectedDoctor?.doctorID || 0}
                                        onChange={(e) => setSelectedDoctor(doctors.find(doc => doc.doctorID === parseInt(e.target.value)))}
                                        required
                                    >
                                        <option value={0} disabled>Select a doctor...</option>
                                        {doctors.map((doctor) => (
                                            <option key={doctor.doctorID} value={doctor.doctorID}>
                                                {doctor.firstName} {doctor.lastName} - ({doctor.specialty})
                                            </option>
                                        ))}
                                    </Form.Control>
                                </Form.Group>

                                {selectedDoctor && (
                                    <Form.Group controlId="serviceSelection" className="mt-3">
                                        <Form.Label>Select Procedure</Form.Label>
                                        <Form.Control
                                            as="select"
                                            value={selectedService?.doctorServiceID || 0}
                                            onChange={(e) => handleServiceSelection(e.target.value)}
                                        >
                                            <option value={0} disabled>Select a service...</option>
                                            {selectedDoctor.doctorServices.map((service) => (
                                                <option key={service.doctorServiceID} value={service.doctorServiceID}>
                                                    {service.serviceName} - Rs. {service.price}
                                                </option>
                                            ))}
                                        </Form.Control>
                                    </Form.Group>
                                )}

                                <Row className="mb-3 mt-3">
                                    <Col>
                                        <Form.Group controlId="procedureName">
                                            <Form.Label>Procedure Name</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="ProcedureName"
                                                value={newProcedure.ProcedureName || ""}
                                                onChange={handleChange}
                                                placeholder="Procedure Name"
                                                disabled={!selectedService}
                                                required
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col>
                                        <Form.Group controlId="amount">
                                            <Form.Label>Amount</Form.Label>
                                            <Form.Control
                                                type="number"
                                                name="Amount"
                                                value={newProcedure.Amount || ""}
                                                onChange={handleChange}
                                                placeholder="Enter amount"
                                                disabled={!selectedService}
                                                required
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>
                                <Form.Group controlId="procedureDetail">
                                    <Form.Label>Procedure Detail</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={3}
                                        name="ProcedureDetail"
                                        value={newProcedure.ProcedureDetail || ""}
                                        onChange={handleChange}
                                        placeholder="Procedure detail"
                                        disabled={!selectedService}
                                    />
                                </Form.Group>

                                <Form.Group controlId="giveDiscount" className="mt-3">
                                    <Form.Check
                                        type="checkbox"
                                        label="Give Discount"
                                        checked={isDiscounted}
                                        onChange={handleCheckboxChange}
                                        disabled={!selectedService}
                                    />
                                </Form.Group>

                                {isDiscounted && (
                                    <Row className="mt-2">
                                        <Col>
                                            <Form.Group controlId="discountPercentage">
                                                <Form.Label>Discount Percentage (%)</Form.Label>
                                                <Form.Control
                                                    type="number"
                                                    value={discountPercentage}
                                                    onChange={handleDiscountChange}
                                                    placeholder="Enter discount percentage"
                                                    max="100"
                                                />
                                            </Form.Group>
                                        </Col>
                                        <Col>
                                            <Form.Group controlId="discountedAmount">
                                                <Form.Label>Amount after Discount</Form.Label>
                                                <Form.Control
                                                    type="number"
                                                    value={discountedAmount}
                                                    readOnly
                                                />
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                )}
                            </Form>
                        </Tab.Pane>



                        <Tab.Pane eventKey="others">

                            <Form>
                                <Row className="mb-3">
                                    <Col>
                                        <Form.Group controlId="procedureName">
                                            <Form.Label>Procedure Name</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="ProcedureName"
                                                value={newProcedure.ProcedureName}
                                                onChange={handleChange}
                                                placeholder="Enter procedure name"
                                                required
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col>
                                        <Form.Group controlId="amount">
                                            <Form.Label>Amount</Form.Label>
                                            <Form.Control
                                                type="number"
                                                name="Amount"
                                                value={newProcedure.Amount}
                                                onChange={handleChange}
                                                placeholder="Enter amount"
                                                required
                                                min="0"
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>
                                <Form.Group controlId="procedureDetail">
                                    <Form.Label>Procedure Detail</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={3}
                                        name="ProcedureDetail"
                                        value={newProcedure.ProcedureDetail}
                                        onChange={handleChange}
                                        placeholder="Enter procedure detail"
                                    />
                                </Form.Group>

                                <Form.Group controlId="giveDiscount" className="mt-3">
                                    <Form.Check
                                        type="checkbox"
                                        label="Give Discount"
                                        checked={isDiscounted}
                                        onChange={handleCheckboxChange}
                                    />
                                </Form.Group>

                                {isDiscounted && (
                                    <Row className="mt-2">
                                        <Col>
                                            <Form.Group controlId="discountPercentage">
                                                <Form.Label>Discount Percentage (%)</Form.Label>
                                                <Form.Control
                                                    type="number"
                                                    value={discountPercentage}
                                                    onChange={handleDiscountChange}
                                                    placeholder="Enter discount percentage"
                                                    max="100"
                                                />
                                            </Form.Group>
                                        </Col>
                                        <Col>
                                            <Form.Group controlId="discountedAmount">
                                                <Form.Label>Amount after Discount</Form.Label>
                                                <Form.Control
                                                    type="number"
                                                    value={discountedAmount}
                                                    readOnly
                                                />
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                )}

                                <Form.Group className="mt-3" controlId="billingType">
                                    <Form.Label>Billing Type</Form.Label>
                                    <div className="d-flex">
                                        <Form.Check
                                            type="radio"
                                            label="Clinic"
                                            name="billingType"
                                            checked={!isDoctorSelected}
                                            onChange={handleClinicSelection}
                                        />
                                        <Form.Check
                                            type="radio"
                                            label="Doctor"
                                            name="billingType"
                                            checked={isDoctorSelected}
                                            onChange={handleDoctorSelection}
                                            className="ml-3"
                                        />
                                    </div>
                                </Form.Group>

                                {isDoctorSelected && (
                                    <Form.Group controlId="doctorSelection" className="mt-2">
                                        <Form.Label>Select Doctor</Form.Label>
                                        <Form.Control
                                            as="select"
                                            className="!border-[#04394F] max-h-40 overflow-auto" // Scrollable dropdown
                                            value={selectedDoctor?.doctorID || 0}
                                            onChange={(e) => setSelectedDoctor(doctors.find(doc => doc.doctorID === parseInt(e.target.value)))}
                                            required
                                            disabled={doctorDefaultSelected}
                                        >
                                            <option value={0} disabled>Select a doctor...</option>
                                            {doctors.map(doctor => (
                                                <option key={doctor.doctorID} value={doctor.doctorID}>
                                                    {doctor.firstName} {doctor.lastName} - ({doctor.specialty})
                                                </option>
                                            ))}
                                        </Form.Control>
                                    </Form.Group>
                                )}
                            </Form>
                        </Tab.Pane>

                    </Tab.Content>
                </Tab.Container>
            </Modal.Body>
            <Modal.Footer>
                <Button disabled={loading} variant="secondary" onClick={handleClose}>
                    Cancel
                </Button>
                <Button disabled={loading || !isValid} variant="primary" onClick={handleAddProcedure}>
                    Add Procedure
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default AddProcedureModal;
